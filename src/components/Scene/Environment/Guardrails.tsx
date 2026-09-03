import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Galvanized Steel W-Beam Highway Guardrails
 * Continuous corrugated W-beam rails with spaced I-beam steel support posts
 * and amber roadside safety reflectors.
 */
export function Guardrails() {
  const materials = useMemo(() => {
    // Galvanized Zinc / Steel W-Beam Material
    const steelRail = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#AEB5BB'),
      metalness: 0.88,
      roughness: 0.26,
    });

    // Dark Steel / Creosote Support Posts
    const steelPost = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A4045'),
      metalness: 0.7,
      roughness: 0.5,
    });

    // Amber Retro-Reflective Marker Tabs
    const reflectorAmber = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F59E0B'),
      emissive: new THREE.Color('#D97706'),
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });

    return { steelRail, steelPost, reflectorAmber };
  }, []);

  // Generate support post coordinates every 4 meters
  const postZPositions = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => -120 + i * 4);
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* 1. LEFT HIGHWAY GUARDRAIL (X = -5.8m)                                     */}
      {/* ========================================================================= */}
      <group position={[-5.8, 0, 0]}>
        {/* Continuous Upper W-Beam Corrugated Rail */}
        <mesh position={[0, 0.68, 0]} material={materials.steelRail} castShadow>
          <boxGeometry args={[0.08, 0.32, 240]} />
        </mesh>
        {/* Rail Top & Bottom Crown Ridges */}
        <mesh position={[0.02, 0.82, 0]} material={materials.steelRail}>
          <boxGeometry args={[0.04, 0.04, 240]} />
        </mesh>
        <mesh position={[0.02, 0.54, 0]} material={materials.steelRail}>
          <boxGeometry args={[0.04, 0.04, 240]} />
        </mesh>

        {/* Spaced I-Beam Posts */}
        {postZPositions.map((z, idx) => (
          <group key={`lpost-${idx}`} position={[0.04, 0.36, z]}>
            <mesh material={materials.steelPost} castShadow>
              <boxGeometry args={[0.1, 0.72, 0.12]} />
            </mesh>
            {/* Amber Reflector on every 3rd post */}
            {idx % 3 === 0 && (
              <mesh position={[0.06, 0.34, 0]} material={materials.reflectorAmber}>
                <boxGeometry args={[0.02, 0.08, 0.04]} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* 2. RIGHT HIGHWAY GUARDRAIL (X = 5.8m)                                    */}
      {/* ========================================================================= */}
      <group position={[5.8, 0, 0]}>
        {/* Continuous Upper W-Beam Rail */}
        <mesh position={[0, 0.68, 0]} material={materials.steelRail} castShadow>
          <boxGeometry args={[0.08, 0.32, 240]} />
        </mesh>
        <mesh position={[-0.02, 0.82, 0]} material={materials.steelRail}>
          <boxGeometry args={[0.04, 0.04, 240]} />
        </mesh>
        <mesh position={[-0.02, 0.54, 0]} material={materials.steelRail}>
          <boxGeometry args={[0.04, 0.04, 240]} />
        </mesh>

        {/* Spaced I-Beam Posts */}
        {postZPositions.map((z, idx) => (
          <group key={`rpost-${idx}`} position={[-0.04, 0.36, z]}>
            <mesh material={materials.steelPost} castShadow>
              <boxGeometry args={[0.1, 0.72, 0.12]} />
            </mesh>
            {idx % 3 === 0 && (
              <mesh position={[-0.06, 0.34, 0]} material={materials.reflectorAmber}>
                <boxGeometry args={[0.02, 0.08, 0.04]} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
