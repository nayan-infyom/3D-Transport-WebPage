import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TruckModelProps {
  scrollProgress: number; // 0 to 1
  isMobile?: boolean;
}

export function TruckModel({ scrollProgress, isMobile = false }: TruckModelProps) {
  const truckGroupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const headlightsRef = useRef<THREE.PointLight>(null);
  const tailLightsRef = useRef<THREE.PointLight>(null);

  // Reusable materials for high performance and visual fidelity
  const materials = useMemo(() => {
    // Cab Body - Premium Pearl Warm White / Champagne Metallic
    const cabPaint = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F0EFEA'),
      metalness: 0.4,
      roughness: 0.25,
    });

    // Accent Industrial Orange Trim
    const orangeTrim = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E56B2F'),
      metalness: 0.6,
      roughness: 0.3,
    });

    // Dark Charcoal Aero Fairings & Chassis
    const darkChassis = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F2326'),
      metalness: 0.7,
      roughness: 0.4,
    });

    // Chrome Details (Grille, Exhaust, Fuel Tanks, Rim caps)
    const chrome = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E6E9EC'),
      metalness: 0.95,
      roughness: 0.08,
    });

    // Glass Windshield & Windows
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1B252C'),
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.7,
      thickness: 0.4,
      transparent: true,
      opacity: 0.85,
    });

    // Trailer Body - Clean Architectural White Aluminum
    const trailerWall = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FAF9F5'),
      metalness: 0.3,
      roughness: 0.35,
    });

    // Rubber Tires
    const tireRubber = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#111315'),
      roughness: 0.85,
      metalness: 0.1,
    });

    // LED Headlight Emissive
    const headlightEmissive = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF8E7'),
      emissive: new THREE.Color('#FFE8BD'),
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    // Red Taillight Emissive
    const tailLightEmissive = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E02424'),
      emissive: new THREE.Color('#FF1E1E'),
      emissiveIntensity: 3.0,
      roughness: 0.2,
    });

    // Amber Clearance Lights
    const amberEmissive = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF9800'),
      emissive: new THREE.Color('#FF9800'),
      emissiveIntensity: 2.0,
    });

    return {
      cabPaint,
      orangeTrim,
      darkChassis,
      chrome,
      glass,
      trailerWall,
      tireRubber,
      headlightEmissive,
      tailLightEmissive,
      amberEmissive,
    };
  }, []);

  // Frame loop for wheel rotation, subtle suspension float, and directional adjustments
  useFrame((state, delta) => {
    if (!truckGroupRef.current) return;

    // Road traveling speed simulation based on section
    const speed = 18; // base speed units
    const rotationIncrement = speed * delta * 1.5;

    // Rotate all wheel groups
    wheelsRef.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += rotationIncrement;
      }
    });

    // Subtle natural suspension bounce & road vibration
    const t = state.clock.getElapsedTime();
    const vibration = Math.sin(t * 14) * 0.008 + Math.cos(t * 8) * 0.004;
    truckGroupRef.current.position.y = 0.02 + vibration;
    truckGroupRef.current.rotation.z = Math.sin(t * 3.5) * 0.002;

    // Slight steering articulation based on scroll
    if (scrollProgress > 0.15 && scrollProgress < 0.35) {
      // Gentle curve in journey section
      truckGroupRef.current.rotation.y = Math.sin((scrollProgress - 0.15) * Math.PI * 5) * 0.04;
    } else {
      truckGroupRef.current.rotation.y = 0;
    }
  });

  return (
    <group ref={truckGroupRef} position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* 1. TRACTOR CAB (FRONT UNIT)                                              */}
      {/* ========================================================================= */}
      <group position={[0, 0, 2.4]}>
        {/* Main Lower Cab Block */}
        <mesh position={[0, 1.15, 0.4]} material={materials.cabPaint} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.3, 2.6]} />
        </mesh>

        {/* Aerodynamic High Roof Sleeper Cap */}
        <mesh position={[0, 2.05, 0.05]} material={materials.cabPaint} castShadow receiveShadow>
          <boxGeometry args={[2.36, 0.7, 2.0]} />
        </mesh>

        {/* Sloped Aero Front Deflector Cap */}
        <mesh
          position={[0, 2.3, 0.9]}
          rotation={[-0.4, 0, 0]}
          material={materials.cabPaint}
          castShadow
        >
          <boxGeometry args={[2.3, 0.35, 1.1]} />
        </mesh>

        {/* Sloped Hood Engine Compartment */}
        <mesh
          position={[0, 0.9, 1.8]}
          rotation={[0.12, 0, 0]}
          material={materials.cabPaint}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.3, 0.85, 1.4]} />
        </mesh>

        {/* Front Chrome Bumper */}
        <mesh position={[0, 0.42, 2.52]} material={materials.chrome} castShadow receiveShadow>
          <boxGeometry args={[2.45, 0.38, 0.3]} />
        </mesh>

        {/* Front Massive Chrome Grille */}
        <mesh position={[0, 0.92, 2.48]} material={materials.chrome} castShadow>
          <boxGeometry args={[1.5, 0.85, 0.08]} />
        </mesh>
        {/* Grille Horizontal Slats */}
        {[-0.25, -0.1, 0.05, 0.2, 0.32].map((yOffset, idx) => (
          <mesh key={idx} position={[0, 0.92 + yOffset, 2.53]} material={materials.darkChassis}>
            <boxGeometry args={[1.4, 0.03, 0.03]} />
          </mesh>
        ))}

        {/* Northline Grille Emblem */}
        <mesh position={[0, 1.15, 2.54]} material={materials.orangeTrim}>
          <boxGeometry args={[0.3, 0.12, 0.04]} />
        </mesh>

        {/* Headlight Clusters (Right & Left) */}
        {[-0.95, 0.95].map((x, idx) => (
          <group key={idx} position={[x, 0.58, 2.48]}>
            {/* Housing */}
            <mesh material={materials.darkChassis}>
              <boxGeometry args={[0.38, 0.22, 0.1]} />
            </mesh>
            {/* LED Projector Lens */}
            <mesh position={[0, 0, 0.05]} material={materials.headlightEmissive}>
              <boxGeometry args={[0.32, 0.16, 0.04]} />
            </mesh>
          </group>
        ))}

        {/* Amber Roof Marker / Clearance LED Lights */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x, idx) => (
          <mesh key={idx} position={[x, 2.45, 1.05]} material={materials.amberEmissive}>
            <boxGeometry args={[0.08, 0.04, 0.08]} />
          </mesh>
        ))}

        {/* Windshield */}
        <mesh
          position={[0, 1.62, 1.45]}
          rotation={[-0.32, 0, 0]}
          material={materials.glass}
          castShadow
        >
          <boxGeometry args={[2.2, 0.72, 0.06]} />
        </mesh>

        {/* Side Windows (Left & Right) */}
        {[-1.21, 1.21].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 1.55, 0.6]}
            material={materials.glass}
          >
            <boxGeometry args={[0.04, 0.55, 1.1]} />
          </mesh>
        ))}

        {/* Aero Side Mirrors with Extended Brackets */}
        {[-1.38, 1.38].map((x, idx) => (
          <group key={idx} position={[x, 1.5, 1.2]}>
            {/* Bracket */}
            <mesh material={materials.darkChassis}>
              <cylinderGeometry args={[0.02, 0.02, 0.35]} />
            </mesh>
            {/* Mirror Housing */}
            <mesh position={[x > 0 ? 0.08 : -0.08, 0, 0]} material={materials.cabPaint}>
              <boxGeometry args={[0.1, 0.42, 0.16]} />
            </mesh>
            {/* Mirror Reflective Face */}
            <mesh position={[x > 0 ? 0.06 : -0.06, 0, -0.08]} material={materials.chrome}>
              <boxGeometry args={[0.05, 0.38, 0.02]} />
            </mesh>
          </group>
        ))}

        {/* Side Aero Skirts with Orange Accent Stripe */}
        {[-1.22, 1.22].map((x, idx) => (
          <group key={idx} position={[x, 0.5, 0.2]}>
            <mesh material={materials.darkChassis} castShadow>
              <boxGeometry args={[0.08, 0.5, 2.1]} />
            </mesh>
            {/* Racing/Industrial Accent Line */}
            <mesh position={[x > 0 ? 0.05 : -0.05, 0.1, 0]} material={materials.orangeTrim}>
              <boxGeometry args={[0.02, 0.06, 2.05]} />
            </mesh>
          </group>
        ))}

        {/* Dual Vertical Chrome Exhaust Stacks Behind Cab */}
        {[-1.05, 1.05].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 2.1, -1.05]}
            material={materials.chrome}
            castShadow
          >
            <cylinderGeometry args={[0.07, 0.07, 2.2, 16]} />
          </mesh>
        ))}

        {/* Cylindrical Chrome Fuel Tanks Under Cab */}
        {[-0.95, 0.95].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 0.48, 0.2]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.chrome}
          >
            <cylinderGeometry args={[0.3, 0.3, 1.6, 16]} />
          </mesh>
        ))}

        {/* Fifth Wheel Coupling Hitch */}
        <mesh position={[0, 0.72, -1.0]} material={materials.darkChassis}>
          <cylinderGeometry args={[0.4, 0.45, 0.12, 16]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 2. 53-FOOT DRY VAN FREIGHT TRAILER                                        */}
      {/* ========================================================================= */}
      <group position={[0, 1.85, -3.8]}>
        {/* Main Trailer Box */}
        <mesh material={materials.trailerWall} castShadow receiveShadow>
          <boxGeometry args={[2.5, 2.65, 8.8]} />
        </mesh>

        {/* Trailer Upper & Lower Aluminum Frame Rails */}
        {[-1.26, 1.26].map((x, idx) => (
          <group key={idx}>
            {/* Top Rail */}
            <mesh position={[x, 1.33, 0]} material={materials.chrome}>
              <boxGeometry args={[0.06, 0.08, 8.82]} />
            </mesh>
            {/* Bottom Rail */}
            <mesh position={[x, -1.33, 0]} material={materials.chrome}>
              <boxGeometry args={[0.06, 0.08, 8.82]} />
            </mesh>
          </group>
        ))}

        {/* Trailer Aero Underbody Side Skirts */}
        {[-1.22, 1.22].map((x, idx) => (
          <mesh key={idx} position={[x, -1.45, -0.4]} material={materials.darkChassis}>
            <boxGeometry args={[0.05, 0.45, 5.2]} />
          </mesh>
        ))}

        {/* Northline Trailer Side Graphic Branding (Left & Right) */}
        {[-1.26, 1.26].map((x, idx) => (
          <group key={idx} position={[x > 0 ? 1.26 : -1.26, 0.1, 0]}>
            {/* Industrial Orange Horizontal Speed Banner */}
            <mesh position={[0, -0.2, 0]} material={materials.orangeTrim}>
              <boxGeometry args={[0.02, 0.15, 6.2]} />
            </mesh>
            {/* Geometric Accent Line */}
            <mesh position={[0, 0.35, 1.2]} material={materials.darkChassis}>
              <boxGeometry args={[0.02, 0.04, 3.4]} />
            </mesh>
            <mesh position={[0, 0.35, -1.8]} material={materials.amberEmissive}>
              <boxGeometry args={[0.02, 0.04, 1.2]} />
            </mesh>
          </group>
        ))}

        {/* Trailer Rear Cargo Doors & Locking Hardware */}
        <group position={[0, 0, -4.42]}>
          {/* Vertical Center Door Seam */}
          <mesh position={[0, 0, 0]} material={materials.darkChassis}>
            <boxGeometry args={[0.04, 2.55, 0.04]} />
          </mesh>
          {/* Dual Chrome Cam-Lock Bars */}
          {[-0.6, 0.6].map((x, idx) => (
            <mesh key={idx} position={[x, 0, 0.04]} material={materials.chrome}>
              <cylinderGeometry args={[0.025, 0.025, 2.4, 8]} />
            </mesh>
          ))}
          {/* Rear ICC Safety Underride Bumper Guard */}
          <mesh position={[0, -1.48, 0.15]} material={materials.darkChassis}>
            <boxGeometry args={[2.4, 0.18, 0.18]} />
          </mesh>
          {/* Rear Mudflaps with Northline Orange Strip */}
          {[-0.95, 0.95].map((x, idx) => (
            <group key={idx} position={[x, -1.5, -0.1]}>
              <mesh material={materials.darkChassis}>
                <boxGeometry args={[0.55, 0.45, 0.02]} />
              </mesh>
              <mesh position={[0, -0.15, 0.015]} material={materials.orangeTrim}>
                <boxGeometry args={[0.45, 0.06, 0.01]} />
              </mesh>
            </group>
          ))}
          {/* Red LED Taillight Cluster */}
          {[-1.05, 1.05].map((x, idx) => (
            <mesh key={idx} position={[x, -1.15, 0.03]} material={materials.tailLightEmissive}>
              <boxGeometry args={[0.26, 0.14, 0.04]} />
            </mesh>
          ))}
          {/* Top Rear 3 Amber Identification Lights */}
          {[-0.2, 0, 0.2].map((x, idx) => (
            <mesh key={idx} position={[x, 1.22, 0.03]} material={materials.amberEmissive}>
              <boxGeometry args={[0.08, 0.04, 0.04]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 3. WHEELS & SUSPENSION AXLES (10 Wheel Locations)                         */}
      {/* ========================================================================= */}
      {/* Steer Axle (Front Tractor) */}
      <WheelAssembly
        materials={materials}
        position={[-1.12, 0.45, 4.0]}
        isLeft={true}
        setRef={(el) => (wheelsRef.current[0] = el!)}
      />
      <WheelAssembly
        materials={materials}
        position={[1.12, 0.45, 4.0]}
        isLeft={false}
        setRef={(el) => (wheelsRef.current[1] = el!)}
      />

      {/* Drive Axle 1 (Rear Tractor Front) */}
      <DualWheelAssembly
        materials={materials}
        position={[-1.12, 0.45, 1.8]}
        isLeft={true}
        setRef={(el) => (wheelsRef.current[2] = el!)}
      />
      <DualWheelAssembly
        materials={materials}
        position={[1.12, 0.45, 1.8]}
        isLeft={false}
        setRef={(el) => (wheelsRef.current[3] = el!)}
      />

      {/* Drive Axle 2 (Rear Tractor Back) */}
      <DualWheelAssembly
        materials={materials}
        position={[-1.12, 0.45, 0.6]}
        isLeft={true}
        setRef={(el) => (wheelsRef.current[4] = el!)}
      />
      <DualWheelAssembly
        materials={materials}
        position={[1.12, 0.45, 0.6]}
        isLeft={false}
        setRef={(el) => (wheelsRef.current[5] = el!)}
      />

      {/* Trailer Tandem Axle 1 */}
      <DualWheelAssembly
        materials={materials}
        position={[-1.12, 0.45, -5.8]}
        isLeft={true}
        setRef={(el) => (wheelsRef.current[6] = el!)}
      />
      <DualWheelAssembly
        materials={materials}
        position={[1.12, 0.45, -5.8]}
        isLeft={false}
        setRef={(el) => (wheelsRef.current[7] = el!)}
      />

      {/* Trailer Tandem Axle 2 */}
      <DualWheelAssembly
        materials={materials}
        position={[-1.12, 0.45, -7.0]}
        isLeft={true}
        setRef={(el) => (wheelsRef.current[8] = el!)}
      />
      <DualWheelAssembly
        materials={materials}
        position={[1.12, 0.45, -7.0]}
        isLeft={false}
        setRef={(el) => (wheelsRef.current[9] = el!)}
      />

      {/* ========================================================================= */}
      {/* 4. REALISTIC VEHICLE LIGHTING EMITTERS                                    */}
      {/* ========================================================================= */}
      {/* Headlight Forward Cones */}
      <pointLight
        ref={headlightsRef}
        position={[0, 0.8, 5.5]}
        intensity={2.5}
        distance={15}
        color="#FFF6E0"
      />
      {/* Taillight Subtle Red Flare */}
      <pointLight
        ref={tailLightsRef}
        position={[0, 1.2, -8.6]}
        intensity={1.2}
        distance={6}
        color="#FF2222"
      />

      {/* Soft Truck Undercarriage Shadow Plane */}
      <mesh position={[0, 0.04, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 14.5]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Single Steer Wheel Component
function WheelAssembly({
  materials,
  position,
  isLeft,
  setRef,
}: {
  materials: any;
  position: [number, number, number];
  isLeft: boolean;
  setRef: (el: THREE.Group | null) => void;
}) {
  return (
    <group position={position}>
      <group ref={setRef}>
        {/* Rubber Tire Ring */}
        <mesh rotation={[0, 0, Math.PI / 2]} material={materials.tireRubber} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.28, 20]} />
        </mesh>
        {/* Chrome Polished Rim */}
        <mesh
          position={[isLeft ? -0.1 : 0.1, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={materials.chrome}
        >
          <cylinderGeometry args={[0.28, 0.28, 0.1, 16]} />
        </mesh>
        {/* Hub Cap Accent */}
        <mesh
          position={[isLeft ? -0.15 : 0.15, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={materials.orangeTrim}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
        </mesh>
      </group>
    </group>
  );
}

// Dual Tandem Wheels Component (Dual Tires for Heavy Axles)
function DualWheelAssembly({
  materials,
  position,
  isLeft,
  setRef,
}: {
  materials: any;
  position: [number, number, number];
  isLeft: boolean;
  setRef: (el: THREE.Group | null) => void;
}) {
  return (
    <group position={position}>
      <group ref={setRef}>
        {/* Outer Tire */}
        <mesh
          position={[isLeft ? -0.16 : 0.16, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={materials.tireRubber}
          castShadow
        >
          <cylinderGeometry args={[0.45, 0.45, 0.24, 20]} />
        </mesh>
        {/* Inner Tire */}
        <mesh
          position={[isLeft ? 0.12 : -0.12, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={materials.tireRubber}
          castShadow
        >
          <cylinderGeometry args={[0.45, 0.45, 0.24, 20]} />
        </mesh>
        {/* Chrome Rim */}
        <mesh
          position={[isLeft ? -0.26 : 0.26, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={materials.chrome}
        >
          <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
        </mesh>
      </group>
    </group>
  );
}
