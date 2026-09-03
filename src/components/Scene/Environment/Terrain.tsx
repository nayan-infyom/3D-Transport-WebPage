import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { QualitySettings } from '../../../config/quality';
import { applyPlacements, seededRandom, type Placement } from '../../../systems/geometry/ribbon';
import { getWorld } from '../../../systems/World';
import type { EnvironmentMaterials } from './materials';

/**
 * The land the journey crosses.
 *
 * A single ground plane plus two instanced silhouettes - eroded hills and a
 * distant industrial skyline - carry the whole horizon. Depth comes from fog
 * and scale, not from mesh count: three draw calls for everything past 150 m.
 */
export function Terrain({
  quality,
  materials,
}: {
  quality: QualitySettings;
  materials: EnvironmentMaterials;
}) {
  const world = getWorld();
  const route = world.route;
  const hillsRef = useRef<THREE.InstancedMesh>(null);
  const ridgeRef = useRef<THREE.InstancedMesh>(null);
  const cityRef = useRef<THREE.InstancedMesh>(null);

  const layout = useMemo(() => {
    const rand = seededRandom(20240917);
    const hills: Placement[] = [];
    const ridges: Placement[] = [];
    const city: Placement[] = [];
    const length = route.length;

    const hillCount = quality.tier === 'low' ? 26 : 54;
    for (let i = 0; i < hillCount; i++) {
      const s = (length * i) / hillCount + rand() * 40;
      const side = rand() > 0.5 ? 1 : -1;
      const lateral = side * (210 + rand() * 460);
      const position = route.offsetPosition(s, lateral, new THREE.Vector3());
      position.y = -2 - rand() * 6;
      const height = 30 + rand() * 74;
      hills.push({
        position,
        rotationY: rand() * Math.PI,
        scale: new THREE.Vector3(height * (1.5 + rand()), height, height * (1.6 + rand())),
      });
    }

    const ridgeCount = quality.tier === 'low' ? 14 : 28;
    for (let i = 0; i < ridgeCount; i++) {
      const s = (length * i) / ridgeCount + rand() * 90;
      const side = rand() > 0.5 ? 1 : -1;
      const lateral = side * (760 + rand() * 900);
      const position = route.offsetPosition(s, lateral, new THREE.Vector3());
      position.y = -20 - rand() * 20;
      const height = 130 + rand() * 220;
      ridges.push({
        position,
        rotationY: rand() * Math.PI,
        scale: new THREE.Vector3(height * 2.2, height, height * 2.4),
      });
    }

    // Distant refinery / industrial blocks, only near the corridors.
    const cityCount = quality.tier === 'low' ? 24 : 64;
    for (let i = 0; i < cityCount; i++) {
      const s = 180 + rand() * (length - 260);
      const side = rand() > 0.5 ? 1 : -1;
      const lateral = side * (260 + rand() * 380);
      const position = route.offsetPosition(s, lateral, new THREE.Vector3());
      const h = 12 + rand() * 46;
      position.y = h / 2 - 1.5;
      city.push({
        position,
        rotationY: rand() * Math.PI,
        scale: new THREE.Vector3(16 + rand() * 40, h, 16 + rand() * 40),
      });
    }

    return { hills, ridges, city };
  }, [route, quality.tier]);

  useEffect(() => {
    if (hillsRef.current) applyPlacements(hillsRef.current, layout.hills);
    if (ridgeRef.current) applyPlacements(ridgeRef.current, layout.ridges);
    if (cityRef.current) applyPlacements(cityRef.current, layout.city);
  }, [layout]);

  const groundCenter = useMemo(
    () => route.position(route.length * 0.5, new THREE.Vector3()),
    [route]
  );

  return (
    <group>
      <mesh
        position={[groundCenter.x, -1.62, groundCenter.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.ground}
        receiveShadow={quality.tier === 'high'}
      >
        <planeGeometry args={[5200, 5200]} />
      </mesh>

      <instancedMesh
        ref={hillsRef}
        args={[undefined, undefined, Math.max(1, layout.hills.length)]}
        material={materials.distantTerrain}
        frustumCulled
      >
        <dodecahedronGeometry args={[1, 0]} />
      </instancedMesh>

      <instancedMesh
        ref={ridgeRef}
        args={[undefined, undefined, Math.max(1, layout.ridges.length)]}
        material={materials.distantTerrain}
        frustumCulled
      >
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>

      <instancedMesh
        ref={cityRef}
        args={[undefined, undefined, Math.max(1, layout.city.length)]}
        material={materials.distantCity}
        frustumCulled
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  );
}
