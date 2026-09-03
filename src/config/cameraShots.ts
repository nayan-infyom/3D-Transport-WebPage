import type { RouteAnchor } from './route';

/**
 * CINEMATOGRAPHY
 *
 * Each shot is a small camera rig with its own framing, lens and physical
 * weight. Two reference frames are available:
 *
 *  - `truck`  : offsets are [right, up, forward] in the tractor's own frame
 *               (yaw only, so the shot never inherits body roll). Use for
 *               tracking, macro and on-board rigs.
 *  - `anchor` : offsets are [right, up, forward] in the frame of a fixed point
 *               on the route. Use for locked-off tripods, cranes and reveals -
 *               the world stays still and the truck moves through the frame.
 *
 * A shot's `look` frame is resolved the same way, so "static crane looking at a
 * moving truck" is just an anchor position with a truck look target.
 */
export type ShotFrame =
  | { space: 'truck'; offset: [number, number, number] }
  | { space: 'anchor'; anchor: RouteAnchor; along?: number; offset: [number, number, number] };

export interface ShotKey {
  /** 0..1 within the shot. */
  t: number;
  pos: ShotFrame;
  look: ShotFrame;
  fov: number;
}

export interface CameraShot {
  id: string;
  from: number;
  to: number;
  keys: ShotKey[];
  /** Rig weight. Lower = heavier dolly that lags behind its target. */
  damping?: number;
  lookDamping?: number;
  /** How much road/engine vibration reaches the lens. */
  shake?: number;
  /** Cross-fade width, in global scroll progress, into this shot. */
  blendIn?: number;
}

const T = (offset: [number, number, number]): ShotFrame => ({ space: 'truck', offset });
const A = (
  anchor: RouteAnchor,
  offset: [number, number, number],
  along = 0
): ShotFrame => ({ space: 'anchor', anchor, along, offset });

