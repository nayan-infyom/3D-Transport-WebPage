import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CORRIDORS, ROAD_SECTION } from '../../../config/route';
import type { QualitySettings } from '../../../config/quality';
import { applyPlacements, buildRibbon, buildWall } from '../../../systems/geometry/ribbon';
import { getWorld } from '../../../systems/World';
import type { EnvironmentMaterials } from './materials';

/** Paved stretches. Facility aprons cover the joins, so the ends never show. */
const CARRIAGEWAY = [
  { from: 52, to: 592 },
  { from: 700, to: 1036 },
];

/**
 * The road.
 *
 * The whole carriageway - surface, aggregate, tyre polish, shoulders, median
 * line, dashed lane divider and fog line - is a single extruded ribbon carrying
 * one baked cross-section texture. A kilometre of correctly marked interstate
 * costs one draw call instead of several thousand striped quads.
 */
export function RoadCorridor({
  quality,
  materials,
}: {
  quality: QualitySettings;
  materials: EnvironmentMaterials;
}) {
  const world = getWorld();
  const route = world.route;
  const postsRef = useRef<THREE.InstancedMesh>(null);

  const geometries = useMemo(() => {
    const step = quality.roadStep;
    const uvLength = ROAD_SECTION.dashPeriod;

    const carriageways = CARRIAGEWAY.map((seg) =>
      buildRibbon(route, {
        start: seg.from,
        end: seg.to,
        step,
        left: ROAD_SECTION.left,
        right: ROAD_SECTION.right,
        heightLeft: 0.02,
        heightRight: -0.04,
        uvLength,
      })
    );

    // Opposite carriageway across the median, mirrored so its markings read
    // correctly from the far side.
    const oncoming = CORRIDORS.filter((c) => c.kind === 'highway').map((c) =>
      buildRibbon(route, {
        start: route.at(c.from) - 30,
        end: route.at(c.to) + 30,
        step,
        left: -12.8,
        right: -24.4,
        heightLeft: 0.02,
        heightRight: -0.04,
        uvLength,
        mirror: true,
      })
    );

    // Graded verge either side, sloping away to the flat terrain.
    const verges = CARRIAGEWAY.flatMap((seg) => [
      buildRibbon(route, {
        start: seg.from - 20,
        end: seg.to + 20,
        step: step * 2,
        left: -150,
        right: ROAD_SECTION.left + 0.4,
        absoluteLeftY: -1.6,
        heightRight: -0.06,
        uvLength: 40,
      }),
      buildRibbon(route, {
        start: seg.from - 20,
        end: seg.to + 20,
        step: step * 2,
        left: ROAD_SECTION.right - 0.4,
        right: 150,
        heightLeft: -0.06,
        absoluteRightY: -1.6,
        uvLength: 40,
      }),
    ]);

    const highwayRanges = CORRIDORS.filter((c) => c.kind === 'highway').map((c) => ({
      from: route.at(c.from),
      to: route.at(c.to),
    }));

    const guardrails = highwayRanges.map((r) =>
      buildWall(route, {
        start: r.from,
        end: r.to,
        step: step * 1.5,
        offset: 6.5,
        bottom: 0.52,
        top: 0.88,
        uvLength: 8,
      })
    );

    const medianBarriers = highwayRanges.map((r) =>
      buildWall(route, {
        start: r.from - 30,
        end: r.to + 30,
        step: step * 1.5,
        offset: -9.6,
        bottom: -0.35,
        top: 1.05,
        uvLength: 6,
      })
    );

    return { carriageways, oncoming, verges, guardrails, medianBarriers, highwayRanges };
  }, [route, quality.roadStep]);

  /* Guardrail posts: one instanced mesh for every post on the route. */
  const postCount = useMemo(() => {
    return geometries.highwayRanges.reduce((n, r) => n + Math.floor((r.to - r.from) / 4), 0);
  }, [geometries]);

  useEffect(() => {
    const mesh = postsRef.current;
    if (!mesh) return;
    const placements: { position: THREE.Vector3; rotationY: number; scale: number }[] = [];
    geometries.highwayRanges.forEach((range) => {
      for (let s = range.from; s < range.to; s += 4) {
        const position = route.offsetPosition(s, 6.5, new THREE.Vector3());
        position.y += 0.36;
        placements.push({ position, rotationY: route.heading(s), scale: 1 });
      }
    });
    applyPlacements(mesh, placements);
  }, [geometries, route]);

  useEffect(() => {
    const all = [
      ...geometries.carriageways,
      ...geometries.oncoming,
      ...geometries.verges,
      ...geometries.guardrails,
      ...geometries.medianBarriers,
    ];
    return () => all.forEach((g) => g.dispose());
  }, [geometries]);

  return (
    <group>
      {geometries.carriageways.map((geometry, i) => (
        <mesh key={'road-' + i} geometry={geometry} material={materials.asphalt} receiveShadow />
      ))}
      {geometries.oncoming.map((geometry, i) => (
        <mesh key={'onc-' + i} geometry={geometry} material={materials.asphalt} receiveShadow />
      ))}
      {geometries.verges.map((geometry, i) => (
        <mesh key={'verge-' + i} geometry={geometry} material={materials.verge} receiveShadow />
      ))}
      {geometries.guardrails.map((geometry, i) => (
        <mesh key={'rail-' + i} geometry={geometry} material={materials.galvanised} castShadow />
      ))}
      {geometries.medianBarriers.map((geometry, i) => (
        <mesh
          key={'median-' + i}
          geometry={geometry}
          material={materials.concreteBarrier}
          castShadow
          receiveShadow
        />
      ))}

      <instancedMesh
        ref={postsRef}
        args={[undefined, undefined, Math.max(1, postCount)]}
        material={materials.darkSteel}
        castShadow
      >
        <boxGeometry args={[0.12, 0.72, 0.14]} />
      </instancedMesh>
    </group>
  );
}
