import * as THREE from 'three';
import { LIGHTING_STATES } from '../../config/lighting';
import type { LightingKey } from '../../config/timeline';
import type { LightingSelection } from '../timeline/Director';

/** Colours parsed once at module load - never inside the frame loop. */
interface ResolvedState {
  sunColor: THREE.Color;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  ambientColor: THREE.Color;
  fogColor: THREE.Color;
  zenith: THREE.Color;
  horizon: THREE.Color;
  glow: THREE.Color;
}

const RESOLVED = Object.fromEntries(
  (Object.keys(LIGHTING_STATES) as LightingKey[]).map((key) => {
    const s = LIGHTING_STATES[key];
    return [
      key,
      {
        sunColor: new THREE.Color(s.sunColor),
        hemiSky: new THREE.Color(s.hemiSky),
        hemiGround: new THREE.Color(s.hemiGround),
        ambientColor: new THREE.Color(s.ambientColor),
        fogColor: new THREE.Color(s.fogColor),
        zenith: new THREE.Color(s.skyZenith),
        horizon: new THREE.Color(s.skyHorizon),
        glow: new THREE.Color(s.skyGlow),
      } satisfies ResolvedState,
    ];
  })
) as Record<LightingKey, ResolvedState>;

export interface SkyUniforms {
  uZenith: { value: THREE.Color };
  uHorizon: { value: THREE.Color };
  uGlow: { value: THREE.Color };
  uSunDir: { value: THREE.Vector3 };
  uFalloff: { value: number };
  uStars: { value: number };
  [key: string]: THREE.IUniform;
}

const lerp = THREE.MathUtils.lerp;

/**
 * Cinematic lighting.
 *
 * Blends whole lighting *states* - key light, bounce, sky gradient, fog,
 * exposure, star field and how hard the in-world fixtures burn - so a
 * transition reads as the time of day changing rather than a light swapping
 * colour. The key light rides with the truck so the shadow camera stays tight.
 */
export class LightingSystem {
  sun: THREE.DirectionalLight | null = null;
  hemi: THREE.HemisphereLight | null = null;
  ambient: THREE.AmbientLight | null = null;
  sky: SkyUniforms | null = null;
  fog: THREE.FogExp2 | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  scene: THREE.Scene | null = null;

  /** Live blended values other systems read (practical fixtures, lamps). */
  readonly current = {
    practicals: 1,
    vehicleLights: 1,
    envIntensity: 0.3,
    exposure: 1,
    fogDensity: 0.01,
  };

  private readonly sunColor = new THREE.Color();
  private readonly hemiSky = new THREE.Color();
  private readonly hemiGround = new THREE.Color();
  private readonly ambientColor = new THREE.Color();
  private readonly fogColor = new THREE.Color();
  private readonly zenith = new THREE.Color();
  private readonly horizon = new THREE.Color();
  private readonly glow = new THREE.Color();
  private readonly sunOffset = new THREE.Vector3();
  private readonly sunDir = new THREE.Vector3();

  update(selection: LightingSelection, focus: THREE.Vector3, dt: number) {
    const a = LIGHTING_STATES[selection.from];
    const b = LIGHTING_STATES[selection.to];
    const ra = RESOLVED[selection.from];
    const rb = RESOLVED[selection.to];
    const t = selection.t;
    // A little temporal smoothing on top of the blend keeps a fast scrub from
    // strobing the whole scene.
    const k = 1 - Math.exp(-6 * dt);

    this.sunColor.copy(ra.sunColor).lerp(rb.sunColor, t);
    this.hemiSky.copy(ra.hemiSky).lerp(rb.hemiSky, t);
    this.hemiGround.copy(ra.hemiGround).lerp(rb.hemiGround, t);
    this.ambientColor.copy(ra.ambientColor).lerp(rb.ambientColor, t);
    this.fogColor.copy(ra.fogColor).lerp(rb.fogColor, t);
    this.zenith.copy(ra.zenith).lerp(rb.zenith, t);
    this.horizon.copy(ra.horizon).lerp(rb.horizon, t);
    this.glow.copy(ra.glow).lerp(rb.glow, t);

    this.sunOffset.set(
      lerp(a.sunOffset[0], b.sunOffset[0], t),
      lerp(a.sunOffset[1], b.sunOffset[1], t),
      lerp(a.sunOffset[2], b.sunOffset[2], t)
    );

    const sunIntensity = lerp(a.sunIntensity, b.sunIntensity, t);
    const hemiIntensity = lerp(a.hemiIntensity, b.hemiIntensity, t);
    const ambientIntensity = lerp(a.ambientIntensity, b.ambientIntensity, t);
    const fogDensity = lerp(a.fogDensity, b.fogDensity, t);
    const exposure = lerp(a.exposure, b.exposure, t);

    this.current.practicals = lerp(this.current.practicals, lerp(a.practicals, b.practicals, t), k);
    this.current.vehicleLights = lerp(
      this.current.vehicleLights,
      lerp(a.vehicleLights, b.vehicleLights, t),
      k
    );
    this.current.envIntensity = lerp(a.envIntensity, b.envIntensity, t);
    this.current.exposure = exposure;
    this.current.fogDensity = fogDensity;

    if (this.sun) {
      this.sun.color.lerp(this.sunColor, k);
      this.sun.intensity = lerp(this.sun.intensity, sunIntensity, k);
      this.sun.position.copy(focus).add(this.sunOffset);
      this.sun.target.position.copy(focus);
      this.sun.target.updateMatrixWorld();
    }
    if (this.hemi) {
      this.hemi.color.lerp(this.hemiSky, k);
      this.hemi.groundColor.lerp(this.hemiGround, k);
      this.hemi.intensity = lerp(this.hemi.intensity, hemiIntensity, k);
    }
    if (this.ambient) {
      this.ambient.color.lerp(this.ambientColor, k);
      this.ambient.intensity = lerp(this.ambient.intensity, ambientIntensity, k);
    }
    if (this.fog) {
      this.fog.color.lerp(this.fogColor, k);
      this.fog.density = lerp(this.fog.density, fogDensity, k);
    }
    if (this.scene) {
      if (this.scene.background instanceof THREE.Color) this.scene.background.lerp(this.fogColor, k);
      this.scene.environmentIntensity = lerp(
        this.scene.environmentIntensity,
        this.current.envIntensity,
        k
      );
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = lerp(this.renderer.toneMappingExposure, exposure, k);
    }
    if (this.sky) {
      this.sky.uZenith.value.lerp(this.zenith, k);
      this.sky.uHorizon.value.lerp(this.horizon, k);
      this.sky.uGlow.value.lerp(this.glow, k);
      this.sky.uFalloff.value = lerp(this.sky.uFalloff.value, lerp(a.glowFalloff, b.glowFalloff, t), k);
      this.sky.uStars.value = lerp(this.sky.uStars.value, lerp(a.starOpacity, b.starOpacity, t), k);
      this.sunDir.copy(this.sunOffset).normalize();
      this.sky.uSunDir.value.lerp(this.sunDir, k);
    }
  }
}
