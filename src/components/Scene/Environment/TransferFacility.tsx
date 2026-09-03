import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { QualitySettings } from '../../../config/quality';
import { applyPlacements, seededRandom, type Placement } from '../../../systems/geometry/ribbon';
import { getWorld } from '../../../systems/World';
import { CONTAINER_COLORS, type EnvironmentMaterials } from './materials';
import { Forklift } from './OriginWarehouse';

/**
 * ACT FOUR - the transfer facility.
 *
 * A cross-dock: long canopy over the lanes, a dock wall of doors with trailers
 * backed onto them, a yard of containers behind. The rig comes to a full stop
 * under the canopy, which is what gives the middle of the film its beat of
 * stillness.
 */
export function TransferFacility({
  quality,
  materials,
}: {
  quality: QualitySettings;
  materials: EnvironmentMaterials;
}) {
  const world = getWorld();
  const route = world.route;

  const columnRef = useRef<THREE.InstancedMesh>(null);
  const doorRef = useRef<THREE.InstancedMesh>(null);
  const bumperRef = useRef<THREE.InstancedMesh>(null);
  const trailerRef = useRef<THREE.InstancedMesh>(null);
  const containerRef = useRef<THREE.InstancedMesh>(null);
  const fixtureRef = useRef<THREE.InstancedMesh>(null);
  const floods = useRef<(THREE.PointLight | null)[]>([]);

  const anchor = useMemo(() => {
    const distance = route.at('transferDock');
    return {
      position: route.position(distance, new THREE.Vector3()),
      rotation: route.heading(distance),
    };
  }, [route]);

  const layout = useMemo(() => {
    const rand = seededRandom(3307);
    const columns: Placement[] = [];
    const doors: Placement[] = [];
    const bumpers: Placement[] = [];
    const trailers: Placement[] = [];
    const containers: Placement[] = [];
    const fixtures: Placement[] = [];

    for (let z = -34; z <= 34; z += 11.5) {
      [-20, 20].forEach((x) => {
        columns.push({ position: new THREE.Vector3(x, 5.4, z), rotationY: 0, scale: 1 });
      });
      fixtures.push({ position: new THREE.Vector3(0, 10, z), rotationY: 0, scale: 1 });
    }

    for (let i = 0; i < 6; i++) {
      const z = -30 + i * 12;
      doors.push({ position: new THREE.Vector3(-28.9, 2.6, z), rotationY: 0, scale: 1 });
      bumpers.push({ position: new THREE.Vector3(-28.4, 1.25, z), rotationY: 0, scale: 1 });
      if (i !== 2 && i !== 4) {
        trailers.push({
          position: new THREE.Vector3(-21.5, 2.35, z),
          rotationY: Math.PI / 2,
          scale: 1,
        });
      }
    }

    // Container yard behind the dock.
    const blocks = quality.tier === 'low' ? 2 : 4;
    for (let b = 0; b < blocks; b++) {
      const baseZ = -52 + b * 34;
      for (let col = 0; col < 5; col++) {
        const stack = 1 + Math.floor(rand() * 3);
        for (let level = 0; level < stack; level++) {
          containers.push({
            position: new THREE.Vector3(38 + col * 2.9, 1.3 + level * 2.65, baseZ + rand() * 2),
            rotationY: 0,
            scale: 1,
          });
        }
      }
    }

    return { columns, doors, bumpers, trailers, containers, fixtures };
  }, [quality.tier]);

  useEffect(() => {
    if (columnRef.current) applyPlacements(columnRef.current, layout.columns);
    if (doorRef.current) applyPlacements(doorRef.current, layout.doors);
    if (bumperRef.current) applyPlacements(bumperRef.current, layout.bumpers);
    if (fixtureRef.current) applyPlacements(fixtureRef.current, layout.fixtures);

    const trailers = trailerRef.current;
    if (trailers) {
      applyPlacements(trailers, layout.trailers);
      const color = new THREE.Color();
      for (let i = 0; i < layout.trailers.length; i++) {
        color.set(i % 2 === 0 ? '#E4E1DA' : '#C9CDD2');
        trailers.setColorAt(i, color);
      }
      if (trailers.instanceColor) trailers.instanceColor.needsUpdate = true;
    }

    const containers = containerRef.current;
    if (containers) {
      applyPlacements(containers, layout.containers);
      const color = new THREE.Color();
      for (let i = 0; i < layout.containers.length; i++) {
        color.set(CONTAINER_COLORS[(i * 5) % CONTAINER_COLORS.length]);
        containers.setColorAt(i, color);
      }
      if (containers.instanceColor) containers.instanceColor.needsUpdate = true;
    }
  }, [layout]);

  useFrame(() => {
    const practicals = world.lighting.current.practicals;
    for (let i = 0; i < floods.current.length; i++) {
      const light = floods.current[i];
      if (!light) continue;
      light.intensity = practicals * 260;
      light.visible = practicals > 0.05;
    }
  });

  return (
    <group position={anchor.position} rotation={[0, anchor.rotation, 0]}>
      {/* Apron */}
      <mesh
        position={[2, 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.apron}
        receiveShadow
      >
        <planeGeometry args={[150, 140]} />
      </mesh>

      {/* Canopy over the lanes */}
      <mesh position={[0, 10.4, 0]} material={materials.cladding} castShadow receiveShadow>
        <boxGeometry args={[46, 0.8, 80]} />
      </mesh>
      <instancedMesh
        ref={columnRef}
        args={[undefined, undefined, Math.max(1, layout.columns.length)]}
        material={materials.paintedSteel}
        castShadow={quality.shadows}
      >
        <boxGeometry args={[0.7, 10.8, 0.7]} />
      </instancedMesh>
      <instancedMesh
        ref={fixtureRef}
        args={[undefined, undefined, Math.max(1, layout.fixtures.length)]}
        material={materials.lampEmissive}
      >
        <boxGeometry args={[7, 0.2, 0.6]} />
      </instancedMesh>

      {/* Dock building */}
      <mesh position={[-40, 6, 0]} material={materials.cladding} castShadow receiveShadow>
        <boxGeometry args={[24, 12, 92]} />
      </mesh>
      <mesh position={[-40, 12.5, 0]} material={materials.claddingDark}>
        <boxGeometry args={[25, 1, 93]} />
      </mesh>
      <mesh position={[-27.9, 9.6, 20]} material={materials.signFace}>
        <boxGeometry args={[0.2, 2.4, 22]} />
      </mesh>

      <instancedMesh
        ref={doorRef}
        args={[undefined, undefined, Math.max(1, layout.doors.length)]}
        material={materials.darkSteel}
      >
        <boxGeometry args={[0.3, 5, 4.2]} />
      </instancedMesh>
      <instancedMesh
        ref={bumperRef}
        args={[undefined, undefined, Math.max(1, layout.bumpers.length)]}
        material={materials.hazard}
      >
        <boxGeometry args={[0.5, 0.35, 5]} />
      </instancedMesh>

      {/* Trailers backed onto the dock */}
      <instancedMesh
        ref={trailerRef}
        args={[undefined, undefined, Math.max(1, layout.trailers.length)]}
        material={materials.containers}
        castShadow={quality.shadows}
        receiveShadow
      >
        <boxGeometry args={[2.54, 3.1, 15.6]} />
      </instancedMesh>

      <instancedMesh
        ref={containerRef}
        args={[undefined, undefined, Math.max(1, layout.containers.length)]}
        material={materials.containers}
        castShadow={quality.shadows}
        receiveShadow
      >
        <boxGeometry args={[2.44, 2.59, 12.19]} />
      </instancedMesh>

      {/* Floodlight masts */}
      {[
        [-8, -52],
        [-8, 52],
        [46, -20],
        [46, 40],
      ].map(([x, z], i) => (
        <group key={'mast-' + i} position={[x, 0, z]}>
          <mesh position={[0, 9, 0]} material={materials.paintedSteel} castShadow>
            <cylinderGeometry args={[0.18, 0.3, 18, 6]} />
          </mesh>
          <mesh position={[0, 18.2, 0]} material={materials.lampEmissive}>
            <boxGeometry args={[2.4, 0.4, 0.7]} />
          </mesh>
          {i < quality.maxPracticalLights - 1 && (
          <pointLight
            ref={(el) => {
              floods.current[i] = el;
            }}
            position={[0, 17.6, 0]}
            color="#FFE3B4"
            distance={90}
            decay={1.5}
            intensity={0}
          />
          )}
        </group>
      ))}

      <Forklift materials={materials} position={[-16, 0, -44]} rotationY={1.2} />
      <Forklift materials={materials} position={[26, 0, 30]} rotationY={-0.4} />
    </group>
  );
}
