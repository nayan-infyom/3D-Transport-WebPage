import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Multi-Layered Sculpted Mountain Terrain Ridges
 * Features 3 progressive depth layers with realistic eroded ridge profiles,
 * distance color desaturation, and atmospheric haze blending.
 */
export function MountainRange() {
  const materials = useMemo(() => {
    // Layer 1: Near-Mid Foothills & Ridge (Warm Slate & Prairie Stone)
    const nearRidge = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D6CFBF'),
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });

    // Layer 2: Distant Mountain Range (Atmospheric Blue-Stone)
    const midMountain = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C2BDB0'),
      roughness: 0.98,
      metalness: 0.02,
      flatShading: true,
    });

    // Layer 3: Horizon Alps / High Peaks (Desaturated Soft Horizon Haze)
    const farPeaks = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#DFDACF'),
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
    });

    return { nearRidge, midMountain, farPeaks };
  }, []);

  // Procedural natural ridge profiles with multiple vertices
  const ridgeClusters = useMemo(() => {
    const leftRidges = [
      { x: -55, z: -80, scale: [22, 14, 28] as [number, number, number], rot: 0.2, type: 'near' },
      { x: -70, z: -20, scale: [32, 18, 42] as [number, number, number], rot: -0.4, type: 'mid' },
      { x: -90, z: 40, scale: [38, 22, 50] as [number, number, number], rot: 0.6, type: 'mid' },
      { x: -120, z: -110, scale: [55, 34, 75] as [number, number, number], rot: -0.1, type: 'far' },
      { x: -135, z: 10, scale: [60, 38, 85] as [number, number, number], rot: 0.3, type: 'far' },
    ];

    const rightRidges = [
      { x: 55, z: -70, scale: [24, 15, 30] as [number, number, number], rot: -0.3, type: 'near' },
      { x: 75, z: 10, scale: [34, 19, 44] as [number, number, number], rot: 0.5, type: 'mid' },
      { x: 85, z: 70, scale: [36, 20, 48] as [number, number, number], rot: -0.2, type: 'mid' },
      { x: 125, z: -100, scale: [58, 36, 80] as [number, number, number], rot: 0.2, type: 'far' },
      { x: 140, z: 20, scale: [64, 42, 90] as [number, number, number], rot: -0.4, type: 'far' },
    ];

    return [...leftRidges, ...rightRidges];
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {ridgeClusters.map((r, i) => {
        const mat =
          r.type === 'near'
            ? materials.nearRidge
            : r.type === 'mid'
            ? materials.midMountain
            : materials.farPeaks;

        return (
          <group key={i} position={[r.x, 0, r.z]} rotation={[0, r.rot, 0]} scale={r.scale}>
            {/* Sculpted Mountain Mass (Decahedron / Dodecahedron terrain ridge) */}
            <mesh material={mat} position={[0, 0.45, 0]}>
              <dodecahedronGeometry args={[1, 1]} />
            </mesh>
            {/* Secondary Intersecting Ridge Spur for Natural Erosion Silhouettes */}
            <mesh material={mat} position={[0.3, 0.3, 0.2]} rotation={[0.2, 0.4, 0]}>
              <octahedronGeometry args={[0.85, 1]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
