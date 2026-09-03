import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CORRIDORS } from '../../../config/route';
import type { QualitySettings } from '../../../config/quality';
import {
  applyPlacements,
  scatterAlongRoute,
  seededRandom,
  type Placement,
} from '../../../systems/geometry/ribbon';
import { getWorld } from '../../../systems/World';
import type { EnvironmentMaterials } from './materials';

const LAMP_SPACING = 46;

/**
 * Everything that lives beside the road.
 *
 * Trees, lamp columns and their heads are three instanced meshes covering the
 * entire route. At night, rather than lighting sixty poles, three real point
 * lights are re-parented to whichever columns the truck is currently passing -
 * the pools of light move with the rig and the cost stays flat.
 */
export function RoadsideProps({
  quality,
  materials,
}: {
  quality: QualitySettings;
  materials: EnvironmentMaterials;
}) {
  const world = getWorld();
  const route = world.route;

  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);
  const canopyTopRef = useRef<THREE.InstancedMesh>(null);
  const columnRef = useRef<THREE.InstancedMesh>(null);
  const lampHeadRef = useRef<THREE.InstancedMesh>(null);
  const roamingLights = useRef<(THREE.PointLight | null)[]>([]);

  const layout = useMemo(() => {
    const highway = CORRIDORS.filter((c) => c.kind === 'highway');
    const rand = seededRandom(8811);

    /* --- Trees --- */
    const trunks: Placement[] = [];
    const canopies: Placement[] = [];
    const tops: Placement[] = [];
    const perCorridor = Math.floor(quality.treeCount / Math.max(1, highway.length));

    highway.forEach((corridor, ci) => {
      const scattered = scatterAlongRoute(route, {
        start: route.at(corridor.from) - 40,
        end: route.at(corridor.to) + 40,
        count: perCorridor,
        minOffset: 17,
        maxOffset: 118,
        seed: 4400 + ci * 97,
        minScale: 0.75,
        maxScale: 1.75,
        // The verge falls away from the shoulder to the flat terrain; trees
        // have to follow it or they float above the slope.
        elevation: (lateral) => -Math.min(1.54, (Math.abs(lateral) - 6.5) / 143.5 * 1.54),
      });
      scattered.forEach((p) => {
        const s = typeof p.scale === 'number' ? p.scale : p.scale.x;
        const base = p.position.clone();
        trunks.push({
          position: base.clone().setY(base.y + 1.1 * s),
          rotationY: p.rotationY,
          scale: new THREE.Vector3(s, s * (0.85 + rand() * 0.5), s),
        });
        canopies.push({
          position: base.clone().setY(base.y + 2.9 * s),
          rotationY: p.rotationY,
          scale: s * (1.2 + rand() * 0.35),
        });
        tops.push({
          position: base.clone().setY(base.y + 4.4 * s),
          rotationY: p.rotationY * 1.7,
          scale: s * (0.72 + rand() * 0.25),
        });
      });
    });

    /* --- Lamp columns --- */
    const columns: Placement[] = [];
    const heads: Placement[] = [];
    const lampDistances: number[] = [];
    const lampPositions: THREE.Vector3[] = [];

    const lampRanges = [
      ...highway.map((c) => ({ from: route.at(c.from), to: route.at(c.to), lateral: 9.6 })),
      { from: route.at('portRoad') - 40, to: route.length, lateral: 11 },
      { from: 40, to: route.at('yardExit') + 20, lateral: 9 },
      { from: route.at('transferApproach'), to: route.at('transferOut'), lateral: 10 },
    ];

    lampRanges.forEach((range) => {
      for (let s = range.from; s < range.to; s += LAMP_SPACING) {
        const side = Math.floor(s / LAMP_SPACING) % 2 === 0 ? 1 : -1;
        const lateral = side * range.lateral;
        const base = route.offsetPosition(s, lateral, new THREE.Vector3());
        const heading = route.heading(s);
        columns.push({
          position: base.clone().setY(base.y + 4.6),
          rotationY: heading,
          scale: 1,
        });
        const head = route.offsetPosition(s, lateral - side * 2.4, new THREE.Vector3());
        head.y += 9.1;
        heads.push({ position: head, rotationY: heading, scale: 1 });
        lampDistances.push(s);
        lampPositions.push(head);
      }
    });

    return { trunks, canopies, tops, columns, heads, lampDistances, lampPositions };
  }, [route, quality.treeCount]);

  useEffect(() => {
    if (trunkRef.current) applyPlacements(trunkRef.current, layout.trunks);
    if (canopyRef.current) applyPlacements(canopyRef.current, layout.canopies);
    if (canopyTopRef.current) applyPlacements(canopyTopRef.current, layout.tops);
    if (columnRef.current) applyPlacements(columnRef.current, layout.columns);
    if (lampHeadRef.current) applyPlacements(lampHeadRef.current, layout.heads);
  }, [layout]);

  useFrame(() => {
    const practicals = world.lighting.current.practicals;
    materials.lampEmissive.emissiveIntensity = 0.15 + practicals * 3.4;

    if (!quality.practicalLights) return;
    const distance = world.vehicle.distance;
    const lights = roamingLights.current;
    if (!lights.length) return;

    // Snap the small pool of real lights onto the columns nearest the rig.
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < layout.lampDistances.length; i++) {
      const d = Math.abs(layout.lampDistances[i] - distance);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }

    for (let i = 0; i < lights.length; i++) {
      const light = lights[i];
      if (!light) continue;
      const index = nearest + i - 1;
      const target = layout.lampPositions[index];
      if (!target) {
        light.visible = false;
        continue;
      }
      light.visible = practicals > 0.08;
      light.position.copy(target);
      light.intensity = practicals * 90;
    }
  });

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, Math.max(1, layout.trunks.length)]}
        material={materials.timber}
        castShadow={quality.shadows}
      >
        <cylinderGeometry args={[0.17, 0.3, 2.2, 6]} />
      </instancedMesh>

      <instancedMesh
        ref={canopyRef}
        args={[undefined, undefined, Math.max(1, layout.canopies.length)]}
        material={materials.foliageDark}
        castShadow={quality.shadows}
      >
        <dodecahedronGeometry args={[1.35, 0]} />
      </instancedMesh>

      <instancedMesh
        ref={canopyTopRef}
        args={[undefined, undefined, Math.max(1, layout.tops.length)]}
        material={materials.foliageLight}
      >
        <octahedronGeometry args={[1.05, 0]} />
      </instancedMesh>

      <instancedMesh
        ref={columnRef}
        args={[undefined, undefined, Math.max(1, layout.columns.length)]}
        material={materials.paintedSteel}
        castShadow={quality.shadows}
      >
        <cylinderGeometry args={[0.13, 0.2, 9.2, 6]} />
      </instancedMesh>

      <instancedMesh
        ref={lampHeadRef}
        args={[undefined, undefined, Math.max(1, layout.heads.length)]}
        material={materials.lampEmissive}
      >
        <boxGeometry args={[0.5, 0.16, 1.1]} />
      </instancedMesh>

      {quality.practicalLights &&
        [0, 1, 2].map((i) => (
          <pointLight
            key={'roam-' + i}
            ref={(el) => {
              roamingLights.current[i] = el;
            }}
            color="#FFDCA8"
            distance={54}
            decay={1.6}
            intensity={0}
          />
        ))}

      <SignGantries materials={materials} />
    </group>
  );
}

