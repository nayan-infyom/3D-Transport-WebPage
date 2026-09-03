import * as THREE from 'three';
import {
  MOBILE_FRAMING,
  PARALLAX_STRENGTH,
  type CameraShot,
  type ShotFrame,
  type ShotKey,
} from '../../config/cameraShots';
import type { ShotSelection } from '../timeline/Director';
import type { Route } from '../vehicle/Route';
import type { VehicleSystem } from '../vehicle/VehicleSystem';

interface AnchorFrame {
  origin: THREE.Vector3;
  forward: THREE.Vector3;
  right: THREE.Vector3;
}

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _posB = new THREE.Vector3();
const _lookB = new THREE.Vector3();
const _right = new THREE.Vector3();
const _fwd = new THREE.Vector3();

const smoothstep = (t: number) => {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * (3 - 2 * x);
};

/**
 * The camera rig.
 *
 * Shots are authored declaratively (see config/cameraShots.ts); this resolves
 * them into world space, cross-fades neighbouring shots so cuts never snap, and
 * then drives the real camera through a critically damped follow so the rig
 * always carries a little inertia. Nothing here allocates per frame.
 */
export class CameraSystem {
  private readonly anchorCache = new Map<string, AnchorFrame>();
  private readonly currentPos = new THREE.Vector3();
  private readonly currentLook = new THREE.Vector3();
  private currentFov = 34;
  private initialised = false;

  /** Set by the runner from the viewport / motion preferences. */
  narrowViewport = false;
  reducedMotion = false;

  constructor(private readonly route: Route, private readonly vehicle: VehicleSystem) {}

  private anchorFrame(anchor: string, along: number): AnchorFrame {
    const key = anchor + ':' + along;
    let frame = this.anchorCache.get(key);
    if (!frame) {
      const distance = this.route.at(anchor as never) + along;
      const origin = this.route.position(distance, new THREE.Vector3());
      const forward = this.route.tangent(distance, new THREE.Vector3());
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3(-forward.z, 0, forward.x);
      frame = { origin, forward, right };
      this.anchorCache.set(key, frame);
    }
    return frame;
  }

  private resolve(frame: ShotFrame, out: THREE.Vector3): THREE.Vector3 {
    const [ox, oy, oz] = frame.offset;
    if (frame.space === 'truck') {
      _fwd.copy(this.vehicle.forward);
      _right.set(-_fwd.z, 0, _fwd.x);
      out.copy(this.vehicle.position);
      out.addScaledVector(_right, ox);
      out.y += oy;
      out.addScaledVector(_fwd, oz);
      return out;
    }
    const anchor = this.anchorFrame(frame.anchor, frame.along ?? 0);
    out.copy(anchor.origin);
    out.addScaledVector(anchor.right, ox);
    out.y += oy;
    out.addScaledVector(anchor.forward, oz);
    return out;
  }

  private evaluateShot(
    shot: CameraShot,
    t: number,
    outPos: THREE.Vector3,
    outLook: THREE.Vector3
  ): number {
    const keys = shot.keys;
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a: ShotKey = keys[i];
    const b: ShotKey = keys[i + 1] ?? a;
    const span = b.t - a.t;
    const local = span > 1e-6 ? smoothstep((t - a.t) / span) : 0;

    this.resolve(a.pos, outPos);
    this.resolve(b.pos, _posB);
    outPos.lerp(_posB, local);

    this.resolve(a.look, outLook);
    this.resolve(b.look, _lookB);
    outLook.lerp(_lookB, local);

    return THREE.MathUtils.lerp(a.fov, b.fov, local);
  }

  update(camera: THREE.PerspectiveCamera, selection: ShotSelection, dt: number, elapsed: number) {
    const { shot, previous } = selection;

    let fov = this.evaluateShot(shot, selection.t, _pos, _look);

    if (previous && selection.blend < 1) {
      const prevFov = this.evaluateShot(previous, selection.previousT, _posB, _lookB);
      _pos.lerp(_posB, 1 - selection.blend);
      _look.lerp(_lookB, 1 - selection.blend);
      fov = THREE.MathUtils.lerp(prevFov, fov, selection.blend);
    }

    // Narrow viewports need the subject further away and a wider lens or the
    // framing crops into the truck instead of showing the world around it.
    if (this.narrowViewport) {
      _pos.sub(_look).multiplyScalar(MOBILE_FRAMING.pullback).add(_look);
      _pos.y += MOBILE_FRAMING.lift;
      fov += MOBILE_FRAMING.fovBoost;
    }

    if (!this.reducedMotion) {
      const parallax = PARALLAX_STRENGTH * (this.narrowViewport ? 0.35 : 1);
      _fwd.copy(_look).sub(_pos).setY(0).normalize();
      _right.set(-_fwd.z, 0, _fwd.x);
      _pos.addScaledVector(_right, this.pointerX * parallax);
      _pos.y += this.pointerY * parallax * 0.4;

      // Road vibration transmitted through the rig.
      const shake = (shot.shake ?? 0.5) * Math.min(1, Math.abs(this.vehicle.displaySpeed) / 18);
      if (shake > 0.001) {
        _pos.x += Math.sin(elapsed * 31.3) * 0.0055 * shake;
        _pos.y += Math.cos(elapsed * 27.7) * 0.0075 * shake;
        _pos.z += Math.sin(elapsed * 19.1) * 0.004 * shake;
      }
    }

    if (!this.initialised) {
      this.currentPos.copy(_pos);
      this.currentLook.copy(_look);
      this.currentFov = fov;
      this.initialised = true;
    }

    const posLambda = (shot.damping ?? 1.4) * 2.6;
    const lookLambda = (shot.lookDamping ?? shot.damping ?? 1.4) * 3.2;
    this.currentPos.lerp(_pos, 1 - Math.exp(-posLambda * dt));
    this.currentLook.lerp(_look, 1 - Math.exp(-lookLambda * dt));
    this.currentFov = THREE.MathUtils.lerp(this.currentFov, fov, 1 - Math.exp(-3 * dt));

    camera.position.copy(this.currentPos);
    camera.up.set(0, 1, 0);
    camera.lookAt(this.currentLook);
    if (Math.abs(camera.fov - this.currentFov) > 0.001) {
      camera.fov = this.currentFov;
      camera.updateProjectionMatrix();
    }
  }

  pointerX = 0;
  pointerY = 0;
}
