import { useMemo } from 'react';
import * as THREE from 'three';

interface LogisticsTerminalProps {
  scrollProgress: number;
}

/**
 * 3D Modern Logistics Distribution Terminal Complex
 * Appears dynamically alongside the highway during Section 3 (Capabilities).
 * Features multi-bay cross-dock facility, rubber dock seals, loading canopies,
 * yellow safety bollards, amber approach lamps, and staged freight trailers.
 */
export function LogisticsTerminal({ scrollProgress }: LogisticsTerminalProps) {
  const materials = useMemo(() => {
    // Architectural Insulated Sandwich Wall Panels (Crisp Warm Off-White)
    const buildingWall = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EBE8DF'),
      roughness: 0.45,
      metalness: 0.25,
    });

    // Dark Charcoal Fascia Roof Trim
    const roofTrim = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2B2E33'),
      roughness: 0.5,
      metalness: 0.6,
    });

    // Industrial Sectional Overhead Dock Doors (Dark Slate)
    const dockDoor = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A4045'),
      roughness: 0.35,
      metalness: 0.5,
    });

    // Heavy Rubber Dock Compression Shelters
    const dockShelter = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#151719'),
      roughness: 0.9,
    });

    // Yellow Steel Safety Guard Bollards
    const safetyYellow = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EAB308'),
      roughness: 0.3,
      metalness: 0.3,
    });

    // Amber Dock Approach / Staging Guide Lights
    const dockLampAmber = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F59E0B'),
      emissive: new THREE.Color('#D97706'),
      emissiveIntensity: 3.0,
    });

    // Terminal Concrete Apron Slab
    const concreteApron = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D1CDC3'),
      roughness: 0.88,
      metalness: 0.08,
    });

    // Signature Orange Logistics Band
    const orangeBand = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E56B2F'),
      roughness: 0.3,
      metalness: 0.4,
    });

    return {
      buildingWall,
      roofTrim,
      dockDoor,
      dockShelter,
      safetyYellow,
      dockLampAmber,
      concreteApron,
      orangeBand,
    };
  }, []);

  // Calculate terminal opacity/visibility based on scroll progress (Shot 06: Logistics Terminal Orbit, 0.60 - 0.74)
  const isVisible = scrollProgress >= 0.58 && scrollProgress <= 0.75;
  const terminalOpacity = isVisible
    ? Math.min(1, Math.sin(((scrollProgress - 0.58) / 0.17) * Math.PI) * 1.5)
    : 0;

  if (terminalOpacity <= 0.01) return null;

  // 6 Loading Dock Bays
  const dockBays = [-18, -10, -2, 6, 14, 22];

  return (
    <group position={[28, 0, -10]} rotation={[0, -0.08, 0]}>
      {/* Concrete Staging Apron & Yard */}
      <mesh
        position={[-10, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.concreteApron}
        receiveShadow
      >
        <planeGeometry args={[28, 70]} />
      </mesh>

      {/* Main Terminal Building Shell */}
      <group position={[4, 5.2, 0]}>
        <mesh material={materials.buildingWall} castShadow receiveShadow>
          <boxGeometry args={[16, 10.4, 64]} />
        </mesh>
        {/* Parapet Roof Fascia Trim */}
        <mesh position={[-0.1, 5.3, 0]} material={materials.roofTrim}>
          <boxGeometry args={[16.2, 0.4, 64.2]} />
        </mesh>
        {/* Architectural Orange Accent Ribbon */}
        <mesh position={[-8.05, 4.4, 0]} material={materials.orangeBand}>
          <boxGeometry args={[0.1, 0.6, 63.8]} />
        </mesh>
      </group>

      {/* 6 Automated High-Speed Loading Dock Bays */}
      {dockBays.map((z, idx) => (
        <group key={`dock-${idx}`} position={[-4.0, 0, z]}>
          {/* Recessed Dock Pit Concrete Base */}
          <mesh position={[0, 0.7, 0]} material={materials.concreteApron}>
            <boxGeometry args={[0.2, 1.4, 4.2]} />
          </mesh>

          {/* Overhead Roll-up Door */}
          <mesh position={[0.02, 2.3, 0]} material={materials.dockDoor}>
            <boxGeometry args={[0.1, 3.2, 3.4]} />
          </mesh>

          {/* Black Rubber Compression Dock Shelter Frame */}
          <mesh position={[-0.18, 2.3, 0]} material={materials.dockShelter} castShadow>
            <boxGeometry args={[0.4, 3.5, 3.8]} />
          </mesh>

          {/* Yellow Heavy-Duty Steel Safety Bollards */}
          <mesh position={[-0.6, 0.6, -1.9]} material={materials.safetyYellow} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 1.2, 12]} />
          </mesh>
          <mesh position={[-0.6, 0.6, 1.9]} material={materials.safetyYellow} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 1.2, 12]} />
          </mesh>

          {/* Dock Status Amber Guide Lamp */}
          <mesh position={[-0.4, 4.1, 0]} material={materials.dockLampAmber}>
            <boxGeometry args={[0.15, 0.15, 0.3]} />
          </mesh>

          {/* Staged Parked Trailers in alternating bays */}
          {idx % 2 === 1 && (
            <group position={[-5.8, 1.9, 0]} rotation={[0, Math.PI / 2, 0]}>
              <mesh material={materials.buildingWall} castShadow>
                <boxGeometry args={[3.2, 2.6, 8.4]} />
              </mesh>
              <mesh position={[0, 0.4, 0]} material={materials.orangeBand}>
                <boxGeometry args={[3.22, 0.3, 8.42]} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}
