import { useRef } from 'react';
import * as THREE from 'three';

export function WarehouseEnvironment({ type = 'origin' }: { type?: 'origin' | 'transfer' }) {
  // A cinematic industrial warehouse structure
  return (
    <group>
      {/* 1. Dramatic Volumetric Overhead Lighting */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`light-${i}`} position={[0, 15, -15 + (i * 10)]}>
          <spotLight
            position={[0, 0, 0]}
            angle={0.6}
            penumbra={0.8}
            intensity={type === 'origin' ? 150 : 250}
            color="#FFF4E0"
            castShadow
          />
          {/* Industrial Light Fixture */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.5, 0.8, 1.0, 16]} />
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={5} />
          </mesh>
        </group>
      ))}

      {/* 2. Concrete Floor with expansion joints (simulated via scale) */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#222426" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* 3. Deep Architectural Back Wall */}
      <mesh position={[0, 10, type === 'origin' ? 30 : -30]} receiveShadow>
        <boxGeometry args={[40, 20, 2]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.9} />
      </mesh>

      {/* 4. Massive Steel I-Beam Pillars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`pillar-l-${i}`} position={[-12, 10, -30 + i * 10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 20, 0.8]} />
            <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`pillar-r-${i}`} position={[12, 10, -30 + i * 10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 20, 0.8]} />
            <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 5. Overhead Truss Structure */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`truss-${i}`} position={[0, 19.5, -30 + i * 10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[25, 1, 0.5]} />
            <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 6. Cinematic Loading Bays (Transfer Only) */}
      {type === 'transfer' && Array.from({ length: 3 }).map((_, i) => (
        <group key={`bay-${i}`} position={[-8 + i * 8, 3, -29]}>
          <mesh receiveShadow>
            <boxGeometry args={[4, 6, 0.2]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
          </mesh>
          <mesh position={[0, -3, 0.2]}>
            <boxGeometry args={[4.5, 0.2, 0.2]} />
            <meshStandardMaterial color="#e5a92f" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
