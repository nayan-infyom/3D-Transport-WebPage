import * as THREE from 'three';
import { ROUTE_WAYPOINTS, type RouteAnchor } from '../../config/route';

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/**
 * Arc-length parameterised journey path.
 *
 * A CatmullRomCurve3 is fine for defining shape but its `t` parameter is not
 * proportional to distance, which makes speed control and wheel rotation wrong.
 * This wraps it in a precomputed distance lookup table so every query is a
 * binary search plus a lerp - cheap, and crucially allocation-free at frame
 * time (all accessors write into caller-supplied vectors).
 */
export class Route {
  readonly curve: THREE.CatmullRomCurve3;
  readonly length: number;

  private readonly positions: Float32Array;
  private readonly tangents: Float32Array;
  private readonly distances: Float32Array;
  private readonly sampleCount: number;
  private readonly anchors = new Map<RouteAnchor, number>();

  constructor(samplesPerSegment = 26) {
    const points = ROUTE_WAYPOINTS.map((w) => new THREE.Vector3(...w.position));
    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);

    const segments = points.length - 1;
    this.sampleCount = segments * samplesPerSegment + 1;

    this.positions = new Float32Array(this.sampleCount * 3);
    this.tangents = new Float32Array(this.sampleCount * 3);
    this.distances = new Float32Array(this.sampleCount);

    // 1. Sample positions and accumulate arc length.
    let accumulated = 0;
    for (let i = 0; i < this.sampleCount; i++) {
      const t = i / (this.sampleCount - 1);
      this.curve.getPoint(t, _a);
      if (i > 0) {
        _b.fromArray(this.positions, (i - 1) * 3);
        accumulated += _a.distanceTo(_b);
      }
      _a.toArray(this.positions, i * 3);
      this.distances[i] = accumulated;
    }
    this.length = accumulated;

    // 2. Central-difference tangents (more stable near the ends than getTangent).
    for (let i = 0; i < this.sampleCount; i++) {
      const prev = Math.max(0, i - 1);
      const next = Math.min(this.sampleCount - 1, i + 1);
      _a.fromArray(this.positions, next * 3);
      _b.fromArray(this.positions, prev * 3);
      _a.sub(_b);
      if (_a.lengthSq() < 1e-10) _a.set(0, 0, 1);
      _a.normalize().toArray(this.tangents, i * 3);
    }

    // 3. Resolve named anchors to arc-length distances.
    ROUTE_WAYPOINTS.forEach((w, index) => {
      if (!w.anchor) return;
      const t = index / segments;
      const sampleIndex = Math.round(t * (this.sampleCount - 1));
      this.anchors.set(w.anchor, this.distances[sampleIndex]);
    });
  }

  /** Arc-length distance (metres) of a named waypoint. */
  at(anchor: RouteAnchor): number {
    const d = this.anchors.get(anchor);
    if (d === undefined) throw new Error('Unknown route anchor: ' + anchor);
    return d;
  }

  private indexFor(distance: number): number {
    const d = THREE.MathUtils.clamp(distance, 0, this.length);
    let lo = 0;
    let hi = this.sampleCount - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.distances[mid] <= d) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  /** World position at an arc-length distance. Writes into `out`. */
  position(distance: number, out: THREE.Vector3): THREE.Vector3 {
    const i = this.indexFor(distance);
    const j = Math.min(i + 1, this.sampleCount - 1);
    const span = this.distances[j] - this.distances[i];
    const clamped = THREE.MathUtils.clamp(distance, 0, this.length);
    const f = span > 1e-6 ? (clamped - this.distances[i]) / span : 0;
    out.set(
      THREE.MathUtils.lerp(this.positions[i * 3], this.positions[j * 3], f),
      THREE.MathUtils.lerp(this.positions[i * 3 + 1], this.positions[j * 3 + 1], f),
      THREE.MathUtils.lerp(this.positions[i * 3 + 2], this.positions[j * 3 + 2], f)
    );
    // Extrapolate past the ends so the rig can sit "before" the start while parked.
    if (distance < 0 || distance > this.length) {
      this.tangent(clamped, _a);
      out.addScaledVector(_a, distance - clamped);
    }
    return out;
  }

  /** Unit forward direction at an arc-length distance. Writes into `out`. */
  tangent(distance: number, out: THREE.Vector3): THREE.Vector3 {
    const i = this.indexFor(distance);
    const j = Math.min(i + 1, this.sampleCount - 1);
    const span = this.distances[j] - this.distances[i];
    const clamped = THREE.MathUtils.clamp(distance, 0, this.length);
    const f = span > 1e-6 ? (clamped - this.distances[i]) / span : 0;
    out.set(
      THREE.MathUtils.lerp(this.tangents[i * 3], this.tangents[j * 3], f),
      THREE.MathUtils.lerp(this.tangents[i * 3 + 1], this.tangents[j * 3 + 1], f),
      THREE.MathUtils.lerp(this.tangents[i * 3 + 2], this.tangents[j * 3 + 2], f)
    );
    return out.normalize();
  }

  /**
   * Signed horizontal curvature (1/m); positive turns left. Used to derive
   * steering angle and lateral load transfer instead of faking it with a sine.
   */
  curvature(distance: number, sample = 6): number {
    this.tangent(distance - sample, _a);
    const a0 = Math.atan2(_a.x, _a.z);
    this.tangent(distance + sample, _a);
    const a1 = Math.atan2(_a.x, _a.z);
    const wrapped = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
    return wrapped / (sample * 2);
  }

  /** Position offset laterally from the path (right-hand positive). */
  offsetPosition(distance: number, lateral: number, out: THREE.Vector3): THREE.Vector3 {
    this.position(distance, out);
    this.tangent(distance, _a);
    // right = forward x up
    _b.set(-_a.z, 0, _a.x).normalize();
    return out.addScaledVector(_b, lateral);
  }

  /** Yaw (radians) of the path at a given distance. */
  heading(distance: number): number {
    this.tangent(distance, _a);
    return Math.atan2(_a.x, _a.z);
  }
}

let singleton: Route | null = null;

export function getRoute(): Route {
  if (!singleton) singleton = new Route();
  return singleton;
}
