/**
 * The world-space journey.
 *
 * The truck genuinely travels along this polyline (smoothed into a centripetal
 * Catmull-Rom curve). Every environment module, camera shot and story beat is
 * anchored to a named waypoint on it, so the whole experience is laid out in
 * real metres instead of being faked with a scrolling treadmill.
 *
 * Coordinate convention: +Z is "onward", +X is east, +Y is up. All units metres.
 */
export type RouteAnchor =
  | 'originDock'
  | 'warehouseDoor'
  | 'yardExit'
  | 'onRamp'
  | 'highwayA'
  | 'highwayCrest'
  | 'highwayB'
  | 'transferApproach'
  | 'transferDock'
  | 'transferOut'
  | 'highwayTwoA'
  | 'highwayTwoCrest'
  | 'highwayTwoB'
  | 'portRoad'
  | 'portGate'
  | 'portApron'
  | 'containerYard'
  | 'unloadBay';

export interface RouteWaypoint {
  /** Optional stable name - resolvable to an arc-length distance at runtime. */
  anchor?: RouteAnchor;
  position: [number, number, number];
}

export const ROUTE_WAYPOINTS: RouteWaypoint[] = [
  { anchor: 'originDock', position: [0, 0, -44] },
  { position: [0, 0, -14] },
  { anchor: 'warehouseDoor', position: [0, 0, 16] },
  { anchor: 'yardExit', position: [7, 0, 68] },
  { anchor: 'onRamp', position: [26, 0.6, 142] },
  { anchor: 'highwayA', position: [58, 1.8, 242] },
  { anchor: 'highwayCrest', position: [72, 3.2, 334] },
  { anchor: 'highwayB', position: [57, 2.0, 432] },
  { anchor: 'transferApproach', position: [12, 0.5, 532] },
  { anchor: 'transferDock', position: [-38, 0, 602] },
  { anchor: 'transferOut', position: [-29, 0, 664] },
  { anchor: 'highwayTwoA', position: [10, 0.8, 736] },
  { anchor: 'highwayTwoCrest', position: [62, 2.6, 812] },
  { anchor: 'highwayTwoB', position: [90, 1.6, 848] },
  { anchor: 'portRoad', position: [108, 0.6, 872] },
  { anchor: 'portGate', position: [114, 0, 918] },
  { anchor: 'portApron', position: [104, 0, 952] },
  { anchor: 'containerYard', position: [84, 0, 972] },
  { anchor: 'unloadBay', position: [62, 0, 980] },
];

/** Highway corridors - road furniture (guardrails, poles, trees) lives here. */
export const CORRIDORS: { from: RouteAnchor; to: RouteAnchor; kind: 'highway' | 'port' }[] = [
  { from: 'onRamp', to: 'transferApproach', kind: 'highway' },
  { from: 'transferOut', to: 'portRoad', kind: 'highway' },
  { from: 'portRoad', to: 'portGate', kind: 'port' },
];

/** Road cross-section, in metres relative to the truck's own lane centre. */
export const ROAD_SECTION = {
  left: -6.75,
  right: 4.85,
  yellowLine: -5.9,
  dashLine: -1.85,
  fogLine: 1.9,
  dashPeriod: 9,
  dashLength: 3,
};

export const ROAD_WIDTH = ROAD_SECTION.right - ROAD_SECTION.left;
export const ROAD_CENTER_OFFSET = (ROAD_SECTION.right + ROAD_SECTION.left) / 2;