/** Three overhead guide signs, placed at the decision points of the journey. */
function SignGantries({ materials }: { materials: EnvironmentMaterials }) {
  const world = getWorld();
  const route = world.route;

  const gantries = useMemo(
    () =>
      [route.at('onRamp') + 40, route.at('transferApproach') - 90, route.at('portRoad') - 60].map(
        (s) => ({
          position: route.position(s, new THREE.Vector3()),
          rotation: route.heading(s),
        })
      ),
    [route]
  );

  return (
    <>
      {gantries.map((g, i) => (
        <group key={'gantry-' + i} position={g.position} rotation={[0, g.rotation, 0]}>
          <mesh position={[7.4, 3.4, 0]} material={materials.paintedSteel} castShadow>
            <cylinderGeometry args={[0.2, 0.24, 6.8, 8]} />
          </mesh>
          <mesh position={[-11.2, 3.4, 0]} material={materials.paintedSteel} castShadow>
            <cylinderGeometry args={[0.2, 0.24, 6.8, 8]} />
          </mesh>
          <mesh position={[-1.9, 6.6, 0]} material={materials.paintedSteel} castShadow>
            <boxGeometry args={[19, 0.4, 0.4]} />
          </mesh>
          <group position={[-1.9, 5.6, -0.25]}>
            <mesh material={materials.signFace} castShadow>
              <boxGeometry args={[6.4, 2.1, 0.1]} />
            </mesh>
            <mesh position={[0, 0.55, 0.07]} material={materials.signText}>
              <boxGeometry args={[5.4, 0.14, 0.02]} />
            </mesh>
            <mesh position={[-0.6, 0.05, 0.07]} material={materials.signText}>
              <boxGeometry args={[3.6, 0.32, 0.02]} />
            </mesh>
            <mesh position={[-1.4, -0.55, 0.07]} material={materials.signText}>
              <boxGeometry args={[2.2, 0.24, 0.02]} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}
