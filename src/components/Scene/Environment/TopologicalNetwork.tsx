import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TopologicalNetworkProps {
  scrollProgress: number;
}

/**
 * 3D Continental Topological Route Network
 * Appears during Section 5 (Network & Coverage) when the camera ascends to high-altitude view.
 * Features illuminated glowing orange interstate corridors and freight superhubs with pulse animations.
 */
export function TopologicalNetwork({ scrollProgress }: TopologicalNetworkProps) {
  const pulseRingsRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    // Primary Glowing Orange Arterial Freight Route
    const pulseRoute = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E56B2F'),
      transparent: true,
      opacity: 0.9,
    });

    // Secondary Feeder Freight Line
    const feederRoute = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#D97706'),
      transparent: true,
      opacity: 0.6,
    });

    // Freight Hub Node Core (High-Intensity Glowing Sphere)
    const hubNode = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF8F00'),
      emissive: new THREE.Color('#E56B2F'),
      emissiveIntensity: 4.5,
      roughness: 0.1,
    });

    // Hub Pulse Wave Ring
    const pulseRing = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E56B2F'),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });

    return { pulseRoute, feederRoute, hubNode, pulseRing };
  }, []);

  // Major US Freight Superhub Nodes Coordinates in 3D Space
  const superhubs = useMemo(() => [
    { name: 'Chicago Superhub', x: 2.5, y: 0.2, z: 4.0 },
    { name: 'Dallas-Fort Worth', x: 1.0, y: 0.2, z: -8.0 },
    { name: 'Atlanta Gateway', x: 5.5, y: 0.2, z: -6.0 },
    { name: 'Los Angeles / Long Beach', x: -8.5, y: 0.2, z: -5.0 },
    { name: 'New York / NJ Metro', x: 8.5, y: 0.2, z: 8.0 },
    { name: 'Seattle / PNW Hub', x: -7.5, y: 0.2, z: 12.0 },
  ], []);

  // Connections between hubs
  const corridors = useMemo(() => [
    { from: 0, to: 1 }, // Chicago - Dallas
    { from: 0, to: 2 }, // Chicago - Atlanta
    { from: 0, to: 4 }, // Chicago - New York
    { from: 1, to: 3 }, // Dallas - LA
    { from: 3, to: 5 }, // LA - Seattle
    { from: 0, to: 5 }, // Chicago - Seattle
    { from: 2, to: 4 }, // Atlanta - New York
  ], []);

  // Frame animation for pulse rings
  useFrame((state) => {
    if (!pulseRingsRef.current) return;
    const t = state.clock.getElapsedTime();
    const scale = 1 + (t % 2) * 1.2;
    const opacity = Math.max(0, 1 - (t % 2) * 0.5);

    pulseRingsRef.current.children.forEach((child) => {
      child.scale.set(scale, 1, scale);
    });
    materials.pulseRing.opacity = opacity * 0.6;
  });

  // Shot 07: Continental Route Network is active around scroll 0.75 - 0.88
  const isVisible = scrollProgress >= 0.74 && scrollProgress <= 0.88;
  if (!isVisible) return null;

  return (
    <group position={[0, 0.1, 0]}>
      {/* 1. Hub Core Glowing Markers */}
      {superhubs.map((hub, i) => (
        <group key={`hub-${i}`} position={[hub.x, hub.y, hub.z]}>
          <mesh material={materials.hubNode}>
            <sphereGeometry args={[0.35, 16, 16]} />
          </mesh>
          {/* Vertical Laser Beacon Line */}
          <mesh position={[0, 2.5, 0]} material={materials.pulseRoute}>
            <cylinderGeometry args={[0.04, 0.04, 5.0, 8]} />
          </mesh>
        </group>
      ))}

      {/* 2. Expanding Radar Pulse Rings */}
      <group ref={pulseRingsRef}>
        {superhubs.map((hub, i) => (
          <mesh
            key={`ring-${i}`}
            position={[hub.x, hub.y + 0.05, hub.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={materials.pulseRing}
          >
            <ringGeometry args={[0.4, 0.55, 24]} />
          </mesh>
        ))}
      </group>

      {/* 3. Arterial Corridor Glowing Lines */}
      {corridors.map((c, i) => {
        const p1 = superhubs[c.from];
        const p2 = superhubs[c.to];
        const midX = (p1.x + p2.x) / 2;
        const midZ = (p1.z + p2.z) / 2;
        const length = Math.hypot(p2.x - p1.x, p2.z - p1.z);
        const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);

        return (
          <mesh
            key={`corridor-${i}`}
            position={[midX, 0.15, midZ]}
            rotation={[-Math.PI / 2, 0, angle - Math.PI / 2]}
            material={materials.pulseRoute}
          >
            <planeGeometry args={[length, 0.18]} />
          </mesh>
        );
      })}
    </group>
  );
}
