/**
 * Headless acceptance harness.
 *
 * Runs the vehicle, route and director systems for a full simulated scroll of
 * the timeline and asserts the physical invariants that the acceptance criteria
 * call for - no sliding wheels, no snapping, monotone travel, a trailer that
 * actually stays hitched. Run with `npm run verify`.
 */
import * as THREE from 'three';
import { getRoute } from '../src/systems/vehicle/Route';
import { Director, createShotSelection } from '../src/systems/timeline/Director';
import { CameraSystem } from '../src/systems/camera/CameraSystem';
import { VehicleSystem, RIG } from '../src/systems/vehicle/VehicleSystem';
import { JOURNEY_KEYS, SCENES, CHAPTERS, COUPLING_END } from '../src/config/timeline';
import { CAMERA_SHOTS } from '../src/config/cameraShots';

let failures = 0;
function check(label: string, condition: boolean, detail = '') {
  const status = condition ? 'PASS' : 'FAIL';
  if (!condition) failures++;
  console.log(`  [${status}] ${label}${detail ? ' — ' + detail : ''}`);
}

const route = getRoute();
const director = new Director(route);

console.log('\nROUTE');
check('length is plausible', route.length > 1000 && route.length < 1400, route.length.toFixed(1) + ' m');
let previousAnchor = -1;
let anchorsMonotone = true;
for (const key of JOURNEY_KEYS) {
  const d = route.at(key.anchor);
  if (d < previousAnchor - 0.001) anchorsMonotone = false;
  previousAnchor = d;
}
check('journey anchors advance along the route', anchorsMonotone);

console.log('\nTIMELINE');
let sceneGapless = true;
for (let i = 1; i < SCENES.length; i++) {
  if (Math.abs(SCENES[i].start - SCENES[i - 1].end) > 1e-9) sceneGapless = false;
}
check('scenes tile 0..1 with no gaps', sceneGapless && SCENES[0].start === 0 && SCENES[SCENES.length - 1].end === 1);
check('chapters derived from scenes', CHAPTERS.length === 7, CHAPTERS.map((c) => c.id).join(' '));

let shotsContiguous = true;
for (let i = 1; i < CAMERA_SHOTS.length; i++) {
  if (Math.abs(CAMERA_SHOTS[i].from - CAMERA_SHOTS[i - 1].to) > 1e-9) shotsContiguous = false;
}
check(
  'camera shots cover the whole timeline',
  shotsContiguous && CAMERA_SHOTS[0].from === 0 && CAMERA_SHOTS[CAMERA_SHOTS.length - 1].to === 1,
  CAMERA_SHOTS.length + ' shots'
);

console.log('\nJOURNEY CURVE');
let monotone = true;
let maxRate = 0;
let maxRateJump = 0;
let previousRate = 0;
let previousDistance = director.journeyDistance(0);
const steps = 4000;
for (let i = 1; i <= steps; i++) {
  const p = i / steps;
  const d = director.journeyDistance(p);
  if (d < previousDistance - 1e-6) monotone = false;
  const rate = (d - previousDistance) * steps;
  if (rate > maxRate) maxRate = rate;
  if (p > 0.2) maxRateJump = Math.max(maxRateJump, Math.abs(rate - previousRate));
  previousRate = rate;
  previousDistance = d;
}
check('distance never goes backwards', monotone);
check('peak rate stays sane', maxRate < 3200, maxRate.toFixed(0) + ' m per unit progress');
check('velocity is continuous (no step changes)', maxRateJump < 40, 'max step ' + maxRateJump.toFixed(2));

let hitsAnchors = true;
for (const key of JOURNEY_KEYS) {
  const expected = route.at(key.anchor) + (key.offset ?? 0);
  const actual = director.journeyDistance(key.p);
  if (Math.abs(expected - actual) > 0.01) hitsAnchors = false;
}
check('truck arrives at every landmark exactly on cue', hitsAnchors);

const stopKeys = JOURNEY_KEYS.filter((k) => k.stop);
let stopsAreStops = true;
for (const key of stopKeys) {
  const before = director.journeyDistance(key.p - 0.002);
  const after = director.journeyDistance(key.p + 0.002);
  const rate = (after - before) / 0.004;
  if (rate > 260) stopsAreStops = false;
}
check('authored stops really stop', stopsAreStops, stopKeys.length + ' stop keys');

console.log('\nVEHICLE SIMULATION');
const vehicle = new VehicleSystem(route, director);
const tractorRoot = new THREE.Group();
const tractorBody = new THREE.Group();
const trailerRoot = new THREE.Group();
const trailerBody = new THREE.Group();
vehicle.objects.tractorRoot = tractorRoot;
vehicle.objects.tractorBody = tractorBody;
vehicle.objects.trailerRoot = trailerRoot;
vehicle.objects.trailerBody = trailerBody;
vehicle.reset(0);

