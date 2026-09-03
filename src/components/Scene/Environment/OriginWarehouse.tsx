import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { QualitySettings } from '../../../config/quality';
import { applyPlacements, seededRandom, type Placement } from '../../../systems/geometry/ribbon';
import { getWorld } from '../../../systems/World';
import { CONTAINER_COLORS, type EnvironmentMaterials } from './materials';

const HEIGHT = 15;
const HALF_WIDTH = 22;
const BACK = -44;
const FRONT = 56;
const DOOR_HALF = 7.5;
const DOOR_HEIGHT = 7.2;

/**
 * ACT ONE - the origin warehouse.
 *
 * A deliberately cavernous, top-lit box: long sight lines, deep shadow between
 * the light pools and just enough working detail (racking, pallets, dock doors,
 * floor markings) to say this is a place where freight actually moves. Repeated
 * structure - pillars, trusses, racking, pallets - is instanced.
 */
export function OriginWarehouse({
  quality,
  materials,
}: {
  quality: QualitySettings;
  materials: EnvironmentMaterials;
}) {
  const world = getWorld();
  const route = world.route;

  const pillarRef = useRef<THREE.InstancedMesh>(null);
  const trussRef = useRef<THREE.InstancedMesh>(null);
  const fixtureRef = useRef<THREE.InstancedMesh>(null);
  const rackRef = useRef<THREE.InstancedMesh>(null);
  const shelfRef = useRef<THREE.InstancedMesh>(null);
  const palletRef = useRef<THREE.InstancedMesh>(null);
  const bayLights = useRef<(THREE.PointLight | null)[]>([]);

  const anchor = useMemo(() => {
    const distance = route.at('originDock');
    return {
      position: route.position(distance, new THREE.Vector3()),
      rotation: route.heading(distance),
    };
  }, [route]);

  const layout = useMemo(() => {
    const rand = seededRandom(5150);
    const pillars: Placement[] = [];
    const trusses: Placement[] = [];
    const fixtures: Placement[] = [];
    const racks: Placement[] = [];
    const shelves: Placement[] = [];
    const pallets: Placement[] = [];

    for (let z = BACK + 6; z < FRONT; z += 11) {
      [-HALF_WIDTH + 1.2, HALF_WIDTH - 1.2].forEach((x) => {
        pillars.push({ position: new THREE.Vector3(x, HEIGHT / 2, z), rotationY: 0, scale: 1 });
      });
      trusses.push({ position: new THREE.Vector3(0, HEIGHT - 0.7, z), rotationY: 0, scale: 1 });
    }

    for (let z = BACK + 10; z < FRONT - 6; z += 13) {
      fixtures.push({ position: new THREE.Vector3(-7.5, HEIGHT - 2.4, z), rotationY: 0, scale: 1 });
      fixtures.push({ position: new THREE.Vector3(7.5, HEIGHT - 2.4, z), rotationY: 0, scale: 1 });
    }

    // Pallet racking down both long walls.
    [-1, 1].forEach((side) => {
      for (let z = BACK + 8; z < FRONT - 16; z += 3.1) {
        const x = side * (HALF_WIDTH - 3.4);
        racks.push({ position: new THREE.Vector3(x, 4.2, z), rotationY: 0, scale: 1 });
        for (let level = 0; level < 3; level++) {
          shelves.push({
            position: new THREE.Vector3(x, 1.6 + level * 2.6, z + 1.55),
            rotationY: 0,
            scale: 1,
          });
          if (rand() > 0.32) {
            pallets.push({
              position: new THREE.Vector3(
                x + (rand() - 0.5) * 0.5,
                1.95 + level * 2.6,
                z + 1.55 + (rand() - 0.5) * 0.4
              ),
              rotationY: (rand() - 0.5) * 0.12,
              scale: 0.85 + rand() * 0.3,
            });
          }
        }
      }
    });

    return { pillars, trusses, fixtures, racks, shelves, pallets };
  }, []);

  useEffect(() => {
    if (pillarRef.current) applyPlacements(pillarRef.current, layout.pillars);
    if (trussRef.current) applyPlacements(trussRef.current, layout.trusses);
    if (fixtureRef.current) applyPlacements(fixtureRef.current, layout.fixtures);
    if (rackRef.current) applyPlacements(rackRef.current, layout.racks);
    if (shelfRef.current) applyPlacements(shelfRef.current, layout.shelves);

    const pallet = palletRef.current;
    if (pallet) {
      applyPlacements(pallet, layout.pallets);
      const color = new THREE.Color();
      for (let i = 0; i < layout.pallets.length; i++) {
        color.set(CONTAINER_COLORS[i % CONTAINER_COLORS.length]).multiplyScalar(0.85);
        pallet.setColorAt(i, color);
      }
      if (pallet.instanceColor) pallet.instanceColor.needsUpdate = true;
    }
  }, [layout]);

  useFrame(() => {
    const practicals = world.lighting.current.practicals;
    for (let i = 0; i < bayLights.current.length; i++) {
      const light = bayLights.current[i];
      if (!light) continue;
      light.intensity = practicals * 420;
      light.visible = practicals > 0.05;
    }
  });

  const wallThickness = 0.8;
  const sideWallLength = FRONT - BACK;
  const sideWallCenter = (FRONT + BACK) / 2;

  return (
    <group position={anchor.position} rotation={[0, anchor.rotation, 0]}>
      {/* Floor */}
      <mesh
        position={[0, 0.012, sideWallCenter]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.warehouseFloor}
        receiveShadow
      >
        <planeGeometry args={[HALF_WIDTH * 2, sideWallLength]} />
      </mesh>

      {/* Painted bay markings on the slab */}
      {[-9, 9].map((x) => (
        <mesh
          key={'lane-' + x}
          position={[x, 0.02, sideWallCenter]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={materials.paintLine}
        >
          <planeGeometry args={[0.18, sideWallLength - 12]} />
        </mesh>
      ))}
      {[-16, 16].map((x) => (
        <mesh
          key={'hatch-' + x}
          position={[x, 0.02, sideWallCenter]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={materials.hazard}
        >
          <planeGeometry args={[0.12, sideWallLength - 20]} />
        </mesh>
      ))}

      {/* Shell */}
      <mesh position={[-HALF_WIDTH, HEIGHT / 2, sideWallCenter]} material={materials.claddingDark} receiveShadow>
        <boxGeometry args={[wallThickness, HEIGHT, sideWallLength]} />
      </mesh>
      <mesh position={[HALF_WIDTH, HEIGHT / 2, sideWallCenter]} material={materials.claddingDark} receiveShadow>
        <boxGeometry args={[wallThickness, HEIGHT, sideWallLength]} />
      </mesh>
      <mesh position={[0, HEIGHT / 2, BACK]} material={materials.claddingDark} receiveShadow>
        <boxGeometry args={[HALF_WIDTH * 2, HEIGHT, wallThickness]} />
      </mesh>
      <mesh position={[0, HEIGHT + 0.4, sideWallCenter]} material={materials.claddingDark} receiveShadow>
        <boxGeometry args={[HALF_WIDTH * 2 + 1, 0.8, sideWallLength]} />
      </mesh>

      {/* Front elevation with the door opening the rig drives out through */}
      <mesh
        position={[-(HALF_WIDTH + DOOR_HALF) / 2 - DOOR_HALF / 2, HEIGHT / 2, FRONT]}
        material={materials.cladding}
        receiveShadow
      >
        <boxGeometry args={[HALF_WIDTH - DOOR_HALF, HEIGHT, wallThickness]} />
      </mesh>
      <mesh
        position={[(HALF_WIDTH + DOOR_HALF) / 2 + DOOR_HALF / 2, HEIGHT / 2, FRONT]}
        material={materials.cladding}
        receiveShadow
      >
        <boxGeometry args={[HALF_WIDTH - DOOR_HALF, HEIGHT, wallThickness]} />
      </mesh>
      <mesh
        position={[0, DOOR_HEIGHT + (HEIGHT - DOOR_HEIGHT) / 2, FRONT]}
        material={materials.cladding}
        receiveShadow
      >
        <boxGeometry args={[DOOR_HALF * 2, HEIGHT - DOOR_HEIGHT, wallThickness]} />
      </mesh>
      <mesh position={[0, DOOR_HEIGHT + 0.35, FRONT]} material={materials.hazard}>
        <boxGeometry args={[DOOR_HALF * 2 + 0.6, 0.3, wallThickness + 0.2]} />
      </mesh>

      {/* Structure */}
      <instancedMesh
        ref={pillarRef}
        args={[undefined, undefined, Math.max(1, layout.pillars.length)]}
        material={materials.darkSteel}
        castShadow={quality.shadows}
        receiveShadow
      >
        <boxGeometry args={[0.9, HEIGHT, 0.9]} />
      </instancedMesh>

      <instancedMesh
        ref={trussRef}
        args={[undefined, undefined, Math.max(1, layout.trusses.length)]}
        material={materials.darkSteel}
        castShadow={quality.shadows}
      >
        <boxGeometry args={[HALF_WIDTH * 2 - 2, 1.1, 0.55]} />
      </instancedMesh>

      <instancedMesh
        ref={fixtureRef}
        args={[undefined, undefined, Math.max(1, layout.fixtures.length)]}
        material={materials.lampEmissive}
      >
        <boxGeometry args={[1.5, 0.22, 0.7]} />
      </instancedMesh>

      {/* Racking */}
      <instancedMesh
        ref={rackRef}
        args={[undefined, undefined, Math.max(1, layout.racks.length)]}
        material={materials.craneOrange}
        castShadow={quality.shadows}
      >
        <boxGeometry args={[1.1, 8.4, 0.16]} />
      </instancedMesh>
      <instancedMesh
        ref={shelfRef}
        args={[undefined, undefined, Math.max(1, layout.shelves.length)]}
        material={materials.paintedSteel}
      >
        <boxGeometry args={[1.2, 0.1, 2.9]} />
      </instancedMesh>
      <instancedMesh
        ref={palletRef}
        args={[undefined, undefined, Math.max(1, layout.pallets.length)]}
        material={materials.containers}
        castShadow={quality.shadows}
      >
        <boxGeometry args={[1.05, 0.75, 1.15]} />
      </instancedMesh>

      {/* Practical light pools - four is enough to model the whole room */}
      {[BACK + 16, BACK + 40, BACK + 64, FRONT - 12]
        .slice(0, Math.min(4, quality.maxPracticalLights))
        .map((z, i) => (
        <pointLight
          key={'bay-' + i}
          ref={(el) => {
            bayLights.current[i] = el;
          }}
          position={[0, HEIGHT - 3, z]}
          color="#FFEBC8"
          distance={44}
          decay={1.5}
          intensity={0}
          castShadow={quality.shadows && quality.tier === 'high' && i === 1}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-bias={-0.002}
        />
        ))}

      <Forklift materials={materials} position={[-14, 0, 12]} rotationY={0.6} />
      <Forklift materials={materials} position={[15.5, 0, -18]} rotationY={-2.1} />
    </group>
  );
}

/** A compact working prop. Twelve boxes, and the room instantly has a scale. */
export function Forklift({
  materials,
  position,
  rotationY = 0,
}: {
  materials: EnvironmentMaterials;
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.75, 0]} material={materials.hazard} castShadow>
        <boxGeometry args={[1.15, 0.9, 2.1]} />
      </mesh>
      <mesh position={[0, 1.45, -0.35]} material={materials.darkSteel} castShadow>
        <boxGeometry args={[0.95, 0.55, 0.7]} />
      </mesh>
      <mesh position={[0, 2.15, -0.1]} material={materials.darkSteel}>
        <boxGeometry args={[1.05, 0.08, 1.1]} />
      </mesh>
      {[-0.45, 0.45].map((x) => (
        <mesh key={'cage-' + x} position={[x, 1.9, -0.6]} material={materials.darkSteel}>
          <boxGeometry args={[0.07, 0.9, 0.07]} />
        </mesh>
      ))}
      <mesh position={[0, 1.5, 1.15]} material={materials.paintedSteel} castShadow>
        <boxGeometry args={[1.0, 2.6, 0.12]} />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <mesh key={'fork-' + x} position={[x, 0.16, 1.6]} material={materials.paintedSteel}>
          <boxGeometry args={[0.14, 0.06, 1.0]} />
        </mesh>
      ))}
      {[
        [-0.58, 0.75],
        [0.58, 0.75],
        [-0.5, -0.75],
        [0.5, -0.75],
      ].map(([x, z], i) => (
        <mesh
          key={'wheel-' + i}
          position={[x, 0.33, z]}
          rotation={[0, 0, Math.PI / 2]}
          material={materials.darkSteel}
        >
          <cylinderGeometry args={[0.33, 0.33, 0.24, 10]} />
        </mesh>
      ))}
    </group>
  );
}
