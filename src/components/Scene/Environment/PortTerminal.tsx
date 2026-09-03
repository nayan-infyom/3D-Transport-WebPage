import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { QualitySettings } from '../../../config/quality';
import { applyPlacements, seededRandom, type Placement } from '../../../systems/geometry/ribbon';
import { getWorld } from '../../../systems/World';
import { CONTAINER_COLORS, type EnvironmentMaterials } from './materials';

const QUAY_EDGE = -74;

/**
 * ACT SIX - the port.
 *
 * The climax, and the only place in the film where the truck is deliberately
 * made small. Scale is built from three things: a container yard measured in
 * hundreds of boxes, ship-to-shore cranes tall enough to leave frame, and a
 * black sheet of water carrying the whole skyline back at you. The yard, the
 * ship's deck load and the floodlight heads are all instanced, so the entire
 * terminal is a handful of draw calls.
 */
export function PortTerminal({
  quality,
  materials,
}: {
  quality: QualitySettings;
  materials: EnvironmentMaterials;
}) {
  const world = getWorld();
  const route = world.route;

  const yardRef = useRef<THREE.InstancedMesh>(null);
  const shipLoadRef = useRef<THREE.InstancedMesh>(null);
  const floodHeadRef = useRef<THREE.InstancedMesh>(null);
  const floods = useRef<(THREE.PointLight | null)[]>([]);
  const craneLights = useRef<(THREE.PointLight | null)[]>([]);

  const anchor = useMemo(() => {
    const distance = route.at('portApron');
    return {
      position: route.position(distance, new THREE.Vector3()),
      rotation: route.heading(distance),
    };
  }, [route]);

  const layout = useMemo(() => {
    const rand = seededRandom(90210);
    const yard: Placement[] = [];
    const shipLoad: Placement[] = [];
    const floodHeads: Placement[] = [];

    /* Container yard: blocks of six rows, stacked one to five high. */
    const target = quality.containerCount;
    const blockRows = quality.tier === 'low' ? 3 : 6;
    outer: for (let block = 0; block < 7; block++) {
      const baseX = 6 + block * 17;
      for (let row = 0; row < blockRows; row++) {
        const x = baseX + row * 2.62;
        for (let bay = 0; bay < 9; bay++) {
          const z = -120 + bay * 13.4;
          const stack = 1 + Math.floor(rand() * 4.4);
          for (let level = 0; level < stack; level++) {
            if (yard.length >= target) break outer;
            yard.push({
              position: new THREE.Vector3(x, 1.32 + level * 2.62, z),
              rotationY: 0,
              scale: 1,
            });
          }
        }
      }
    }

    /* Deck load on the ship. */
    const deckTarget = quality.tier === 'low' ? 90 : 260;
    outerShip: for (let row = 0; row < 8; row++) {
      for (let bay = 0; bay < 16; bay++) {
        const stack = 1 + Math.floor(rand() * 3.6);
        for (let level = 0; level < stack; level++) {
          if (shipLoad.length >= deckTarget) break outerShip;
          shipLoad.push({
            position: new THREE.Vector3(
              -108 + row * 2.62,
              12.6 + level * 2.62,
              -96 + bay * 13.2
            ),
            rotationY: 0,
            scale: 1,
          });
        }
      }
    }

    const floodPositions: [number, number][] = [
      [2, -132],
      [2, -44],
      [2, 44],
      [2, 132],
      [118, -100],
      [118, 0],
      [118, 100],
      [-60, -120],
      [-60, 120],
    ];
    floodPositions.forEach(([x, z]) => {
      floodHeads.push({ position: new THREE.Vector3(x, 27.4, z), rotationY: 0, scale: 1 });
    });

    return { yard, shipLoad, floodHeads, floodPositions };
  }, [quality.containerCount, quality.tier]);

  useEffect(() => {
    const paint = (mesh: THREE.InstancedMesh | null, placements: Placement[], seed: number) => {
      if (!mesh) return;
      applyPlacements(mesh, placements);
      const color = new THREE.Color();
      for (let i = 0; i < placements.length; i++) {
        color.set(CONTAINER_COLORS[(i * seed) % CONTAINER_COLORS.length]);
        mesh.setColorAt(i, color);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    paint(yardRef.current, layout.yard, 3);
    paint(shipLoadRef.current, layout.shipLoad, 5);
    if (floodHeadRef.current) applyPlacements(floodHeadRef.current, layout.floodHeads);
  }, [layout]);

  useFrame((state) => {
    const practicals = world.lighting.current.practicals;
    for (let i = 0; i < floods.current.length; i++) {
      const light = floods.current[i];
      if (!light) continue;
      light.intensity = practicals * 420;
      light.visible = practicals > 0.06;
    }
    for (let i = 0; i < craneLights.current.length; i++) {
      const light = craneLights.current[i];
      if (!light) continue;
      light.intensity = practicals * 300;
      light.visible = practicals > 0.06;
    }

    // Slow swell on the harbour.
    const t = state.clock.elapsedTime;
    const normalMap = materials.water.normalMap;
    if (normalMap) {
      normalMap.offset.set(t * 0.004, t * 0.011);
    }
  });

  return (
    <>
      <group position={anchor.position} rotation={[0, anchor.rotation, 0]}>
      {/* Apron */}
      <mesh
        position={[24, 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.apron}
        receiveShadow
      >
        <planeGeometry args={[210, 340]} />
      </mesh>

      {/* Quay wall and harbour */}
      <mesh position={[QUAY_EDGE, -0.7, 0]} material={materials.concreteBarrier} receiveShadow>
        <boxGeometry args={[3, 3, 340]} />
      </mesh>
      <mesh
        position={[QUAY_EDGE - 700, -1.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.water}
      >
        <planeGeometry args={[1400, 2400]} />
      </mesh>

      <Ship materials={materials} quality={quality} />

      <instancedMesh
        ref={shipLoadRef}
        args={[undefined, undefined, Math.max(1, layout.shipLoad.length)]}
        material={materials.containers}
        castShadow={quality.shadows}
      >
        <boxGeometry args={[2.44, 2.59, 12.19]} />
      </instancedMesh>

      {/* Container yard */}
      <instancedMesh
        ref={yardRef}
        args={[undefined, undefined, Math.max(1, layout.yard.length)]}
        material={materials.containers}
        castShadow={quality.shadows}
        receiveShadow
      >
        <boxGeometry args={[2.44, 2.59, 12.19]} />
      </instancedMesh>

      {/* Ship-to-shore cranes */}
      {[-96, 4, 104].map((z, i) => (
        <GantryCrane
          key={'crane-' + i}
          materials={materials}
          quality={quality}
          z={z}
          withLight={quality.maxPracticalLights >= 8}
          lightRef={(el) => {
            craneLights.current[i] = el;
          }}
        />
      ))}

      {/* Floodlight masts */}
      {layout.floodPositions.map(([x, z], i) => (
        <group key={'flood-' + i} position={[x, 0, z]}>
          <mesh position={[0, 13, 0]} material={materials.paintedSteel} castShadow={quality.shadows}>
            <cylinderGeometry args={[0.22, 0.42, 26, 6]} />
          </mesh>
          {i < quality.maxPracticalLights - 2 && (
          <pointLight
            ref={(el) => {
              floods.current[i] = el;
            }}
            position={[0, 26.4, 0]}
            color="#FFDCA6"
            distance={130}
            decay={1.4}
            intensity={0}
          />
          )}
        </group>
      ))}
      <instancedMesh
        ref={floodHeadRef}
        args={[undefined, undefined, Math.max(1, layout.floodHeads.length)]}
        material={materials.lampEmissive}
      >
        <boxGeometry args={[3.4, 0.5, 1.1]} />
      </instancedMesh>

      {/* Terminal buildings */}
      <mesh position={[128, 7, -150]} material={materials.cladding} castShadow receiveShadow>
        <boxGeometry args={[46, 14, 62]} />
      </mesh>
      <mesh position={[128, 14.6, -150]} material={materials.claddingDark}>
        <boxGeometry args={[47, 1.2, 63]} />
      </mesh>
      <mesh position={[104.6, 9.5, -150]} material={materials.glass}>
        <boxGeometry args={[0.3, 3.2, 52]} />
      </mesh>

      <ReachStacker materials={materials} position={[30, 0, 66]} rotationY={-1.3} />
      <ReachStacker materials={materials} position={[54, 0, -74]} rotationY={2.0} />
      </group>

      <UnloadingBay materials={materials} />
    </>
  );
}

/**
 * THE PAYOFF.
 *
 * Anchored to the exact point on the route where the rig stops, so the painted
 * bay, the stacker and the container being lifted off the trailer all line up
 * with the vehicle instead of being positioned by hand. The lift plays out over
 * the final chapter: the truck stops, the engine settles, and then the load
 * starts moving - which is what makes the ending read as an arrival rather than
 * as the animation simply running out.
 */
function UnloadingBay({ materials }: { materials: EnvironmentMaterials }) {
  const world = getWorld();
  const route = world.route;
  const liftRef = useRef<THREE.Group>(null);

  const anchor = useMemo(() => {
    const distance = route.at('unloadBay');
    return {
      position: route.position(distance, new THREE.Vector3()),
      rotation: route.heading(distance),
    };
  }, [route]);

  useFrame(() => {
    const group = liftRef.current;
    if (!group) return;
    // Starts once the rig is parked and the last chapter is running.
    const t = THREE.MathUtils.clamp((world.progress - 0.972) / 0.028, 0, 1);
    const eased = t * t * (3 - 2 * t);
    group.position.y = 3.1 + eased * 5.4;
    group.position.x = -3.2 - eased * 5.6;
    group.visible = t > 0.001;
  });

  return (
    <group position={anchor.position} rotation={[0, anchor.rotation, 0]}>
      {/* Painted bay the rig comes to rest in */}
      {[-1.7, 1.7].map((x) => (
        <mesh
          key={'bay-' + x}
          position={[x, 0.04, -6]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={materials.hazard}
        >
          <planeGeometry args={[0.22, 28]} />
        </mesh>
      ))}
      <mesh position={[0, 0.04, 8.4]} rotation={[-Math.PI / 2, 0, 0]} material={materials.hazard}>
        <planeGeometry args={[3.8, 0.28]} />
      </mesh>

      <ReachStacker materials={materials} position={[-11, 0, -7]} rotationY={1.62} />

      {/* The load coming off the deck */}
      <group ref={liftRef} position={[-3.2, 3.1, -7]} visible={false}>
        <mesh material={materials.containers} castShadow>
          <boxGeometry args={[2.44, 2.59, 12.19]} />
        </mesh>
        <mesh position={[0, 1.4, 0]} material={materials.darkSteel}>
          <boxGeometry args={[2.5, 0.2, 12.3]} />
        </mesh>
      </group>
    </group>
  );
}

function Ship({
  materials,
  quality,
}: {
  materials: EnvironmentMaterials;
  quality: QualitySettings;
}) {
  return (
    <group position={[-112, 0, 0]}>
      {/* Hull */}
      <mesh position={[0, 5.4, 0]} material={materials.claddingDark} castShadow={quality.shadows} receiveShadow>
        <boxGeometry args={[34, 15, 250]} />
      </mesh>
      <mesh position={[0, 11.4, 0]} material={materials.craneOrange}>
        <boxGeometry args={[34.6, 1.1, 250.4]} />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 5.4, 132]} rotation={[0, Math.PI / 4, 0]} material={materials.claddingDark} castShadow>
        <boxGeometry args={[24, 15, 24]} />
      </mesh>
      {/* Superstructure */}
      <group position={[0, 0, -96]}>
        <mesh position={[0, 20, 0]} material={materials.cladding} castShadow receiveShadow>
          <boxGeometry args={[30, 24, 26]} />
        </mesh>
        <mesh position={[0, 29.5, 1]} material={materials.glass}>
          <boxGeometry args={[30.4, 2.6, 24]} />
        </mesh>
        <mesh position={[0, 38, -3]} material={materials.claddingDark} castShadow>
          <cylinderGeometry args={[3.4, 3.9, 14, 10]} />
        </mesh>
        <mesh position={[0, 45.4, -3]} material={materials.craneOrange}>
          <cylinderGeometry args={[3.5, 3.5, 1.4, 10]} />
        </mesh>
      </group>
    </group>
  );
}

function GantryCrane({
  materials,
  quality,
  z,
  withLight,
  lightRef,
}: {
  materials: EnvironmentMaterials;
  quality: QualitySettings;
  z: number;
  withLight: boolean;
  lightRef: (el: THREE.PointLight | null) => void;
}) {
  const legs: [number, number][] = [
    [-64, -14],
    [-64, 14],
    [-24, -14],
    [-24, 14],
  ];

  return (
    <group position={[0, 0, z]}>
      {legs.map(([x, dz], i) => (
        <mesh
          key={'leg-' + i}
          position={[x, 26, dz]}
          material={materials.craneOrange}
          castShadow={quality.shadows}
        >
          <boxGeometry args={[2.4, 52, 2.4]} />
        </mesh>
      ))}
      {/* Portal beams */}
      {[-14, 14].map((dz) => (
        <mesh key={'portal-' + dz} position={[-44, 51, dz]} material={materials.craneOrange} castShadow>
          <boxGeometry args={[44, 3, 2.4]} />
        </mesh>
      ))}
      {/* Boom reaching out over the ship, and the counterweight arm */}
      <mesh position={[-96, 56, 0]} material={materials.craneOrange} castShadow>
        <boxGeometry args={[76, 3.4, 5.5]} />
      </mesh>
      <mesh position={[-14, 56, 0]} material={materials.craneOrange} castShadow>
        <boxGeometry args={[32, 3.4, 5.5]} />
      </mesh>
      <mesh position={[-44, 66, 0]} material={materials.craneOrange} castShadow>
        <boxGeometry args={[3, 22, 3]} />
      </mesh>
      {/* Operator cab and trolley */}
      <mesh position={[-84, 50.5, 0]} material={materials.darkSteel} castShadow>
        <boxGeometry args={[5.5, 4, 6]} />
      </mesh>
      <mesh position={[-84, 44, 0]} material={materials.paintedSteel}>
        <boxGeometry args={[7, 1.4, 8]} />
      </mesh>
      <mesh position={[-84, 40, 0]} material={materials.hazard}>
        <boxGeometry args={[2.6, 6, 12.4]} />
      </mesh>
      <mesh position={[-44, 53.6, 0]} material={materials.lampEmissive}>
        <boxGeometry args={[3, 0.4, 1]} />
      </mesh>
      {withLight && (
        <pointLight
          ref={lightRef}
          position={[-64, 50, 0]}
          color="#CFE2FF"
          distance={140}
          decay={1.4}
          intensity={0}
        />
      )}
    </group>
  );
}

function ReachStacker({
  materials,
  position,
  rotationY,
}: {
  materials: EnvironmentMaterials;
  position: [number, number, number];
  rotationY: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.5, 0]} material={materials.hazard} castShadow>
        <boxGeometry args={[3.2, 2.2, 8.4]} />
      </mesh>
      <mesh position={[0, 3.3, -2.2]} material={materials.darkSteel} castShadow>
        <boxGeometry args={[2.2, 2, 2.2]} />
      </mesh>
      <mesh position={[0, 4.1, -2.2]} material={materials.glass}>
        <boxGeometry args={[2.25, 1.1, 2.25]} />
      </mesh>
      <mesh position={[0, 4.6, 2.2]} rotation={[0.55, 0, 0]} material={materials.paintedSteel} castShadow>
        <boxGeometry args={[1.5, 1.3, 13]} />
      </mesh>
      {[
        [-1.7, 2.6],
        [1.7, 2.6],
        [-1.5, -2.8],
        [1.5, -2.8],
      ].map(([x, z], i) => (
        <mesh
          key={'w-' + i}
          position={[x, 0.85, z]}
          rotation={[0, 0, Math.PI / 2]}
          material={materials.darkSteel}
        >
          <cylinderGeometry args={[0.85, 0.85, 0.7, 12]} />
        </mesh>
      ))}
    </group>
  );
}
