import * as THREE from 'three';

export function ShipyardEnvironment() {
  return (
    <group>
      {/* 1. Dramatic Atmospheric Port Lighting */}
      <spotLight position={[-30, 45, -30]} angle={0.8} intensity={250} color="#FF9A00" castShadow />
      <spotLight position={[30, 45, -30]} angle={0.8} intensity={250} color="#FF9A00" castShadow />
      
      {/* 2. Massive Concrete Dock */}
      <mesh position={[0, -0.05, -30]} receiveShadow>
        <planeGeometry args={[300, 150]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* 3. Deep Ocean Water */}
      <mesh position={[0, -2, -150]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 1000]} />
        <meshStandardMaterial color="#050a10" roughness={0.2} metalness={0.9} envMapIntensity={2.0} />
      </mesh>

      {/* 4. Massive Cargo Ship (Constructed from detailed parts) */}
      <group position={[0, 5, -110]}>
        {/* Main Hull */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[220, 18, 32]} />
          <meshStandardMaterial color="#1f2326" roughness={0.7} metalness={0.3} />
        </mesh>
        
        {/* Bow (Front of ship) */}
        <mesh position={[-125, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[16, 0.1, 18, 4]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1f2326" roughness={0.7} metalness={0.3} />
        </mesh>
        
        {/* Ship Bridge / Superstructure */}
        <group position={[80, 20, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[25, 20, 28]} />
            <meshStandardMaterial color="#d0d0d0" roughness={0.6} />
          </mesh>
          {/* Bridge Windows */}
          <mesh position={[-12.6, 6, 0]}>
            <boxGeometry args={[0.2, 3, 26]} />
            <meshStandardMaterial color="#000" roughness={0.1} metalness={0.9} emissive="#000" />
          </mesh>
          {/* Exhaust Funnel */}
          <mesh position={[5, 15, 0]} castShadow>
            <cylinderGeometry args={[3, 3, 15]} />
            <meshStandardMaterial color="#1a1c1e" roughness={0.9} />
          </mesh>
        </group>

        {/* Dense Container Stacks on Ship */}
        <group position={[-20, 18, 0]}>
          {Array.from({ length: 12 }).map((_, x) => 
            Array.from({ length: 4 }).map((_, y) => 
              Array.from({ length: 8 }).map((_, z) => (
                <mesh key={`ship-cont-${x}-${y}-${z}`} position={[x * 6.2 - 60, y * 2.6, z * 2.6 - 9.1]} castShadow receiveShadow>
                  <boxGeometry args={[6, 2.5, 2.5]} />
                  <meshStandardMaterial color={['#2c3e50', '#e74c3c', '#f1c40f', '#34495e', '#ecf0f1'][Math.floor(Math.random() * 5)]} roughness={0.5} />
                </mesh>
              ))
            )
          )}
        </group>
      </group>

      {/* 5. Colossal Gantry Cranes (Ship-to-Shore) */}
      {[ -40, 40 ].map((xPos, idx) => (
        <group key={`crane-${idx}`} position={[xPos, 0, -60]}>
          {/* Crane Legs */}
          <mesh position={[-8, 25, -8]} castShadow><boxGeometry args={[2, 50, 2]} /><meshStandardMaterial color="#d35400" roughness={0.4} metalness={0.6} /></mesh>
          <mesh position={[8, 25, -8]} castShadow><boxGeometry args={[2, 50, 2]} /><meshStandardMaterial color="#d35400" roughness={0.4} metalness={0.6} /></mesh>
          <mesh position={[-8, 25, 8]} castShadow><boxGeometry args={[2, 50, 2]} /><meshStandardMaterial color="#d35400" roughness={0.4} metalness={0.6} /></mesh>
          <mesh position={[8, 25, 8]} castShadow><boxGeometry args={[2, 50, 2]} /><meshStandardMaterial color="#d35400" roughness={0.4} metalness={0.6} /></mesh>
          
          {/* Main Boom / Beam extending over the ship */}
          <mesh position={[0, 50, -30]} castShadow><boxGeometry args={[4, 4, 100]} /><meshStandardMaterial color="#d35400" roughness={0.4} metalness={0.6} /></mesh>
          
          {/* Apex Structure */}
          <mesh position={[0, 60, 0]} castShadow><boxGeometry args={[4, 20, 4]} /><meshStandardMaterial color="#d35400" roughness={0.4} metalness={0.6} /></mesh>
          
          {/* Crane Cabin */}
          <mesh position={[0, 45, -40]} castShadow><boxGeometry args={[5, 4, 6]} /><meshStandardMaterial color="#2c3e50" roughness={0.6} /></mesh>
          
          {/* High-intensity Crane Practical Lights */}
          <spotLight position={[0, 48, -40]} angle={0.5} penumbra={0.5} intensity={200} color="#FFFFFF" castShadow />
        </group>
      ))}
      
      {/* 6. Foreground Yard Containers */}
      <group position={[20, 1.25, -25]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`yard-${i}`} position={[0, (i%3)*2.5, Math.floor(i/3)*2.6]} castShadow receiveShadow>
            <boxGeometry args={[6, 2.5, 2.5]} />
            <meshStandardMaterial color="#2980b9" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
