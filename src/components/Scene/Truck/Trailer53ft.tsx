import * as THREE from 'three';
import { createTruckMaterials } from './Materials';

interface Trailer53ftProps {
  materials: ReturnType<typeof createTruckMaterials>;
}

/**
 * 53-Foot High-Cube Commercial Dry Van Freight Trailer
 * Features corrugated aluminum side sheet profile, aerodynamic undertray skirts,
 * landing gear legs with sand shoes, stainless steel rear door frame with dual
 * cam-lock rods, red/white DOT-C2 safety conspicuity tape, and roof corner radius castings.
 */
export function Trailer53ft({ materials }: Trailer53ftProps) {
  // Generate 26 corrugated vertical ribs along the 53ft trailer sides
  const ribZPositions = Array.from({ length: 26 }, (_, i) => -5.4 + i * 0.44);

  return (
    <group position={[0, 0, -3.8]}>
      {/* ========================================================================= */}
      {/* 1. TRAILER MAIN BODY & CORRUGATED ALUMINUM WALLS                         */}
      {/* ========================================================================= */}
      {/* Core Dry Van Box */}
      <mesh position={[0, 2.15, 0]} material={materials.trailerWall} castShadow receiveShadow>
        <boxGeometry args={[2.54, 2.7, 11.6]} />
      </mesh>

      {/* Heavy-Duty Top Roof Extruded Rail */}
      <mesh position={[0, 3.52, 0]} material={materials.brushedAluminum} castShadow>
        <boxGeometry args={[2.58, 0.08, 11.64]} />
      </mesh>
      {/* Heavy-Duty Bottom Side Rub Rail */}
      <mesh position={[0, 0.82, 0]} material={materials.darkChassis} castShadow>
        <boxGeometry args={[2.58, 0.12, 11.64]} />
      </mesh>

      {/* Front Nose Cast Aluminum Radius Corner Caps */}
      <mesh position={[-1.24, 3.48, 5.76]} material={materials.brushedAluminum}>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>
      <mesh position={[1.24, 3.48, 5.76]} material={materials.brushedAluminum}>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>

      {/* Left Side Corrugated Vertical Aluminum Ribs */}
      {ribZPositions.map((z, idx) => (
        <mesh key={`rib-left-${idx}`} position={[-1.28, 2.15, z]} material={materials.trailerRib}>
          <boxGeometry args={[0.02, 2.58, 0.08]} />
        </mesh>
      ))}

      {/* Right Side Corrugated Vertical Aluminum Ribs */}
      {ribZPositions.map((z, idx) => (
        <mesh key={`rib-right-${idx}`} position={[1.28, 2.15, z]} material={materials.trailerRib}>
          <boxGeometry args={[0.02, 2.58, 0.08]} />
        </mesh>
      ))}

      {/* Front Nose Wall Aerodynamic Bulkhead with Inspection Plate */}
      <mesh position={[0, 2.15, 5.82]} material={materials.trailerWall}>
        <boxGeometry args={[2.5, 2.65, 0.04]} />
      </mesh>
      <mesh position={[0, 1.4, 5.85]} material={materials.brushedAluminum}>
        <boxGeometry args={[0.6, 0.4, 0.02]} />
      </mesh>

      {/* ========================================================================= */}
      {/* 2. NORTHLINE SIGNATURE LIVERY & EDITORIAL GRAPHIC STRIPE                  */}
      {/* ========================================================================= */}
      {/* Left Side Bold Orange Speed Band */}
      <mesh position={[-1.29, 2.3, 0]} material={materials.orangeAccent}>
        <boxGeometry args={[0.015, 0.42, 10.4]} />
      </mesh>
      <mesh position={[-1.29, 1.95, 0]} material={materials.darkChassis}>
        <boxGeometry args={[0.015, 0.08, 10.4]} />
      </mesh>

      {/* Right Side Bold Orange Speed Band */}
      <mesh position={[1.29, 2.3, 0]} material={materials.orangeAccent}>
        <boxGeometry args={[0.015, 0.42, 10.4]} />
      </mesh>
      <mesh position={[1.29, 1.95, 0]} material={materials.darkChassis}>
        <boxGeometry args={[0.015, 0.08, 10.4]} />
      </mesh>

      {/* Geometric "NORTHLINE" Logo Mark (Abstract 'N' / Forward Arrow) */}
      <group position={[-1.3, 2.3, 2.8]}>
        <mesh material={materials.darkChassis}>
          <boxGeometry args={[0.02, 1.2, 0.25]} />
        </mesh>
        <mesh position={[0, 0, -1.1]} material={materials.darkChassis}>
          <boxGeometry args={[0.02, 1.2, 0.25]} />
        </mesh>
        <mesh position={[0, 0, -0.55]} rotation={[0.42, 0, 0]} material={materials.orangeAccent}>
          <boxGeometry args={[0.025, 1.45, 0.25]} />
        </mesh>
      </group>

      {/* Right Side Logo Mark */}
      <group position={[1.3, 2.3, 2.8]}>
        <mesh material={materials.darkChassis}>
          <boxGeometry args={[0.02, 1.2, 0.25]} />
        </mesh>
        <mesh position={[0, 0, -1.1]} material={materials.darkChassis}>
          <boxGeometry args={[0.02, 1.2, 0.25]} />
        </mesh>
        <mesh position={[0, 0, -0.55]} rotation={[-0.42, 0, 0]} material={materials.orangeAccent}>
          <boxGeometry args={[0.025, 1.45, 0.25]} />
        </mesh>
      </group>

      {/* Top Roof Amber Clearance Lights (Front Nose & Rear Corners) */}
      <mesh position={[-1.15, 3.48, 5.82]} material={materials.amberLed}>
        <boxGeometry args={[0.08, 0.04, 0.03]} />
      </mesh>
      <mesh position={[1.15, 3.48, 5.82]} material={materials.amberLed}>
        <boxGeometry args={[0.08, 0.04, 0.03]} />
      </mesh>
      <mesh position={[0, 3.48, 5.82]} material={materials.amberLed}>
        <boxGeometry args={[0.08, 0.04, 0.03]} />
      </mesh>

      {/* ========================================================================= */}
      {/* 3. DOT-C2 CONSPICUITY TAPE (RED/WHITE REFLECTIVE SAFETY STRIPES)           */}
      {/* ========================================================================= */}
      {/* Bottom Side Tape Alternating Red & White Blocks */}
      {Array.from({ length: 18 }, (_, i) => {
        const tz = -5.0 + i * 0.6;
        const isRed = i % 2 === 0;
        return (
          <group key={`dot-tape-${i}`}>
            <mesh
              position={[-1.285, 0.88, tz]}
              material={isRed ? materials.dotTapeRed : materials.dotTapeWhite}
            >
              <boxGeometry args={[0.01, 0.06, 0.28]} />
            </mesh>
            <mesh
              position={[1.285, 0.88, tz]}
              material={isRed ? materials.dotTapeRed : materials.dotTapeWhite}
            >
              <boxGeometry args={[0.01, 0.06, 0.28]} />
            </mesh>
          </group>
        );
      })}

      {/* ========================================================================= */}
      {/* 4. AERODYNAMIC UNDERTRAY SIDE SKIRTS (FUEL EFFICIENCY AERO)              */}
      {/* ========================================================================= */}
      {/* Left Aero Side Skirt */}
      <group position={[-1.2, 0.42, 0]}>
        <mesh material={materials.orangeAccent} castShadow>
          <boxGeometry args={[0.06, 0.65, 7.2]} />
        </mesh>
        {/* Bottom Flexible Rubber Ground Sweeper */}
        <mesh position={[0, -0.36, 0]} material={materials.tireRubber}>
          <boxGeometry args={[0.03, 0.12, 7.2]} />
        </mesh>
      </group>

      {/* Right Aero Side Skirt */}
      <group position={[1.2, 0.42, 0]}>
        <mesh material={materials.orangeAccent} castShadow>
          <boxGeometry args={[0.06, 0.65, 7.2]} />
        </mesh>
        <mesh position={[0, -0.36, 0]} material={materials.tireRubber}>
          <boxGeometry args={[0.03, 0.12, 7.2]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 5. TRAILER LANDING GEAR (SUPPORT LEGS & CRANK HANDLE)                    */}
      {/* ========================================================================= */}
      <group position={[0, 0.48, 3.4]}>
        {/* Left Leg */}
        <mesh position={[-0.92, 0, 0]} material={materials.darkChassis} castShadow>
          <boxGeometry args={[0.14, 0.68, 0.14]} />
        </mesh>
        <mesh position={[-0.92, -0.38, 0]} material={materials.darkChassis}>
          <boxGeometry args={[0.26, 0.08, 0.32]} />
        </mesh>

        {/* Right Leg */}
        <mesh position={[0.92, 0, 0]} material={materials.darkChassis} castShadow>
          <boxGeometry args={[0.14, 0.68, 0.14]} />
        </mesh>
        <mesh position={[0.92, -0.38, 0]} material={materials.darkChassis}>
          <boxGeometry args={[0.26, 0.08, 0.32]} />
        </mesh>

        {/* Diagonal Cross Brace Bar & Crank Shaft */}
        <mesh position={[0, 0.1, 0]} material={materials.darkChassis}>
          <boxGeometry args={[1.75, 0.06, 0.06]} />
        </mesh>
        <mesh position={[-1.02, 0.1, 0]} material={materials.mirrorChrome}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 6. STAINLESS STEEL REAR DOOR FRAME, CAM-LOCK RODS & ICC BUMPER           */}
      {/* ========================================================================= */}
      <group position={[0, 2.15, -5.82]}>
        {/* Heavy-Duty Stainless Steel Rear Door Outer Frame */}
        <mesh material={materials.mirrorChrome} castShadow>
          <boxGeometry args={[2.54, 2.68, 0.06]} />
        </mesh>
        {/* Left & Right Swing Doors */}
        <mesh position={[-0.61, 0, -0.02]} material={materials.trailerWall}>
          <boxGeometry args={[1.2, 2.58, 0.04]} />
        </mesh>
        <mesh position={[0.61, 0, -0.02]} material={materials.trailerWall}>
          <boxGeometry args={[1.2, 2.58, 0.04]} />
        </mesh>

        {/* Vertical Stainless Locking Cam Rods (2 per door = 4 total) */}
        {[-0.95, -0.35, 0.35, 0.95].map((rx, idx) => (
          <group key={`cam-rod-${idx}`} position={[rx, 0, -0.06]}>
            <mesh material={materials.mirrorChrome}>
              <cylinderGeometry args={[0.024, 0.024, 2.56, 12]} />
            </mesh>
            {/* Cam Latch Handles */}
            <mesh position={[0, -0.3, -0.04]} material={materials.darkChassis}>
              <boxGeometry args={[0.04, 0.28, 0.08]} />
            </mesh>
          </group>
        ))}

        {/* Rear Top 3 ID Marker LEDs + Corner Clearance Lamps */}
        <mesh position={[0, 1.28, -0.05]} material={materials.tailLightRed}>
          <boxGeometry args={[0.26, 0.04, 0.02]} />
        </mesh>
        <mesh position={[-1.18, 1.28, -0.05]} material={materials.tailLightRed}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
        </mesh>
        <mesh position={[1.18, 1.28, -0.05]} material={materials.tailLightRed}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
        </mesh>

        {/* Rear Lower Tail/Brake Light Clusters */}
        <mesh position={[-0.95, -1.18, -0.05]} material={materials.tailLightRed}>
          <boxGeometry args={[0.34, 0.12, 0.04]} />
        </mesh>
        <mesh position={[0.95, -1.18, -0.05]} material={materials.tailLightRed}>
          <boxGeometry args={[0.34, 0.12, 0.04]} />
        </mesh>

        {/* Rear DOT Under-Ride ICC Steel Safety Bumper */}
        <group position={[0, -1.65, -0.08]}>
          <mesh material={materials.darkChassis} castShadow>
            <boxGeometry args={[2.42, 0.14, 0.14]} />
          </mesh>
          <mesh position={[-0.8, 0.2, 0]} material={materials.darkChassis}>
            <boxGeometry args={[0.1, 0.32, 0.1]} />
          </mesh>
          <mesh position={[0.8, 0.2, 0]} material={materials.darkChassis}>
            <boxGeometry args={[0.1, 0.32, 0.1]} />
          </mesh>
          {/* Alternating Red/White Tape on Rear Bumper */}
          <mesh position={[0, 0, -0.08]} material={materials.dotTapeRed}>
            <boxGeometry args={[2.38, 0.08, 0.01]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
