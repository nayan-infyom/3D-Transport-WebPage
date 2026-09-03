import * as THREE from 'three';
import { QUALITY_PRESETS, type QualitySettings, type QualityTier } from '../config/quality';
import type { EnvironmentZone } from '../config/timeline';
import { AudioEngine } from './audio/AudioEngine';
import { CameraSystem } from './camera/CameraSystem';
import { LightingSystem } from './lighting/LightingSystem';
import {
  Director,
  createLightingSelection,
  createShotSelection,
  type LightingSelection,
  type ShotSelection,
} from './timeline/Director';
import { getRoute, type Route } from './vehicle/Route';
import { VehicleSystem } from './vehicle/VehicleSystem';

/**
 * The world.
 *
 * One object owns every system and runs them in a fixed order from a single
 * `useFrame`. Systems talk to each other through plain properties, never
 * through React state, so scrolling the page does not re-render the scene
 * graph - it just moves numbers.
 */
export class World {
  readonly route: Route;
  readonly director: Director;
  readonly vehicle: VehicleSystem;
  readonly camera: CameraSystem;
  readonly lighting: LightingSystem;
  readonly audio = new AudioEngine();

  quality: QualitySettings;
  progress = 0;
  elapsed = 0;
  zone: EnvironmentZone = 'warehouse';
  /** 0 in daylight, 1 at the port at night. Drives lamp emissives and the mix. */
  nightFactor = 0;
  reducedMotion = false;

  private readonly shotSelection: ShotSelection = createShotSelection();
  private readonly lightingSelection: LightingSelection = createLightingSelection();
  private audioAccumulator = 0;

  /* Adaptive quality */
  private frameAccumulator = 0;
  private frameCount = 0;
  private demotionCooldown = 6;
  onQualityChange: ((tier: QualityTier) => void) | null = null;

  constructor(tier: QualityTier) {
    this.quality = QUALITY_PRESETS[tier];
    this.route = getRoute();
    this.director = new Director(this.route);
    this.vehicle = new VehicleSystem(this.route, this.director);
    this.camera = new CameraSystem(this.route, this.vehicle);
    this.lighting = new LightingSystem();
  }

  setQuality(tier: QualityTier) {
    this.quality = QUALITY_PRESETS[tier];
  }

  update(rawDelta: number, camera: THREE.PerspectiveCamera, progress: number) {
    // A tab that was backgrounded returns a huge delta; clamping keeps the
    // integrators (and the trailer solver) stable.
    const dt = THREE.MathUtils.clamp(rawDelta, 1 / 240, 1 / 20);
    this.elapsed += dt;
    this.progress = progress;

    const scene = this.director.scene(progress);
    this.zone = scene.zone;

    this.director.shot(progress, this.shotSelection);
    this.director.lighting(progress, this.lightingSelection);

    this.vehicle.reducedMotion = this.reducedMotion;
    this.vehicle.update(dt, progress);

    this.camera.reducedMotion = this.reducedMotion;
    this.camera.update(camera, this.shotSelection, dt, this.elapsed);

    this.lighting.update(this.lightingSelection, this.vehicle.position, dt);
    this.nightFactor = THREE.MathUtils.clamp(this.lighting.current.vehicleLights, 0, 1);

    this.updateAudio(dt);
    this.trackPerformance(dt);
  }

  private updateAudio(dt: number) {
    if (this.vehicle.events.coupled) this.audio.couple();
    if (this.vehicle.events.airBrake) this.audio.airBrake();

    this.audioAccumulator += dt;
    if (this.audioAccumulator < 1 / 12) return;
    this.audioAccumulator = 0;
    this.audio.update({
      speed: this.vehicle.displaySpeed,
      rpm: this.vehicle.engineRpm,
      load: this.vehicle.engineLoad,
      zone: this.zone,
      night: this.nightFactor,
    });
  }

  private trackPerformance(dt: number) {
    this.demotionCooldown -= dt;
    this.frameAccumulator += dt;
    this.frameCount++;
    if (this.frameAccumulator < 2.5) return;

    const fps = this.frameCount / this.frameAccumulator;
    this.frameAccumulator = 0;
    this.frameCount = 0;
    if (this.demotionCooldown > 0) return;

    if (fps < 40 && this.quality.tier !== 'low') {
      const next: QualityTier = this.quality.tier === 'high' ? 'medium' : 'low';
      this.demotionCooldown = 12;
      this.onQualityChange?.(next);
    }
  }
}

let singleton: World | null = null;

/**
 * There is exactly one world per page. Keeping it out of React context avoids
 * any question of the renderer bridge and survives StrictMode double-mounts.
 */
export function getWorld(tier: QualityTier = 'medium'): World {
  if (!singleton) singleton = new World(tier);
  return singleton;
}
