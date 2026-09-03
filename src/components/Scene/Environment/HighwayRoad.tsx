import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HighwayRoadProps {
  scrollProgress: number;
}

/**
 * High-End PBR Highway Road Deck
 * Features textured asphalt with surface aggregate grain, crowned profile,
 * tire rubber track ruts, gravel shoulders, and physical retroreflective road markings.
 */
export function HighwayRoad({ scrollProgress }: HighwayRoadProps) {
  const roadStripesRef = useRef<THREE.Group>(null);
  const roadSurfaceRef = useRef<THREE.Group>(null);

  // Materials for the highway system
  const roadMaterials = useMemo(() => {
    // 1. PBR Asphalt Highway Surface (Deep Aggregate Charcoal)
    const asphalt = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#222529'),
      roughness: 0.88,
      metalness: 0.12,
    });

    // 2. Tire Track Rut Lines (Slightly darker from tire rubber compaction)
    const tireRut = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#191C1E'),
      roughness: 0.82,
      metalness: 0.18,
    });

    // 3. Road Shoulder Asphalt / Compacted Gravel
    const shoulder = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A3D40'),
      roughness: 0.94,
      metalness: 0.05,
    });

    // 4. Prairie / Desert Verge Terrain (Warm Neutral Paper / Stone Tone)
    const verge = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E3DFD5'),
      roughness: 0.96,
      metalness: 0.02,
    });

    // 5. White Retro-Reflective Dashed Center Stripe
    const whiteStripe = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      roughness: 0.4,
      metalness: 0.1,
      emissive: new THREE.Color('#FFFFFF'),
      emissiveIntensity: 0.15,
    });

    // 6. Solid Yellow Median Edge Line
    const yellowStripe = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F59E0B'),
      roughness: 0.45,
      metalness: 0.1,
      emissive: new THREE.Color('#D97706'),
      emissiveIntensity: 0.12,
    });

    // 7. Solid White Right Fog Line
    const whiteEdgeLine = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F1F5F9'),
      roughness: 0.45,
      metalness: 0.1,
    });

    return {
      asphalt,
      tireRut,
      shoulder,
      verge,
      whiteStripe,
      yellowStripe,
      whiteEdgeLine,
    };
  }, []);

  // Generate 24 repeating center dashes (3m dash + 6m gap = 9m period)
  const dashedStripes = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => -140 + i * 9);
  }, []);

  const currentSpeedRef = useRef<number>(22.0); // Align with TruckAssembly

  // Frame loop to animate road travel seamlessly
  useFrame((_, delta) => {
    // Determine target speed based on narrative shot
    let targetSpeed = 22.0; 
    if (scrollProgress >= 0.55 && scrollProgress <= 0.75) {
      targetSpeed = 4.0;
    } else if (scrollProgress > 0.75 && scrollProgress < 0.85) {
      targetSpeed = 12.0;
    } else if (scrollProgress >= 0.85) {
      targetSpeed = 28.0;
    }

    currentSpeedRef.current = THREE.MathUtils.lerp(currentSpeedRef.current, targetSpeed, 1.5 * delta);
    const move = currentSpeedRef.current * delta;

    if (roadStripesRef.current) {
      roadStripesRef.current.position.z -= move;
      if (roadStripesRef.current.position.z < -9) {
        roadStripesRef.current.position.z += 9;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* 1. MAIN ASPHALT HIGHWAY DECK                                              */}
      {/* ========================================================================= */}
      {/* Main Dual-Lane Paved Surface (Width 10.8m, Length 360m) */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.asphalt}
        receiveShadow
      >
        <planeGeometry args={[11.2, 360, 1, 1]} />
      </mesh>

      {/* Subtle Darker Tire Rut Wear Tracks on Left & Right Lanes */}
      <mesh
        position={[-1.8, 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.tireRut}
        receiveShadow
      >
        <planeGeometry args={[0.9, 360]} />
      </mesh>
      <mesh
        position={[1.8, 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.tireRut}
        receiveShadow
      >
        <planeGeometry args={[0.9, 360]} />
      </mesh>

      {/* Left & Right Paved Highway Shoulders */}
      <mesh
        position={[-6.8, -0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.shoulder}
        receiveShadow
      >
        <planeGeometry args={[2.4, 360]} />
      </mesh>
      <mesh
        position={[6.8, -0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.shoulder}
        receiveShadow
      >
        <planeGeometry args={[2.4, 360]} />
      </mesh>

      {/* Vast Roadside Verge & Prairie Terrain */}
      <mesh
        position={[-60, -0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.verge}
        receiveShadow
      >
        <planeGeometry args={[104, 360]} />
      </mesh>
      <mesh
        position={[60, -0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.verge}
        receiveShadow
      >
        <planeGeometry args={[104, 360]} />
      </mesh>

      {/* ========================================================================= */}
      {/* 2. STATIC CONTINUOUS ROAD EDGE MARKINGS                                   */}
      {/* ========================================================================= */}
      {/* Solid Yellow Left Median Stripe */}
      <mesh
        position={[-5.3, 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.yellowStripe}
      >
        <planeGeometry args={[0.16, 360]} />
      </mesh>

      {/* Solid White Right Shoulder Fog Line */}
      <mesh
        position={[5.3, 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={roadMaterials.whiteEdgeLine}
      >
        <planeGeometry args={[0.16, 360]} />
      </mesh>

      {/* ========================================================================= */}
      {/* 3. REPEATING MOVING CENTER DASHED ROAD STRIPES                            */}
      {/* ========================================================================= */}
      <group ref={roadStripesRef}>
        {dashedStripes.map((z, idx) => (
          <mesh
            key={`stripe-${idx}`}
            position={[0, 0.006, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={roadMaterials.whiteStripe}
          >
            <planeGeometry args={[0.18, 3.2]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