export const CAMERA_SHOTS: CameraShot[] = [
  /* 01 - ESTABLISHING. The rig asleep in a cathedral of a warehouse. */
  {
    id: 'establish',
    from: 0.0,
    to: 0.055,
    damping: 1.1,
    shake: 0.05,
    keys: [
      { t: 0, pos: A('originDock', [19, 11.5, 35]), look: A('originDock', [0, 3.2, -7]), fov: 29 },
      { t: 1, pos: A('originDock', [13.5, 8.4, 26]), look: A('originDock', [0, 2.6, -5]), fov: 32 },
    ],
  },

  /* 02 - MECHANICAL. Close on the cab as the engine wakes. */
  {
    id: 'wake',
    from: 0.055,
    to: 0.098,
    damping: 1.6,
    shake: 0.5,
    blendIn: 0.012,
    keys: [
      { t: 0, pos: T([4.7, 1.2, 7.4]), look: T([0, 1.85, 3.3]), fov: 40 },
      { t: 1, pos: T([3.3, 1.0, 6.1]), look: T([0, 1.7, 2.9]), fov: 37 },
    ],
  },

  /* 03 - COUPLING. Macro, low, right on the fifth wheel. */
  {
    id: 'couple',
    from: 0.098,
    to: 0.155,
    damping: 1.3,
    shake: 0.35,
    blendIn: 0.014,
    keys: [
      { t: 0, pos: T([3.1, 0.85, -1.8]), look: T([0, 1.05, 0.5]), fov: 35 },
      { t: 0.7, pos: T([2.0, 0.62, -0.7]), look: T([0, 0.86, 0.9]), fov: 30 },
      { t: 1, pos: T([2.4, 0.75, -0.2]), look: T([0, 0.95, 1.1]), fov: 32 },
    ],
  },

  /* 04 - THE PAUSE. Coupled, braked, waiting. Deliberately almost still. */
  {
    id: 'settle',
    from: 0.155,
    to: 0.205,
    damping: 0.9,
    shake: 0.25,
    blendIn: 0.016,
    keys: [
      { t: 0, pos: A('originDock', [9.0, 1.6, 17]), look: T([0, 2.0, 1.0]), fov: 37 },
      { t: 1, pos: A('originDock', [7.2, 1.4, 13.5]), look: T([0, 2.0, 1.0]), fov: 34 },
    ],
  },

  /* 05 - DEPARTURE. Low rear tracking as forty tonnes starts rolling. */
  {
    id: 'departTrack',
    from: 0.205,
    to: 0.238,
    damping: 1.5,
    shake: 0.7,
    blendIn: 0.012,
    keys: [
      { t: 0, pos: T([-4.8, 0.85, -19]), look: T([0, 2.1, 2]), fov: 37 },
      { t: 1, pos: T([-3.6, 1.2, -15.5]), look: T([0, 2.1, 2]), fov: 34 },
    ],
  },

  /* 06 - THE DOOR. Locked off. The rig leaves the frame into daylight. */
  {
    id: 'doorExit',
    from: 0.238,
    to: 0.292,
    damping: 1.0,
    lookDamping: 2.2,
    shake: 0.15,
    blendIn: 0.014,
    keys: [
      { t: 0, pos: A('warehouseDoor', [10.5, 1.7, 5]), look: T([0, 2.1, 0]), fov: 33 },
      { t: 1, pos: A('warehouseDoor', [9.0, 2.1, 2]), look: T([0, 2.1, 0]), fov: 36 },
    ],
  },

  /* 07 - HIGHWAY. Wide side tracking, the signature commercial shot. */
  {
    id: 'highwaySide',
    from: 0.292,
    to: 0.375,
    damping: 1.7,
    shake: 1.0,
    blendIn: 0.018,
    keys: [
      { t: 0, pos: T([13.5, 2.9, -3]), look: T([0, 2.2, -1]), fov: 40 },
      { t: 1, pos: T([10.0, 2.1, 4]), look: T([0, 2.1, 1]), fov: 37 },
    ],
  },

  /* 08 - WHEEL. Macro on the drive tandems. Almost touching the asphalt. */
  {
    id: 'wheelMacro',
    from: 0.375,
    to: 0.428,
    damping: 2.4,
    shake: 1.3,
    blendIn: 0.014,
    keys: [
      { t: 0, pos: T([3.2, 0.62, 2.0]), look: T([1.2, 0.5, 1.5]), fov: 27 },
      { t: 1, pos: T([2.55, 0.46, 0.7]), look: T([1.15, 0.5, 0.6]), fov: 24 },
    ],
  },

  /* 09 - AERIAL. Pull up and out; the corridor and the terrain read at last. */
  {
    id: 'highwayHigh',
    from: 0.428,
    to: 0.5,
    damping: 1.25,
    lookDamping: 2.6,
    shake: 0.35,
    blendIn: 0.03,
    keys: [
      // A crane-out rather than a jump: leaves the wheels, rises, opens up.
      { t: 0, pos: T([4.5, 3.2, -13]), look: T([0, 2.1, 3]), fov: 34 },
      { t: 0.45, pos: T([7.5, 9.5, -24]), look: T([0, 2.1, 4]), fov: 33 },
      { t: 1, pos: T([6, 15.5, -34]), look: T([0, 2.1, 5]), fov: 34 },
    ],
  },

  /* 10 - APPROACH. Front three-quarter as the rig comes off the highway. */
  {
    id: 'transferApproach',
    from: 0.5,
    to: 0.575,
    damping: 1.6,
    shake: 0.75,
    blendIn: 0.018,
    keys: [
      { t: 0, pos: T([6.0, 1.4, 13]), look: T([0, 2.0, 3]), fov: 34 },
      { t: 1, pos: T([4.4, 1.6, 10]), look: T([0, 2.0, 3]), fov: 32 },
    ],
  },

  /* 11 - TRANSFER. Wide establishing crane over the facility. */
  {
    id: 'transferReveal',
    from: 0.575,
    to: 0.655,
    damping: 0.85,
    lookDamping: 1.8,
    shake: 0.1,
    blendIn: 0.02,
    keys: [
      { t: 0, pos: A('transferDock', [30, 14, 34]), look: T([0, 2.4, -4]), fov: 37 },
      { t: 1, pos: A('transferDock', [26, 8, 20]), look: T([0, 2.4, -4]), fov: 41 },
    ],
  },

  /* 12 - HELD. Static side profile while the dock works. */
  {
    id: 'transferDetail',
    from: 0.655,
    to: 0.712,
    damping: 0.8,
    shake: 0.12,
    blendIn: 0.016,
    keys: [
      { t: 0, pos: A('transferDock', [11.5, 2.4, -6]), look: T([0, 2.2, -4]), fov: 35 },
      { t: 1, pos: A('transferDock', [10.5, 2.0, -2]), look: T([0, 2.2, -2]), fov: 33 },
    ],
  },

  /* 13 - JOURNEY II. Front three-quarter, lens flattened, sun going down. */
  {
    id: 'highwayTwoFront',
    from: 0.712,
    to: 0.802,
    damping: 1.7,
    shake: 1.0,
    blendIn: 0.02,
    keys: [
      { t: 0, pos: T([6.8, 1.15, 15]), look: T([0, 1.95, 4]), fov: 30 },
      { t: 1, pos: T([4.6, 1.5, 11]), look: T([0, 1.95, 4]), fov: 33 },
    ],
  },

  /* 14 - GOLDEN HOUR. Helicopter crane, long lens, the sun behind the rig. */
  {
    id: 'sunsetCrane',
    from: 0.802,
    to: 0.86,
    damping: 0.9,
    lookDamping: 1.6,
    shake: 0.2,
    blendIn: 0.02,
    keys: [
      { t: 0, pos: A('highwayTwoCrest', [44, 28, 66]), look: T([0, 2.2, 0]), fov: 33 },
      { t: 1, pos: A('highwayTwoCrest', [26, 15, 30]), look: T([0, 2.2, 0]), fov: 38 },
    ],
  },

  /* 15 - THE PORT. The reveal. Truck small, world enormous. */
  {
    id: 'portReveal',
    from: 0.86,
    to: 0.915,
    damping: 0.7,
    lookDamping: 1.4,
    shake: 0.15,
    blendIn: 0.022,
    keys: [
      { t: 0, pos: A('portApron', [-52, 36, 96]), look: T([0, 3, 0]), fov: 35 },
      { t: 1, pos: A('portApron', [-34, 22, 58]), look: T([0, 3, 0]), fov: 41 },
    ],
  },

  /* 16 - THE GATE. Back down to the machine, creeping under the floodlights. */
  {
    id: 'gate',
    from: 0.915,
    to: 0.955,
    damping: 1.5,
    shake: 0.4,
    blendIn: 0.016,
    keys: [
      { t: 0, pos: T([4.0, 0.85, 10]), look: T([0, 1.7, 2]), fov: 32 },
      { t: 1, pos: T([3.0, 1.1, 8]), look: T([0, 1.7, 2]), fov: 35 },
    ],
  },

  /* 17 - ARRIVAL. The camera begins to widen as the rig comes to rest. */
  {
    id: 'arrival',
    from: 0.955,
    to: 0.985,
    damping: 0.9,
    lookDamping: 1.6,
    shake: 0.2,
    blendIn: 0.018,
    keys: [
      { t: 0, pos: A('containerYard', [17, 4.5, 25]), look: T([0, 2.2, -4]), fov: 40 },
      { t: 1, pos: A('containerYard', [24, 8, 33]), look: T([0, 2.2, -4]), fov: 42 },
    ],
  },

  /* 18 - PAYOFF. Slow pullback. Scale, silence, done. */
  {
    id: 'finalPullback',
    from: 0.985,
    to: 1.0,
    damping: 0.6,
    lookDamping: 1.3,
    shake: 0.08,
    blendIn: 0.014,
    keys: [
      { t: 0, pos: A('unloadBay', [28, 10, 42]), look: T([0, 2.4, -5]), fov: 42 },
      { t: 1, pos: A('unloadBay', [52, 21, 74]), look: T([0, 2.4, -5]), fov: 46 },
    ],
  },
];

/** Mouse parallax, in metres of camera offset at full deflection. */
export const PARALLAX_STRENGTH = 0.5;
/** Extra distance pushed back on narrow viewports so framing survives. */
export const MOBILE_FRAMING = { pullback: 1.26, lift: 0.55, fovBoost: 6 };