const dt = 1 / 60;
const seconds = 90;
const frames = seconds / dt;

let wheelSlip = 0;
let maxArticulation = 0;
let maxSteer = 0;
let maxHitchError = 0;
let maxJump = 0;
let nan = false;
let steersIntoCurves = 0;
let straightSteer = 0;
let straightSamples = 0;

let previousWheelAngle = vehicle.wheelRotation;
let previousDistance2 = vehicle.distance;
const previousPosition = new THREE.Vector3().copy(tractorRoot.position);
const hitch = new THREE.Vector3();
const forward = new THREE.Vector3();
const trailerAxle = new THREE.Vector3();

// The last two seconds hold at the end of the timeline, as a reader who has
// finished scrolling would: the rig should settle, not stop dead.
const holdFrames = 2 / dt;
for (let f = 0; f < frames + holdFrames; f++) {
  const progress = Math.min(1, f / frames);
  vehicle.update(dt, progress);

  if (
    !Number.isFinite(vehicle.distance) ||
    !Number.isFinite(tractorRoot.position.x) ||
    !Number.isFinite(trailerRoot.position.x) ||
    !Number.isFinite(vehicle.steer)
  ) {
    nan = true;
    break;
  }

  // 1. Wheels must roll exactly as far as the truck travelled.
  const travelled = vehicle.distance - previousDistance2;
  const rolled = (vehicle.wheelRotation - previousWheelAngle) * RIG.wheelRadius;
  wheelSlip = Math.max(wheelSlip, Math.abs(travelled - rolled));
  previousWheelAngle = vehicle.wheelRotation;
  previousDistance2 = vehicle.distance;

  // 2. No teleporting between frames.
  const jump = tractorRoot.position.distanceTo(previousPosition);
  if (f > 3) maxJump = Math.max(maxJump, jump);
  previousPosition.copy(tractorRoot.position);

  // 3. The kingpin has to stay coincident with the fifth wheel.
  if (progress > COUPLING_END + 0.02) {
    forward.set(Math.sin(vehicle.yaw), 0, Math.cos(vehicle.yaw));
    hitch.copy(tractorRoot.position).addScaledVector(forward, RIG.hitchOffset);
    const trailerForward = new THREE.Vector3(
      Math.sin(trailerRoot.rotation.y),
      0,
      Math.cos(trailerRoot.rotation.y)
    );
    const kingpin = trailerRoot.position.clone().addScaledVector(trailerForward, RIG.trailerKingpinOffset);
    maxHitchError = Math.max(maxHitchError, Math.abs(hitch.x - kingpin.x) + Math.abs(hitch.z - kingpin.z));

    trailerAxle.copy(trailerRoot.position).addScaledVector(trailerForward, RIG.trailerAxleOffset);
    const wheelbase = kingpin.distanceTo(trailerAxle);
    if (Math.abs(wheelbase - RIG.trailerWheelbase) > 0.02) maxArticulation = Infinity;
  }

  maxSteer = Math.max(maxSteer, Math.abs(vehicle.steer));
  maxArticulation = Math.max(maxArticulation, Math.abs(vehicle.articulation));

  // 4. Steering must follow the road, not a sine wave.
  const curvature = route.curvature(vehicle.distance + RIG.wheelbase * 0.5, 5);
  if (Math.abs(curvature) > 0.004 && Math.abs(vehicle.displaySpeed) > 4) {
    if (Math.sign(vehicle.steer) === Math.sign(curvature)) steersIntoCurves++;
    else steersIntoCurves--;
  }
  if (Math.abs(curvature) < 0.0004 && Math.abs(vehicle.displaySpeed) > 4) {
    straightSteer = Math.max(straightSteer, Math.abs(vehicle.steer));
    straightSamples++;
  }
}

