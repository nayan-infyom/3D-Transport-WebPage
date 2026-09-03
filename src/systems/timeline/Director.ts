import {
  CHAPTERS,
  COUPLING_APPROACH_DISTANCE,
  COUPLING_END,
  COUPLING_START,
  JOURNEY_KEYS,
  LIGHTING_KEYS,
  SCENES,
  type ChapterDef,
  type LightingKey,
  type SceneDef,
} from '../../config/timeline';
import { CAMERA_SHOTS, type CameraShot } from '../../config/cameraShots';
import type { Route } from '../vehicle/Route';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

export interface ShotSelection {
  shot: CameraShot;
  /** Local 0..1 progress inside the shot. */
  t: number;
  /** Shot being crossfaded out of, if any. */
  previous: CameraShot | null;
  previousT: number;
  /** 0 = fully previous shot, 1 = fully current shot. */
  blend: number;
}

export interface LightingSelection {
  from: LightingKey;
  to: LightingKey;
  t: number;
}

/**
 * The scene director.
 *
 * Given one number - scroll progress - it answers every question the rest of
 * the application needs to ask: which scene is playing, how far into it we are,
 * how far the truck has driven, which shot the camera is running and what the
 * light is doing. All of it is derived from the config tables, so there is no
 * timeline logic scattered through the components.
 */
export class Director {
  private readonly distances: number[];
  private readonly progress: number[];
  private readonly slopes: number[];

  constructor(private readonly route: Route) {
    this.progress = JOURNEY_KEYS.map((k) => k.p);
    this.distances = JOURNEY_KEYS.map((k) => route.at(k.anchor) + (k.offset ?? 0));
    this.slopes = this.computeMonotoneSlopes();
  }

  /* --------------------------------------------------------------------- */
  /* Journey                                                               */
  /* --------------------------------------------------------------------- */

  /**
   * Monotone cubic (Fritsch-Carlson) tangents. Guarantees the truck never
   * reverses on a segment it should be driving forward through, and gives a
   * continuous velocity across every key - which is what makes acceleration
   * and braking read as physical rather than as a step change.
   */
  private computeMonotoneSlopes(): number[] {
    const n = this.progress.length;
    const h: number[] = [];
    const delta: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      h[i] = this.progress[i + 1] - this.progress[i];
      delta[i] = (this.distances[i + 1] - this.distances[i]) / h[i];
    }

    const m = new Array<number>(n).fill(0);
    m[0] = delta[0];
    m[n - 1] = delta[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (delta[i - 1] * delta[i] <= 0) {
        m[i] = 0;
      } else {
        const w1 = 2 * h[i] + h[i - 1];
        const w2 = h[i] + 2 * h[i - 1];
        m[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i]);
      }
    }

    JOURNEY_KEYS.forEach((k, i) => {
      if (k.stop) m[i] = 0;
    });

    return m;
  }

  /** Distance along the route, in metres, for the coupled rig. */
  journeyDistance(p: number): number {
    const first = this.progress[0];
    const last = this.progress[this.progress.length - 1];
    if (p <= first) return this.distances[0];
    if (p >= last) return this.distances[this.distances.length - 1];

    let i = 0;
    while (i < this.progress.length - 2 && p > this.progress[i + 1]) i++;

    const h = this.progress[i + 1] - this.progress[i];
    const t = (p - this.progress[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return (
      h00 * this.distances[i] +
      h10 * h * this.slopes[i] +
      h01 * this.distances[i + 1] +
      h11 * h * this.slopes[i + 1]
    );
  }

  /** Where the tractor should be, including the pre-coupling reverse. */
  tractorTargetDistance(p: number): number {
    if (p >= COUPLING_END) return this.journeyDistance(p);
    const dock = this.distances[0];
    const approach = smoothstep((p - COUPLING_START) / (COUPLING_END - COUPLING_START));
    return dock + COUPLING_APPROACH_DISTANCE * (1 - approach);
  }

  /** Route distance of the parked trailer's kingpin. */
  get dockDistance(): number {
    return this.distances[0];
  }

  /** 0 before the kingpin locks, 1 after. */
  couplingProgress(p: number): number {
    return smoothstep((p - COUPLING_START) / (COUPLING_END - COUPLING_START));
  }

  isCoupled(p: number): boolean {
    return p >= COUPLING_END - 0.004;
  }

  /* --------------------------------------------------------------------- */
  /* Scenes, chapters, shots                                               */
  /* --------------------------------------------------------------------- */

  scene(p: number): SceneDef {
    for (let i = 0; i < SCENES.length; i++) {
      if (p < SCENES[i].end) return SCENES[i];
    }
    return SCENES[SCENES.length - 1];
  }

  sceneProgress(p: number): number {
    const s = this.scene(p);
    return clamp01((p - s.start) / (s.end - s.start));
  }

  chapter(p: number): ChapterDef {
    for (let i = 0; i < CHAPTERS.length; i++) {
      if (p < CHAPTERS[i].end) return CHAPTERS[i];
    }
    return CHAPTERS[CHAPTERS.length - 1];
  }

  shot(p: number, out: ShotSelection): ShotSelection {
    let index = CAMERA_SHOTS.length - 1;
    for (let i = 0; i < CAMERA_SHOTS.length; i++) {
      if (p < CAMERA_SHOTS[i].to) {
        index = i;
        break;
      }
    }

    const shot = CAMERA_SHOTS[index];
    out.shot = shot;
    out.t = clamp01((p - shot.from) / (shot.to - shot.from));

    const blendIn = shot.blendIn ?? 0;
    const previous = index > 0 ? CAMERA_SHOTS[index - 1] : null;
    if (previous && blendIn > 0 && p < shot.from + blendIn) {
      out.previous = previous;
      out.previousT = 1;
      out.blend = smoothstep((p - shot.from) / blendIn);
    } else {
      out.previous = null;
      out.previousT = 0;
      out.blend = 1;
    }

    return out;
  }

  lighting(p: number, out: LightingSelection): LightingSelection {
    let i = 0;
    while (i < LIGHTING_KEYS.length - 2 && p > LIGHTING_KEYS[i + 1].p) i++;
    const a = LIGHTING_KEYS[i];
    const b = LIGHTING_KEYS[i + 1] ?? a;
    out.from = a.state;
    out.to = b.state;
    out.t = b.p > a.p ? smoothstep((p - a.p) / (b.p - a.p)) : 1;
    return out;
  }

  get routeRef(): Route {
    return this.route;
  }
}

export function createShotSelection(): ShotSelection {
  return { shot: CAMERA_SHOTS[0], t: 0, previous: null, previousT: 0, blend: 1 };
}

export function createLightingSelection(): LightingSelection {
  return { from: 'warehouse', to: 'warehouse', t: 0 };
}
