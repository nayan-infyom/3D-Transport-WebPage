import type { RouteAnchor } from './route';

/**
 * THE STORY TIMELINE - the single source of truth for pacing.
 *
 * Every system (vehicle, camera, lighting, audio, UI) reads its timing from
 * here. Changing how long a beat lasts is a one-line edit in this file; nothing
 * else in the codebase hard-codes a scroll range.
 */

export type SceneId =
  | 'origin'
  | 'coupling'
  | 'departure'
  | 'highwayOne'
  | 'transfer'
  | 'highwayTwo'
  | 'shipyard'
  | 'delivery';

export type EnvironmentZone = 'warehouse' | 'highway' | 'transfer' | 'port';

export interface SceneDef {
  id: SceneId;
  /** Chapter this scene belongs to. Several scenes may share one chapter. */
  chapter: string;
  chapterTitle: string;
  start: number;
  end: number;
  /** Which environment module is dramatically "active" during this scene. */
  zone: EnvironmentZone;
  /** Large display copy. Omitted for intentionally silent chapters. */
  headline?: string;
  caption?: string;
}

export const SCENES: SceneDef[] = [
  {
    id: 'origin',
    chapter: '01',
    chapterTitle: 'ORIGIN',
    start: 0.0,
    end: 0.075,
    zone: 'warehouse',
    headline: 'ORIGIN',
    caption: 'Every journey begins in the dark.',
  },
  { id: 'coupling', chapter: '01', chapterTitle: 'ORIGIN', start: 0.075, end: 0.17, zone: 'warehouse' },
  {
    id: 'departure',
    chapter: '02',
    chapterTitle: 'DEPARTURE',
    start: 0.17,
    end: 0.3,
    zone: 'warehouse',
    headline: 'DEPARTURE',
    caption: 'Forty tonnes, released.',
  },
  {
    id: 'highwayOne',
    chapter: '03',
    chapterTitle: 'JOURNEY',
    start: 0.3,
    end: 0.5,
    zone: 'highway',
    headline: 'JOURNEY',
    caption: 'Open corridor. Nothing between here and there.',
  },
  {
    id: 'transfer',
    chapter: '04',
    chapterTitle: 'TRANSFER',
    start: 0.5,
    end: 0.68,
    zone: 'transfer',
    headline: 'TRANSFER',
    caption: 'Precision measured in minutes.',
  },
  { id: 'highwayTwo', chapter: '05', chapterTitle: 'JOURNEY II', start: 0.68, end: 0.86, zone: 'highway' },
  {
    id: 'shipyard',
    chapter: '06',
    chapterTitle: 'DESTINATION',
    start: 0.86,
    end: 0.96,
    zone: 'port',
    headline: 'DESTINATION',
    caption: 'Where the road meets the sea.',
  },
  {
    id: 'delivery',
    chapter: '07',
    chapterTitle: 'DELIVERED',
    start: 0.96,
    end: 1.0,
    zone: 'port',
    headline: 'DELIVERED.',
    caption: 'Origin to destination, uninterrupted.',
  },
];

/** Chapters for the UI rail, derived from the scene list (no duplicated data). */
export interface ChapterDef {
  id: string;
  title: string;
  start: number;
  end: number;
}

export const CHAPTERS: ChapterDef[] = SCENES.reduce<ChapterDef[]>((acc, scene) => {
  const last = acc[acc.length - 1];
  if (last && last.id === scene.chapter) {
    last.end = scene.end;
    return acc;
  }
  acc.push({ id: scene.chapter, title: scene.chapterTitle, start: scene.start, end: scene.end });
  return acc;
}, []);

/* ------------------------------------------------------------------------- */
/* Act 1: the coupling                                                        */
/* ------------------------------------------------------------------------- */

/** Engine wakes up, driver settles, nothing moves yet. */
export const COUPLING_START = 0.03;
/** Kingpin locks. From here on the rig is one vehicle. */
export const COUPLING_END = 0.15;
/** How far ahead of the kingpin the tractor waits before it reverses in. */
export const COUPLING_APPROACH_DISTANCE = 15.5;

/* ------------------------------------------------------------------------- */
/* The journey: scroll progress -> distance travelled along the route         */
/* ------------------------------------------------------------------------- */

export interface JourneyKey {
  p: number;
  anchor: RouteAnchor;
  /** Metres added to the anchor's arc-length distance. */
  offset?: number;
  /** Force zero velocity here (a dead stop). */
  stop?: boolean;
}

/**
 * Distance is interpolated between these keys with a monotone cubic (PCHIP)
 * spline, so velocity is continuous everywhere and the truck still arrives at
 * each landmark at exactly the authored scroll position. Acceleration out of
 * the warehouse, highway cruise, the stop at the transfer dock and the final
 * deceleration all fall out of the shape of this table - no conditionals.
 */
export const JOURNEY_KEYS: JourneyKey[] = [
  { p: COUPLING_END, anchor: 'originDock', stop: true },
  { p: 0.3, anchor: 'yardExit' },
  { p: 0.56, anchor: 'transferApproach' },
  { p: 0.65, anchor: 'transferDock', stop: true },
  { p: 0.68, anchor: 'transferDock', stop: true },
  { p: 0.76, anchor: 'transferOut' },
  { p: 0.87, anchor: 'portRoad' },
  { p: 0.94, anchor: 'portApron' },
  { p: 1.0, anchor: 'unloadBay', stop: true },
];

/** Hard ceiling on how fast the rig is allowed to chase a flicked scrollbar. */
export const MAX_VEHICLE_SPEED = 40; // m/s
/** How hard the rig chases the scroll target. Lower = heavier, laggier. */
export const VEHICLE_FOLLOW_STIFFNESS = 3.4;

/* ------------------------------------------------------------------------- */
/* Lighting: a time-of-day curve laid over the scroll axis                    */
/* ------------------------------------------------------------------------- */

export type LightingKey = 'warehouse' | 'day' | 'industrial' | 'sunset' | 'dusk' | 'night';

export const LIGHTING_KEYS: { p: number; state: LightingKey }[] = [
  { p: 0.0, state: 'warehouse' },
  { p: 0.2, state: 'warehouse' },
  { p: 0.3, state: 'day' },
  { p: 0.53, state: 'day' },
  { p: 0.6, state: 'industrial' },
  { p: 0.69, state: 'day' },
  { p: 0.8, state: 'sunset' },
  { p: 0.89, state: 'dusk' },
  { p: 0.96, state: 'night' },
  { p: 1.0, state: 'night' },
];

/* ------------------------------------------------------------------------- */
/* Easing helpers shared by the camera and UI                                 */
/* ------------------------------------------------------------------------- */

export type EaseId = 'linear' | 'in' | 'out' | 'inOut';

export const EASINGS: Record<EaseId, (t: number) => number> = {
  linear: (t) => t,
  in: (t) => t * t,
  out: (t) => 1 - (1 - t) * (1 - t),
  inOut: (t) => t * t * (3 - 2 * t),
};
