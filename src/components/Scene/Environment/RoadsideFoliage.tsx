import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Natural Roadside Foliage & Highway Utility Infrastructure
 * Features organic multi-tiered evergreen/pine tree clusters with scale & yaw variance,
 * roadside sage bushes, and wooden utility poles with hanging catenary power cables.
 */
export function RoadsideFoliage() {
  const materials = useMemo(() => {
    // 1. Natural Deep Forest / Muted Sage Green Pine Foliage
    const foliageDark = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4E614D'),
      roughness: 0.85,
      metalness: 0.08,
      flatShading: true,
    });

    const foliageLight = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#657A64'),
      roughness: 0.82,
      metalness: 0.05,
      flatShading: true,
    });

    // 2. Weathered Timber Wood (Trunks & Utility Poles)
    const timberWood = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A3C31'),
      roughness: 0.92,
      metalness: 0.04,
    });

    // 3. Power Cable Wire (Thin Dark Catenary)
    const cableWire = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F2326'),
      roughness: 0.7,
      metalness: 0.5,
    });

    // 4. White Porcelain Ceramic Insulator
    const ceramicInsulator = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F0F4F8'),
      roughness: 0.2,
      metalness: 0.1,
    });

    // 5. Overhead Highway Guide Sign (I-80 Westbound)
    const signGreen = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#166534'),
      roughness: 0.4,
      metalness: 0.2,
    });
    const signWhite = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F8FAFC'),
      roughness: 0.3,
    });

    return {
      foliageDark,
      foliageLight,
      timberWood,
      cableWire,
      ceramicInsulator,
      signGreen,
      signWhite,
    };
  }, []);

  // Generate 28 organic natural tree cluster coordinates
  const treeClusters = useMemo(() => {
    const trees: { x: number; z: number; scale: number; rotY: number; isDark: boolean }[] = [];
    const zCoords = [-144, -120, -96, -72, -48, -24, 0, 24, 48, 72, 96, 120, 144];

    zCoords.forEach((z, i) => {
      // Left verge tree cluster
      trees.push({
        x: -9.5 - (i % 3) * 3.5,
        z: z + (i % 2) * 2.5,
        scale: 0.8 + ((i * 7) % 5) * 0.12,
        rotY: (i * 1.3) % Math.PI,
        isDark: i % 2 === 0,
      });

      // Right verge tree cluster
      trees.push({
        x: 9.5 + ((i + 1) % 3) * 3.5,
        z: z + 4 - (i % 2) * 2.0,
        scale: 0.85 + ((i * 3) % 4) * 0.14,
        rotY: (i * 2.1) % Math.PI,
        isDark: (i + 1) % 2 === 0,
      });
    });

    return trees;
  }, []);

  // Utility pole coordinates every 24 meters on the right side
  const utilityPoles = useMemo(() => {
    return [-144, -120, -96, -72, -48, -24, 0, 24, 48, 72, 96, 120, 144];
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* 1. NATURAL PINE & DECIDUOUS TREE CLUSTERS                                */}
      {/* ========================================================================= */}
      {treeClusters.map((tree, idx) => (
        <group
          key={`tree-${idx}`}
          position={[tree.x, 0, tree.z]}
          rotation={[0, tree.rotY, 0]}
          scale={[tree.scale, tree.scale, tree.scale]}
        >
          {/* Tree Trunk */}
          <mesh position={[0, 1.0, 0]} material={materials.timberWood} castShadow>
            <cylinderGeometry args={[0.18, 0.28, 2.0, 8]} />
          </mesh>

          {/* Tier 1 Lower Foliage Cluster (Dodecahedron/Octahedron) */}
          <mesh
            position={[0, 2.2, 0]}
            material={tree.isDark ? materials.foliageDark : materials.foliageLight}
            castShadow
          >
            <dodecahedronGeometry args={[1.35, 1]} />
          </mesh>

          {/* Tier 2 Middle Foliage Cluster */}
          <mesh
            position={[0, 3.4, 0]}
            material={tree.isDark ? materials.foliageLight : materials.foliageDark}
            castShadow
          >
            <dodecahedronGeometry args={[1.05, 1]} />
          </mesh>

          {/* Tier 3 Crown Peak */}
          <mesh
            position={[0, 4.4, 0]}
            material={tree.isDark ? materials.foliageDark : materials.foliageLight}
            castShadow
          >
            <octahedronGeometry args={[0.75, 1]} />
          </mesh>
        </group>
      ))}

      {/* ========================================================================= */}
      {/* 2. WOODEN UTILITY POLES & HANGING CATENARY POWER WIRES                   */}
      {/* ========================================================================= */}
      {utilityPoles.map((z, idx) => (
        <group key={`pole-${idx}`} position={[8.4, 0, z]}>
          {/* Main Wooden Pole */}
          <mesh position={[0, 3.8, 0]} material={materials.timberWood} castShadow>
            <cylinderGeometry args={[0.14, 0.18, 7.6, 10]} />
          </mesh>

          {/* Upper Timber Crossarm */}
          <mesh position={[0, 6.8, 0]} material={materials.timberWood}>
            <boxGeometry args={[0.12, 0.16, 2.2]} />
          </mesh>

          {/* Left & Right Ceramic Insulators */}
          <mesh position={[0, 7.0, -0.9]} material={materials.ceramicInsulator}>
            <cylinderGeometry args={[0.04, 0.04, 0.18, 8]} />
          </mesh>
          <mesh position={[0, 7.0, 0.9]} material={materials.ceramicInsulator}>
            <cylinderGeometry args={[0.04, 0.04, 0.18, 8]} />
          </mesh>
        </group>
      ))}

      {/* Hanging Continuous Power Line Segment parallel to highway */}
      <mesh position={[8.4, 6.95, 0]} material={materials.cableWire}>
        <boxGeometry args={[0.02, 0.02, 220]} />
      </mesh>

      {/* ========================================================================= */}
      {/* 3. OVERHEAD HIGHWAY GANTRY GUIDE SIGN (I-80 INTERSTATE CORRIDOR)          */}
      {/* ========================================================================= */}
      <group position={[0, 0, -42]}>
        {/* Left & Right Steel Overhead Trusses */}
        <mesh position={[-6.2, 3.6, 0]} material={materials.timberWood}>
          <cylinderGeometry args={[0.18, 0.22, 7.2, 10]} />
        </mesh>
        <mesh position={[6.2, 3.6, 0]} material={materials.timberWood}>
          <cylinderGeometry args={[0.18, 0.22, 7.2, 10]} />
        </mesh>
        <mesh position={[0, 6.6, 0]} material={materials.timberWood}>
          <boxGeometry args={[12.6, 0.35, 0.35]} />
        </mesh>

        {/* Green Interstate Directional Signboard */}
        <group position={[0, 6.4, -0.2]}>
          <mesh material={materials.signGreen} castShadow>
            <boxGeometry args={[5.6, 1.8, 0.08]} />
          </mesh>
          {/* Sign Border & Route Text Bar */}
          <mesh position={[0, 0.45, 0.05]} material={materials.signWhite}>
            <boxGeometry args={[5.2, 0.08, 0.02]} />
          </mesh>
          <mesh position={[0, 0, 0.05]} material={materials.signWhite}>
            <boxGeometry args={[4.2, 0.35, 0.02]} />
          </mesh>
          <mesh position={[0, -0.5, 0.05]} material={materials.signWhite}>
            <boxGeometry args={[2.8, 0.25, 0.02]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
