import * as THREE from 'three';
import { MAX_VEHICLE_SPEED, VEHICLE_FOLLOW_STIFFNESS, COUPLING_END } from '../../config/timeline';
import type { Director } from '../timeline/Director';
import type { Route } from './Route';

/* Geometry of the modelled rig, in metres. These are read off the actual
 * TractorCab / Trailer53ft meshes, so the kinematics and the art agree. */
export const RIG = {
  wheelRadius: 0.52,
  /** Steer axle to drive-tandem centre. */
  wheelbase: 3.875,
  /** Tractor origin forward to drive-tandem centre. */
  driveAxleOffset: 1.125,
  /** Tractor origin forward to the fifth wheel. */
  hitchOffset: 1.1,
  /** Kingpin to trailer-tandem centre. */
  trailerWheelbase: 8.775,
  /** Trailer origin forward to the kingpin. */
  trailerKingpinOffset: 1.1,
  /** Trailer origin forward to the trailer tandem centre (negative = behind). */
  trailerAxleOffset: -7.675,
  maxSteer: 0.55,
  /** Legibility gain on the steer angle (see the steering block below). */
  steerVisualGain: 1.65,
};

export interface VehicleObjects {
  tractorRoot: THREE.Object3D | null;
  tractorBody: THREE.Object3D | null;
  trailerRoot: THREE.Object3D | null;
  trailerBody: THREE.Object3D | null;
}

export interface VehicleEvents {
  coupled: boolean;
  airBrake: boolean;
  engineStart: boolean;
}

const _rear = new THREE.Vector3();
const _front = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _fwdFlat = new THREE.Vector3();
const _hitch = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _tmp = new THREE.Vector3();
const _prevAxle = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));

/**
 * The vehicle.
 *
 * Everything here is derived from one scalar - distance travelled along the
 * route - so nothing can drift out of sync: the wheels roll exactly as far as
 * the truck moves (no sliding, ever), the steering angle comes from the real
 * curvature of the road under the front axle, and the trailer is solved with a
 * proper kingpin constraint rather than copying the tractor's rotation.
 */
export class VehicleSystem {
  readonly objects: VehicleObjects = {
    tractorRoot: null,
    tractorBody: null,
    trailerRoot: null,
    trailerBody: null,
  };

  readonly events: VehicleEvents = { coupled: false, airBrake: false, engineStart: false };

  /* Public read-only state, consumed by the camera, audio and UI. */
  readonly position = new THREE.Vector3();
  readonly forward = new THREE.Vector3(0, 0, 1);
  readonly trailerPosition = new THREE.Vector3();

  distance = 0;
  speed = 0;
  displaySpeed = 0;
  accel = 0;
  steer = 0;
  yaw = 0;
  pitch = 0;
  curvature = 0;
  articulation = 0;
  coupled = false;
  couplingLatch = 0;
  engineRpm = 520;
  engineLoad = 0;
  reducedMotion = false;

  private readonly trailerAxle = new THREE.Vector3();
  private wheelAngle = 0;
  private trailerWheelAngle = 0;
  private smoothAccel = 0;
  private brakeCooldown = 0;
  private hasLatched = false;
  private hasStarted = false;
  private initialised = false;
  private time = 0;

  constructor(private readonly route: Route, private readonly director: Director) {}

  get wheelRotation(): number {
    return this.wheelAngle;
  }

  get trailerWheelRotation(): number {
    return this.trailerWheelAngle;
  }

  /** Park the trailer at the origin dock and stand the tractor off ahead of it. */
  reset(progress: number) {
    this.distance = this.director.tractorTargetDistance(progress);
    const dock = this.director.dockDistance;
    this.route.position(dock, _hitch);
    this.route.tangent(dock, _fwdFlat);
    _fwdFlat.y = 0;
    _fwdFlat.normalize();
    this.trailerAxle.copy(_hitch).addScaledVector(_fwdFlat, -RIG.trailerWheelbase);
    this.trailerAxle.y = this.route.position(dock - RIG.trailerWheelbase, _tmp).y;
    this.initialised = true;
  }

