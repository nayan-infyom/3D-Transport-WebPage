import * as THREE from 'three';
import type { Route } from '../vehicle/Route';

export interface RibbonOptions {
  start: number;
  end: number;
  /** Distance between generated cross-sections, metres. */
  step: number;
  /** Lateral offsets of the two edges, in metres (right-hand positive). */
  left: number;
  right: number;
  /** Height above the path at the left and right edge. */
  heightLeft?: number;
  heightRight?: number;
  /** Absolute world Y for an edge, overriding the path-relative height. */
  absoluteLeftY?: number;
  absoluteRightY?: number;
  /** Metres of road per V tile. */
  uvLength: number;
  /** Mirror the U coordinate (for the opposite carriageway). */
  mirror?: boolean;
  /** Fade the ribbon's width to zero over this many metres at each end. */
  taper?: number;
}

const _p = new THREE.Vector3();
const _t = new THREE.Vector3();
const _r = new THREE.Vector3();

/**
 * Extrudes a strip along the route.
 *
 * One of these is a kilometre of road, a guardrail beam or a painted apron edge
 * - a single BufferGeometry and therefore a single draw call, rather than
 * hundreds of tiled planes fighting each other for z-order.
 */
export function buildRibbon(route: Route, options: RibbonOptions): THREE.BufferGeometry {
  const {
    start,
    end,
    step,
    left,
    right,
    heightLeft = 0,
    heightRight = 0,
    absoluteLeftY,
    absoluteRightY,
    uvLength,
    taper = 0,
    mirror = false,
  } = options;

  const span = end - start;
  const segments = Math.max(1, Math.ceil(span / step));
  const count = segments + 1;

  const positions = new Float32Array(count * 2 * 3);
  const uvs = new Float32Array(count * 2 * 2);
  const indices = new Uint32Array(segments * 6);

  for (let i = 0; i < count; i++) {
    const s = start + (span * i) / segments;
    route.position(s, _p);
    route.tangent(s, _t);
    _r.set(-_t.z, 0, _t.x).normalize();

    let width = 1;
    if (taper > 0) {
      width = Math.min(1, (s - start) / taper, (end - s) / taper);
      width = Math.max(0, width);
      width = width * width * (3 - 2 * width);
    }

    const li = i * 6;
    positions[li] = _p.x + _r.x * left * width;
    positions[li + 1] = absoluteLeftY ?? _p.y + heightLeft;
    positions[li + 2] = _p.z + _r.z * left * width;
    positions[li + 3] = _p.x + _r.x * right * width;
    positions[li + 4] = absoluteRightY ?? _p.y + heightRight;
    positions[li + 5] = _p.z + _r.z * right * width;

    const ui = i * 4;
    const v = s / uvLength;
    uvs[ui] = mirror ? 1 : 0;
    uvs[ui + 1] = v;
    uvs[ui + 2] = mirror ? 0 : 1;
    uvs[ui + 3] = v;

    if (i < segments) {
      const o = i * 6;
      const a = i * 2;
      indices[o] = a;
      indices[o + 1] = a + 1;
      indices[o + 2] = a + 2;
      indices[o + 3] = a + 1;
      indices[o + 4] = a + 3;
      indices[o + 5] = a + 2;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * A vertical wall following the route - guardrail beams, median barriers,
 * dock edges.
 */
export function buildWall(
  route: Route,
  options: { start: number; end: number; step: number; offset: number; bottom: number; top: number; uvLength: number }
): THREE.BufferGeometry {
  const { start, end, step, offset, bottom, top, uvLength } = options;
  const span = end - start;
  const segments = Math.max(1, Math.ceil(span / step));
  const count = segments + 1;

  const positions = new Float32Array(count * 2 * 3);
  const uvs = new Float32Array(count * 2 * 2);
  const indices = new Uint32Array(segments * 6);

  for (let i = 0; i < count; i++) {
    const s = start + (span * i) / segments;
    route.position(s, _p);
    route.tangent(s, _t);
    _r.set(-_t.z, 0, _t.x).normalize();

    const x = _p.x + _r.x * offset;
    const z = _p.z + _r.z * offset;
    const li = i * 6;
    positions[li] = x;
    positions[li + 1] = _p.y + bottom;
    positions[li + 2] = z;
    positions[li + 3] = x;
    positions[li + 4] = _p.y + top;
    positions[li + 5] = z;

    const ui = i * 4;
    const u = s / uvLength;
    uvs[ui] = u;
    uvs[ui + 1] = 0;
    uvs[ui + 2] = u;
    uvs[ui + 3] = 1;

    if (i < segments) {
      const o = i * 6;
      const a = i * 2;
      indices[o] = a;
      indices[o + 1] = a + 2;
      indices[o + 2] = a + 1;
      indices[o + 3] = a + 1;
      indices[o + 4] = a + 2;
      indices[o + 5] = a + 3;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export interface Placement {
  position: THREE.Vector3;
  rotationY: number;
  scale: THREE.Vector3 | number;
}

const _matrix = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scaleVec = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

/** Writes placements into an InstancedMesh in one pass. */
export function applyPlacements(mesh: THREE.InstancedMesh, placements: Placement[]) {
  for (let i = 0; i < placements.length; i++) {
    const p = placements[i];
    _quat.setFromAxisAngle(_up, p.rotationY);
    if (typeof p.scale === 'number') _scaleVec.setScalar(p.scale);
    else _scaleVec.copy(p.scale);
    _matrix.compose(p.position, _quat, _scaleVec);
    mesh.setMatrixAt(i, _matrix);
  }
  mesh.count = placements.length;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

/** Deterministic pseudo-random so the world is identical on every load. */
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Scatters placements along a stretch of route, offset to either side. */
export function scatterAlongRoute(
  route: Route,
  options: {
    start: number;
    end: number;
    count: number;
    minOffset: number;
    maxOffset: number;
    seed: number;
    minScale?: number;
    maxScale?: number;
    /** Both sides by default; set to 1 or -1 to pick one. */
    side?: 1 | -1 | 0;
    jitter?: number;
    /** Ground height correction as a function of lateral offset, in metres. */
    elevation?: (lateral: number) => number;
  }
): Placement[] {
  const {
    start,
    end,
    count,
    minOffset,
    maxOffset,
    seed,
    minScale = 0.8,
    maxScale = 1.3,
    side = 0,
    jitter = 0.6,
    elevation,
  } = options;

  const rand = seededRandom(seed);
  const placements: Placement[] = [];
  const span = end - start;
  if (span <= 0 || count <= 0) return placements;

  for (let i = 0; i < count; i++) {
    const base = start + (span * i) / count;
    const s = base + (rand() - 0.5) * (span / count) * 2 * jitter;
    const dir = side !== 0 ? side : rand() > 0.5 ? 1 : -1;
    const lateral = dir * (minOffset + rand() * (maxOffset - minOffset));
    const position = route.offsetPosition(s, lateral, new THREE.Vector3());
    if (elevation) position.y += elevation(lateral);
    placements.push({
      position,
      rotationY: rand() * Math.PI * 2,
      scale: minScale + rand() * (maxScale - minScale),
    });
  }
  return placements;
}
