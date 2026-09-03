import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HighwayEnvironmentProps {
  scrollProgress: number; // 0 to 1
  isMobile?: boolean;
}

export function HighwayEnvironment({ scrollProgress, isMobile = false }: HighwayEnvironmentProps) {
  const roadGroupRef = useRef<THREE.Group>(null);
  const sceneryGroupRef = useRef<THREE.Group>(null);
  const networkLinesRef = useRef<THREE.Group>(null);
  const warehouseGroupRef = useRef<THREE.Group>(null);

  // Reusable materials
  const materials = useMemo(() => {
    // Asphalt highway surface
    const asphalt = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C3034'),
      roughness: 0.85,
      metalness: 0.15,
    });

    // Highway White Dashed Line (Center)
    const whiteLine = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFFFFF'),
    });

    // Highway Yellow Shoulder Line
    const yellowLine = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#EBB036'),
    });

    // Roadside Ground / Prairie Grass / Terrain in Warm Stone / Sage Tone
    const terrain = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E3DFD5'),
      roughness: 0.95,
      metalness: 0.05,
    });

    // Mountain Distant Silhouettes (Soft Warm Stone)
    const mountain = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D2CCC0'),
      roughness: 0.9,
      metalness: 0.1,
    });

    // Roadside Guardrail Chrome/Steel
    const steel = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#AEB5BA'),
      metalness: 0.8,
      roughness: 0.3,
    });

    // Stylized Roadside Trees (Muted Sage Green)
    const treeFoliage = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6F806D'),
      roughness: 0.8,
      metalness: 0.1,
    });
    const treeTrunk = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5A4D41'),
      roughness: 0.9,
    });

    // Logistics Hub Terminal Materials (for Section 3)
    const warehouseWall = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EAE7E0'),
      metalness: 0.3,
      roughness: 0.4,
    });
    const dockDoor = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A4045'),
      metalness: 0.6,
      roughness: 0.3,
    });

    // Glowing Orange Network Route Lines (for Section 5)
    const activeRouteLine = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E56B2F'),
    });
    const activeHubNode = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E56B2F'),
      emissive: new THREE.Color('#E56B2F'),
      emissiveIntensity: 3.5,
      roughness: 0.2,
    });
    const secondaryRouteLine = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#D99A3D'),
      transparent: true,
      opacity: 0.6,
    });

    return {
      asphalt,
      whiteLine,
      yellowLine,
      terrain,
      mountain,
      steel,
      treeFoliage,
      treeTrunk,
      warehouseWall,
      dockDoor,
      activeRouteLine,
      activeHubNode,
      secondaryRouteLine,
    };
  }, []);

  // Procedural roadside poles, trees, and scenery positions
  const roadsideProps = useMemo(() => {
    const items: { z: number; side: number; type: 'tree' | 'pole' | 'sign'; scale: number }[] = [];
    for (let z = -120; z <= 120; z += 12) {
      items.push({
        z,
        side: -1, // Left side
        type: Math.random() > 0.4 ? 'tree' : 'pole',
        scale: 0.8 + Math.random() * 0.4,
      });
      items.push({
        z: z + 6,
        side: 1, // Right side
        type: Math.random() > 0.4 ? 'tree' : 'pole',
        scale: 0.8 + Math.random() * 0.4,
      });
    }
    return items;
  }, []);

  // Road strip loop animation
  useFrame((state, delta) => {
    const speed = 18; // road speed units
    const movement = speed * delta;

    if (roadGroupRef.current) {
      roadGroupRef.current.position.z += movement;
      if (roadGroupRef.current.position.z > 20) {
        roadGroupRef.current.position.z -= 20;
      }
    }

    if (sceneryGroupRef.current) {
      sceneryGroupRef.current.position.z += movement;
      if (sceneryGroupRef.current.position.z > 24) {
        sceneryGroupRef.current.position.z -= 24;
      }
    }

    // Dynamic visibility transitions based on scroll progress
    if (warehouseGroupRef.current) {
      // Show logistics depot warehouse mainly in Section 3 (0.28 to 0.46)
      const inDepotRange = scrollProgress >= 0.25 && scrollProgress <= 0.48;
      const targetOpacity = inDepotRange ? 1 : 0;
      warehouseGroupRef.current.position.y = THREE.MathUtils.lerp(
        warehouseGroupRef.current.position.y,
        inDepotRange ? 0 : -10,
        0.08
      );
    }

    if (networkLinesRef.current) {
      // Show glowing network map mainly in Section 5 (0.58 to 0.76)
      const inNetworkRange = scrollProgress >= 0.55 && scrollProgress <= 0.78;
      networkLinesRef.current.position.y = THREE.MathUtils.lerp(
        networkLinesRef.current.position.y,
        inNetworkRange ? 0.05 : -15,
        0.08
      );
      // Gentle pulse on network lines
      const t = state.clock.getElapsedTime();
      networkLinesRef.current.rotation.y = Math.sin(t * 0.4) * 0.03;
    }
  });

  return (
    <group>
      {/* ========================================================================= */}
      {/* 1. MOVING ROAD SURFACE & HIGHWAY MARKINGS                                 */}
      {/* ========================================================================= */}
      {/* Base Asphalt Deck */}
      <mesh position={[0, -0.01, 0]} material={materials.asphalt} receiveShadow>
        <planeGeometry args={[14, 300]} />
        <meshStandardMaterial
          color="#282C30"
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      {/* Repeating Dashed & Solid Road Lines */}
      <group ref={roadGroupRef} position={[0, 0.01, 0]}>
        {/* Yellow Outer Shoulder Lines (Left & Right) */}
        <mesh position={[-6.2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.yellowLine}>
          <planeGeometry args={[0.22, 300]} />
        </mesh>
        <mesh position={[6.2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.yellowLine}>
          <planeGeometry args={[0.22, 300]} />
        </mesh>

        {/* Center White Dashes (Travel Direction Stripes) */}
        {Array.from({ length: 40 }).map((_, i) => (
          <mesh
            key={i}
            position={[0, 0, (i - 20) * 8]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={materials.whiteLine}
          >
            <planeGeometry args={[0.28, 4.2]} />
          </mesh>
        ))}

        {/* Lane Subdivision White Dashes (Right & Left Lanes) */}
        {Array.from({ length: 40 }).map((_, i) => (
          <group key={i} position={[0, 0, (i - 20) * 8]}>
            <mesh position={[-3.1, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.whiteLine}>
              <planeGeometry args={[0.18, 3.5]} />
            </mesh>
            <mesh position={[3.1, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.whiteLine}>
              <planeGeometry args={[0.18, 3.5]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Highway Steel Guardrails */}
      {[-7.2, 7.2].map((x, sideIdx) => (
        <group key={sideIdx} position={[x, 0.45, 0]}>
          {/* Continuous Rail Beam */}
          <mesh material={materials.steel}>
            <boxGeometry args={[0.1, 0.35, 300]} />
          </mesh>
          {/* Vertical Support Posts */}
          {Array.from({ length: 30 }).map((_, postIdx) => (
            <mesh
              key={postIdx}
              position={[0, -0.22, (postIdx - 15) * 10]}
              material={materials.steel}
            >
              <boxGeometry args={[0.12, 0.5, 0.12]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ========================================================================= */}
      {/* 2. PROCEDURAL ROADSIDE SCENERY (Trees, Utility Poles)                     */}
      {/* ========================================================================= */}
      <group ref={sceneryGroupRef}>
        {roadsideProps.map((item, idx) => {
          const xPos = item.side * (12 + Math.abs(Math.sin(item.z * 0.05)) * 8);
          if (item.type === 'tree') {
            return (
              <group key={idx} position={[xPos, 0, item.z]} scale={[item.scale, item.scale, item.scale]}>
                {/* Trunk */}
                <mesh position={[0, 1.2, 0]} material={materials.treeTrunk} castShadow>
                  <cylinderGeometry args={[0.2, 0.35, 2.4, 6]} />
                </mesh>
                {/* Stylized Foliage Tiers */}
                <mesh position={[0, 3.0, 0]} material={materials.treeFoliage} castShadow>
                  <coneGeometry args={[1.6, 2.6, 6]} />
                </mesh>
                <mesh position={[0, 4.4, 0]} material={materials.treeFoliage} castShadow>
                  <coneGeometry args={[1.2, 2.2, 6]} />
                </mesh>
              </group>
            );
          } else {
            return (
              <group key={idx} position={[xPos, 0, item.z]} scale={[item.scale, item.scale, item.scale]}>
                {/* Utility Pole Mast */}
                <mesh position={[0, 3.2, 0]} material={materials.treeTrunk}>
                  <cylinderGeometry args={[0.12, 0.16, 6.4, 6]} />
                </mesh>
                {/* Cross arm */}
                <mesh position={[0, 5.8, 0]} material={materials.treeTrunk}>
                  <boxGeometry args={[2.4, 0.12, 0.12]} />
                </mesh>
              </group>
            );
          }
        })}
      </group>

      {/* ========================================================================= */}
      {/* 3. DISTANT MOUNTAIN TERRAIN & ROLLING FOOTHILLS                           */}
      {/* ========================================================================= */}
      {/* Expansive Ground Terrain Plains */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.terrain} receiveShadow>
        <planeGeometry args={[300, 300]} />
      </mesh>

      {/* Distant Mountain Range (Left Ridge) */}
      <group position={[-65, 0, -40]}>
        {[-35, -15, 5, 25, 45, 65].map((z, idx) => (
          <mesh
            key={idx}
            position={[0, 8 + (idx % 3) * 4, z]}
            rotation={[0, idx * 0.4, 0]}
            material={materials.mountain}
          >
            <coneGeometry args={[26 + (idx % 2) * 8, 20 + (idx % 3) * 6, 5]} />
          </mesh>
        ))}
      </group>

      {/* Distant Mountain Range (Right Ridge) */}
      <group position={[65, 0, -40]}>
        {[-40, -20, 0, 20, 40, 60].map((z, idx) => (
          <mesh
            key={idx}
            position={[0, 7 + (idx % 2) * 5, z]}
            rotation={[0, -idx * 0.3, 0]}
            material={materials.mountain}
          >
            <coneGeometry args={[24 + (idx % 3) * 6, 18 + (idx % 2) * 8, 5]} />
          </mesh>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: LOGISTICS DISTRIBUTION HUB DEPOT BACKDROP                   */}
      {/* ========================================================================= */}
      <group ref={warehouseGroupRef} position={[16, -10, -8]}>
        {/* Terminal Facility Main Building */}
        <mesh position={[0, 4.5, 0]} material={materials.warehouseWall} castShadow receiveShadow>
          <boxGeometry args={[14, 9, 36]} />
        </mesh>
        {/* Overhang Roof Canopy */}
        <mesh position={[-7.5, 6.2, 0]} material={materials.dockDoor}>
          <boxGeometry args={[3, 0.4, 38]} />
        </mesh>
        {/* Dock Doors Array */}
        {[-14, -7, 0, 7, 14].map((z, idx) => (
          <group key={idx} position={[-7.05, 2.4, z]}>
            {/* Dock Door Frame */}
            <mesh material={materials.dockDoor}>
              <boxGeometry args={[0.2, 4.2, 3.8]} />
            </mesh>
            {/* Overhead LED Bay Status Indicator */}
            <mesh position={[-0.15, 2.5, 0]}>
              <boxGeometry args={[0.2, 0.2, 0.4]} />
              <meshBasicMaterial color={idx === 2 ? '#E56B2F' : '#6F806D'} />
            </mesh>
          </group>
        ))}
        {/* Terminal Signage: NORTHLINE GATEWAY 01 */}
        <mesh position={[-7.1, 7.2, 0]}>
          <boxGeometry args={[0.1, 1.1, 12]} />
          <meshStandardMaterial color="#171A1C" roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 5. SECTION 5: NATIONAL ROUTE NETWORK VISUALIZATION                        */}
      {/* ========================================================================= */}
      <group ref={networkLinesRef} position={[0, -15, 0]}>
        {/* Base Grid Plane */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 80, 20, 20]} />
          <meshBasicMaterial
            color="#E56B2F"
            wireframe
            transparent
            opacity={0.12}
          />
        </mesh>

        {/* Major Transcontinental Route Arteries */}
        <ArteryRoute start={[-18, 0.08, 12]} end={[0, 0.08, 0]} color="#E56B2F" />
        <ArteryRoute start={[0, 0.08, 0]} end={[18, 0.08, -14]} color="#E56B2F" />
        <ArteryRoute start={[0, 0.08, 0]} end={[12, 0.08, 16]} color="#D99A3D" />
        <ArteryRoute start={[-18, 0.08, 12]} end={[-12, 0.08, -18]} color="#D99A3D" />
        <ArteryRoute start={[-12, 0.08, -18]} end={[0, 0.08, 0]} color="#6F806D" />
        <ArteryRoute start={[12, 0.08, 16]} end={[18, 0.08, -14]} color="#6F806D" />

        {/* Superhub Pulsing Geometric Nodes */}
        {[
          { pos: [-18, 0.1, 12], label: 'LAX Pacific' },
          { pos: [0, 0.1, 0], label: 'ORD Central Gateway' },
          { pos: [18, 0.1, -14], label: 'JFK/NJ Port' },
          { pos: [12, 0.1, 16], label: 'ATL Southeast' },
          { pos: [-12, 0.1, -18], label: 'SEA Northwest' },
          { pos: [-2, 0.1, 14], label: 'DFW Logistics' },
        ].map((hub, idx) => (
          <group key={idx} position={hub.pos as [number, number, number]}>
            {/* Center Core Node */}
            <mesh material={materials.activeHubNode}>
              <sphereGeometry args={[0.55, 16, 16]} />
            </mesh>
            {/* Outer Animated Pulse Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.9, 1.2, 24]} />
              <meshBasicMaterial color="#E56B2F" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// Helper Artery Route Line Component
function ArteryRoute({
  start,
  end,
  color,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) {
  const curve = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const mid = new THREE.Vector3(
      (p1.x + p2.x) / 2,
      (p1.y + p2.y) / 2 + 1.2, // slight arc lift
      (p1.z + p2.z) / 2
    );
    return new THREE.QuadraticBezierCurve3(p1, mid, p2);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(30), [curve]);
  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    // @ts-ignore
    <line geometry={lineGeo}>
      <lineBasicMaterial color={color} linewidth={3} transparent opacity={0.85} />
    </line>
  );
}