  update(dt: number, progress: number) {
    if (!this.initialised) this.reset(progress);
    this.time += dt;

    this.events.coupled = false;
    this.events.airBrake = false;
    this.events.engineStart = false;

    /* ---------------------------------------------------------------- */
    /* 1. Longitudinal motion                                            */
    /* ---------------------------------------------------------------- */
    const target = this.director.tractorTargetDistance(progress);
    const delta = target - this.distance;
    let step = delta * (1 - Math.exp(-VEHICLE_FOLLOW_STIFFNESS * dt));
    const maxStep = MAX_VEHICLE_SPEED * dt;
    step = THREE.MathUtils.clamp(step, -maxStep, maxStep);
    this.distance += step;

    const rawSpeed = step / dt;
    this.speed = rawSpeed;
    const previousDisplay = this.displaySpeed;
    this.displaySpeed = damp(this.displaySpeed, rawSpeed, 7, dt);
    const instantAccel = (this.displaySpeed - previousDisplay) / dt;
    this.smoothAccel = damp(this.smoothAccel, instantAccel, 5, dt);
    this.accel = this.smoothAccel;

    /* ---------------------------------------------------------------- */
    /* 2. Tractor pose from the path                                     */
    /* ---------------------------------------------------------------- */
    this.route.position(this.distance, _rear);
    this.route.position(this.distance + RIG.wheelbase, _front);
    _fwd.copy(_front).sub(_rear);
    if (_fwd.lengthSq() < 1e-8) this.route.tangent(this.distance, _fwd);
    _fwd.normalize();
    _fwdFlat.set(_fwd.x, 0, _fwd.z).normalize();

    this.yaw = Math.atan2(_fwdFlat.x, _fwdFlat.z);
    this.pitch = -Math.asin(THREE.MathUtils.clamp(_fwd.y, -1, 1));
    this.forward.copy(_fwdFlat);

    const tractor = this.objects.tractorRoot;
    if (tractor) {
      tractor.position.copy(_rear).addScaledVector(_fwd, -RIG.driveAxleOffset);
      _euler.set(this.pitch, this.yaw, 0);
      tractor.rotation.copy(_euler);
      this.position.copy(tractor.position);
    } else {
      this.position.copy(_rear).addScaledVector(_fwd, -RIG.driveAxleOffset);
    }

    /* ---------------------------------------------------------------- */
    /* 3. Steering, straight off the road's curvature                     */
    /* ---------------------------------------------------------------- */
    this.curvature = this.route.curvature(this.distance + RIG.wheelbase * 0.5, 5);
    // Bicycle model. The modelled tractor has a short wheelbase, so the honest
    // angle is only a few degrees on a highway curve; a modest gain keeps the
    // wheels legibly turning into the bend without ever inventing a direction.
    let steerTarget = Math.atan(this.curvature * RIG.wheelbase) * RIG.steerVisualGain;
    if (!this.reducedMotion && Math.abs(rawSpeed) > 1) {
      // A driver never holds a perfectly dead wheel. Tiny, speed-scaled only.
      steerTarget += Math.sin(this.time * 0.7) * 0.004 + Math.sin(this.time * 1.9) * 0.002;
    }
    steerTarget = THREE.MathUtils.clamp(steerTarget, -RIG.maxSteer, RIG.maxSteer);
    this.steer = damp(this.steer, steerTarget, 7, dt);

    /* ---------------------------------------------------------------- */
    /* 4. Wheels roll by distance travelled - never by a guessed speed    */
    /* ---------------------------------------------------------------- */
    this.wheelAngle += step / RIG.wheelRadius;

    /* ---------------------------------------------------------------- */
    /* 5. Coupling and the kingpin constraint                             */
    /* ---------------------------------------------------------------- */
    const wasCoupled = this.coupled;
    this.coupled = this.director.isCoupled(progress);
    this.couplingLatch = damp(this.couplingLatch, this.coupled ? 1 : 0, 8, dt);

    if (this.coupled && !wasCoupled && !this.hasLatched) {
      this.events.coupled = true;
      this.hasLatched = true;
    }
    if (progress < COUPLING_END * 0.5) this.hasLatched = false;

    _hitch.copy(this.position).addScaledVector(_fwdFlat, RIG.hitchOffset);
    _hitch.y = _rear.y;

    _prevAxle.copy(this.trailerAxle);

    if (this.coupled) {
      _dir.copy(_hitch).sub(this.trailerAxle);
      _dir.y = 0;
      const len = _dir.length();
      if (len < 1e-5 || len > RIG.trailerWheelbase * 2.5) {
        // Recover from a scrollbar flick without a visible snap-back loop.
        _dir.copy(_fwdFlat);
      } else {
        _dir.divideScalar(len);
      }

      // Clamp the articulation so a fast scrub can never jack-knife the rig.
      const relative = Math.atan2(_dir.x, _dir.z) - this.yaw;
      const wrapped = Math.atan2(Math.sin(relative), Math.cos(relative));
      const limited = THREE.MathUtils.clamp(wrapped, -1.15, 1.15);
      if (limited !== wrapped) {
        const angle = this.yaw + limited;
        _dir.set(Math.sin(angle), 0, Math.cos(angle));
      }
      this.articulation = limited;

      this.trailerAxle.copy(_hitch).addScaledVector(_dir, -RIG.trailerWheelbase);
      this.trailerAxle.y = this.route.position(
        this.distance - (RIG.trailerWheelbase - RIG.hitchOffset + RIG.driveAxleOffset),
        _tmp
      ).y;
    } else {
      // Parked: the trailer holds the dock pose until the kingpin locks.
      this.articulation = 0;
      const dock = this.director.dockDistance;
      this.route.position(dock, _tmp);
      this.route.tangent(dock, _dir);
      _dir.y = 0;
      _dir.normalize();
      this.trailerAxle.copy(_tmp).addScaledVector(_dir, -RIG.trailerWheelbase);
      this.trailerAxle.y = this.route.position(dock - RIG.trailerWheelbase, _tmp).y;
    }

    const trailer = this.objects.trailerRoot;
    const trailerYaw = Math.atan2(_dir.x, _dir.z);
    if (trailer) {
      if (this.coupled) {
        trailer.position.copy(_hitch).addScaledVector(_dir, -RIG.trailerKingpinOffset);
      } else {
        this.route.position(this.director.dockDistance, _tmp);
        trailer.position.copy(_tmp).addScaledVector(_dir, -RIG.trailerKingpinOffset);
      }
      const rise = _hitch.y - this.trailerAxle.y;
      const trailerPitch = -Math.atan2(rise, RIG.trailerWheelbase);
      _euler.set(trailerPitch, trailerYaw, 0);
      trailer.rotation.copy(_euler);
      this.trailerPosition.copy(trailer.position);
    }

    // Trailer wheels roll by the distance the trailer's own axle travelled.
    _tmp.copy(this.trailerAxle).sub(_prevAxle);
    const trailerStep = _tmp.length() * Math.sign(_tmp.dot(_dir) || 1);
    this.trailerWheelAngle += trailerStep / RIG.wheelRadius;

    /* ---------------------------------------------------------------- */
    /* 6. Body: suspension, load transfer, engine idle                    */
    /* ---------------------------------------------------------------- */
    const motion = this.reducedMotion ? 0.25 : 1;
    const speedNorm = THREE.MathUtils.clamp(Math.abs(this.displaySpeed) / 26, 0, 1.4);
    const idle = 1 - THREE.MathUtils.clamp(Math.abs(this.displaySpeed) / 4, 0, 1);

    const t = this.time;
    const engineVibe = (Math.sin(t * 46) * 0.0016 + Math.sin(t * 71) * 0.0009) * (0.45 + idle * 0.9);
    const roadBounce =
      (Math.sin(t * 8.4) * 0.0055 + Math.cos(t * 5.1) * 0.0038 + Math.sin(t * 13.7) * 0.0021) *
      speedNorm;

    const lateralAccel = this.displaySpeed * this.displaySpeed * this.curvature;
    const rollTarget = THREE.MathUtils.clamp(lateralAccel * 0.0075, -0.05, 0.05);
    const pitchTarget = THREE.MathUtils.clamp(-this.accel * 0.006, -0.045, 0.045);

    const body = this.objects.tractorBody;
    if (body) {
      body.position.y = (engineVibe + roadBounce) * motion;
      body.rotation.x = damp(body.rotation.x, pitchTarget * motion, 6, dt) + engineVibe * 0.35 * motion;
      body.rotation.z = damp(body.rotation.z, rollTarget * motion, 5, dt);
    }

    const trailerBody = this.objects.trailerBody;
    if (trailerBody) {
      trailerBody.position.y = roadBounce * 0.7 * motion;
      trailerBody.rotation.x = damp(trailerBody.rotation.x, -pitchTarget * 0.55 * motion, 4, dt);
      trailerBody.rotation.z = damp(trailerBody.rotation.z, rollTarget * 1.15 * motion, 3.5, dt);
    }

    /* ---------------------------------------------------------------- */
    /* 7. Drivetrain state for the audio engine                           */
    /* ---------------------------------------------------------------- */
    const gearSpan = 6.2;
    const gearPhase = (Math.abs(this.displaySpeed) / gearSpan) % 1;
    this.engineRpm = 520 + gearPhase * 1250 + THREE.MathUtils.clamp(this.accel, 0, 6) * 90;
    this.engineLoad = THREE.MathUtils.clamp(
      0.12 + Math.abs(this.displaySpeed) / 34 + Math.max(0, this.accel) * 0.09,
      0,
      1
    );

    if (!this.hasStarted && progress > 0.012) {
      this.hasStarted = true;
      this.events.engineStart = true;
    }

    this.brakeCooldown = Math.max(0, this.brakeCooldown - dt);
    if (this.accel < -2.2 && Math.abs(this.displaySpeed) < 6 && this.brakeCooldown <= 0) {
      this.events.airBrake = true;
      this.brakeCooldown = 2.5;
    }
  }
}