check('no NaN anywhere in the rig', !nan);
check('wheels never slide', wheelSlip < 1e-6, 'max slip ' + wheelSlip.toExponential(2) + ' m/frame');
check('no positional snapping', maxJump < 0.8, 'max frame step ' + maxJump.toFixed(3) + ' m');
check('kingpin stays coupled', maxHitchError < 1e-6, 'max error ' + maxHitchError.toExponential(2) + ' m');
check('trailer wheelbase constraint holds', Number.isFinite(maxArticulation));
check('articulation stays believable', maxArticulation < 0.5, 'max ' + ((maxArticulation * 180) / Math.PI).toFixed(1) + ' deg');
check('steer angle stays within lock', maxSteer <= RIG.maxSteer + 1e-6, 'max ' + ((maxSteer * 180) / Math.PI).toFixed(1) + ' deg');
check('steering follows the road curvature', steersIntoCurves > 0, 'agreement score ' + steersIntoCurves);
check(
  'wheel is near-centred on straights',
  straightSamples === 0 || straightSteer < 0.05,
  'max ' + ((straightSteer * 180) / Math.PI).toFixed(2) + ' deg over ' + straightSamples + ' samples'
);
check('rig finishes at the unloading bay', Math.abs(vehicle.distance - route.at('unloadBay')) < 2.5, 'off by ' + Math.abs(vehicle.distance - route.at('unloadBay')).toFixed(2) + ' m');
check('rig comes to rest', Math.abs(vehicle.displaySpeed) < 0.6, vehicle.displaySpeed.toFixed(3) + ' m/s');


/* ------------------------------------------------------------------------- */
/* Camera framing                                                            */
/* ------------------------------------------------------------------------- */
console.log('\nCAMERA');

const cam = new THREE.PerspectiveCamera(34, 16 / 9, 0.35, 2600);
const cameraSystem = new CameraSystem(route, vehicle);
cameraSystem.reducedMotion = true;
const selection = createShotSelection();

const vehicle2 = new VehicleSystem(route, director);
vehicle2.objects.tractorRoot = new THREE.Group();
vehicle2.objects.tractorBody = new THREE.Group();
vehicle2.objects.trailerRoot = new THREE.Group();
vehicle2.objects.trailerBody = new THREE.Group();
vehicle2.reset(0);
const camera2 = new CameraSystem(route, vehicle2);
camera2.reducedMotion = true;

let minCameraHeight = Infinity;
let worstOffAxis = 0;
let worstOffAxisShot = '';
let worstDistance = 0;
let worstDistanceShot = '';
let tooClose = 0;
let maxCameraStep = 0;
const camForward = new THREE.Vector3();
const toTruck = new THREE.Vector3();
const previousCamera = new THREE.Vector3();
const roadHere = new THREE.Vector3();

for (let f = 0; f < frames; f++) {
  const progress = Math.min(1, f / frames);
  vehicle2.update(dt, progress);
  director.shot(progress, selection);
  camera2.update(cam, selection, dt, f * dt);

  if (f < 30) {
    previousCamera.copy(cam.position);
    continue;
  }

  maxCameraStep = Math.max(maxCameraStep, cam.position.distanceTo(previousCamera));
  previousCamera.copy(cam.position);

  route.position(vehicle2.distance, roadHere);
  minCameraHeight = Math.min(minCameraHeight, cam.position.y - Math.min(roadHere.y, 0));

  toTruck.copy(vehicle2.position).setY(vehicle2.position.y + 1.7).sub(cam.position);
  const distance = toTruck.length();
  toTruck.normalize();
  cam.getWorldDirection(camForward);
  const offAxis = THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(camForward.dot(toTruck), -1, 1)));
  const halfFov = (cam.fov * cam.aspect * 0.5) / 2 + cam.fov / 2;

  // Macro shots deliberately frame a wheel, not the whole vehicle, so the
  // whole-truck framing rule only applies once the camera is standing back.
  if (distance > 6 && offAxis / halfFov > worstOffAxis) {
    worstOffAxis = offAxis / halfFov;
    worstOffAxisShot =
      selection.shot.id +
      ' at p=' + progress.toFixed(3) +
      ' (' + offAxis.toFixed(1) + ' deg vs half-frame ' + halfFov.toFixed(1) + ', blend ' + selection.blend.toFixed(2) + ')';
  }
  if (distance > worstDistance) {
    worstDistance = distance;
    worstDistanceShot = selection.shot.id;
  }
  if (distance < 1.4) tooClose++;
}

check('camera never drops below ground', minCameraHeight > 0.25, 'lowest ' + minCameraHeight.toFixed(2) + ' m');
check('camera never clips into the rig', tooClose === 0, tooClose + ' frames closer than 1.4 m');
check('truck stays inside the frame', worstOffAxis < 1.0, 'worst ' + (worstOffAxis * 100).toFixed(0) + '% of half-frame in ' + worstOffAxisShot);
check('subject never gets lost in the distance', worstDistance < 320, 'furthest ' + worstDistance.toFixed(0) + ' m in ' + worstDistanceShot);
check('no camera cuts (all moves are damped)', maxCameraStep < 3.5, 'largest frame move ' + maxCameraStep.toFixed(2) + ' m');

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}\n`);
process.exit(failures === 0 ? 0 : 1);
