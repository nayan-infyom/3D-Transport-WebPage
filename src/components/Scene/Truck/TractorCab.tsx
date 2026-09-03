import * as THREE from 'three';
import { createTruckMaterials } from './Materials';

interface TractorCabProps {
  materials: ReturnType<typeof createTruckMaterials>;
}

/**
 * Aerodynamic Class 8 Modern Tractor Cab
 * High-roof sleeper cab with sculpted aerodynamic hood, chrome grille,
 * detailed interior, LED projector clusters, side chassis fairings,
 * dual chrome exhaust stacks with perforated heat shields, and polished fuel tanks.
 */
export function TractorCab({ materials }: TractorCabProps) {
  return (
    <group position={[0, 0, 3.2]}>
      {/* ========================================================================= */}
      {/* 1. CHASSIS RAILS & SUSPENSION SUBFRAME                                    */}
      {/* ========================================================================= */}
      {/* Dual Heavy-Duty Steel Frame Rails */}
      <mesh position={[-0.48, 0.45, -0.6]} material={materials.darkChassis} castShadow>
        <boxGeometry args={[0.1, 0.24, 6.2]} />
      </mesh>
      <mesh position={[0.48, 0.45, -0.6]} material={materials.darkChassis} castShadow>
        <boxGeometry args={[0.1, 0.24, 6.2]} />
      </mesh>
      {/* Chassis Crossmembers */}
      {[-2.8, -1.8, -0.8, 0.2, 1.2].map((z, i) => (
        <mesh key={i} position={[0, 0.45, z]} material={materials.darkChassis}>
          <boxGeometry args={[1.06, 0.16, 0.12]} />
        </mesh>
      ))}

      {/* Fifth Wheel Hitch Coupling Plate (Connects Tractor to Trailer) */}
      <group position={[0, 0.64, -2.1]}>
        <mesh material={materials.darkChassis} castShadow>
          <cylinderGeometry args={[0.44, 0.44, 0.08, 16]} />
        </mesh>
        <mesh material={materials.brushedAluminum} position={[0, 0.05, 0.15]}>
          <boxGeometry args={[0.22, 0.03, 0.4]} />
        </mesh>
      </group>

      {/* Behind-Cab Diamond Plate Aluminum Catwalk */}
      <mesh position={[0, 0.6, -1.1]} material={materials.brushedAluminum} receiveShadow>
        <boxGeometry args={[1.3, 0.04, 1.4]} />
      </mesh>

      {/* ========================================================================= */}
      {/* 2. MAIN CAB & SLEEPER BODY (SCULPTED AERODYNAMICS)                       */}
      {/* ========================================================================= */}
      {/* Main Sleeper Compartment (Lower Core) */}
      <mesh position={[0, 1.35, -0.2]} material={materials.cabPaint} castShadow receiveShadow>
        <boxGeometry args={[2.42, 1.4, 2.2]} />
      </mesh>

      {/* Aerodynamic High-Roof Sleeper Cap */}
      <mesh position={[0, 2.3, -0.25]} material={materials.cabPaint} castShadow receiveShadow>
        <boxGeometry args={[2.38, 0.6, 1.95]} />
      </mesh>
      {/* Sloped Roof Fairing Deflector (Directs wind over trailer) */}
      <mesh
        position={[0, 2.52, 0.55]}
        rotation={[-0.32, 0, 0]}
        material={materials.cabPaint}
        castShadow
      >
        <boxGeometry args={[2.34, 0.4, 1.1]} />
      </mesh>
      {/* Trailing Roof Wing Cap */}
      <mesh position={[0, 2.68, -0.9]} material={materials.cabPaint} castShadow>
        <boxGeometry args={[2.32, 0.16, 0.6]} />
      </mesh>

      {/* Side Aerodynamic Extenders (Cab-to-Trailer Gap Fairings) */}
      <mesh position={[-1.22, 1.55, -1.4]} material={materials.cabPaint} castShadow>
        <boxGeometry args={[0.06, 1.8, 0.5]} />
      </mesh>
      <mesh position={[1.22, 1.55, -1.4]} material={materials.cabPaint} castShadow>
        <boxGeometry args={[0.06, 1.8, 0.5]} />
      </mesh>
      {/* Flexible Rubber Extender Seals */}
      <mesh position={[-1.23, 1.55, -1.7]} material={materials.tireRubber}>
        <boxGeometry args={[0.03, 1.7, 0.12]} />
      </mesh>
      <mesh position={[1.23, 1.55, -1.7]} material={materials.tireRubber}>
        <boxGeometry args={[0.03, 1.7, 0.12]} />
      </mesh>

      {/* Sleeper Side Windows with Beveled Frames */}
      <mesh position={[-1.22, 1.8, -0.2]} material={materials.windowGlass}>
        <boxGeometry args={[0.02, 0.35, 0.6]} />
      </mesh>
      <mesh position={[1.22, 1.8, -0.2]} material={materials.windowGlass}>
        <boxGeometry args={[0.02, 0.35, 0.6]} />
      </mesh>

      {/* ========================================================================= */}
      {/* 3. SCULPTED HOOD & FRONT ENGINE BAY                                       */}
      {/* ========================================================================= */}
      {/* Sloped Aerodynamic Hood (Slopes down toward front grille) */}
      <group position={[0, 1.1, 1.5]}>
        <mesh
          position={[0, 0.08, 0.25]}
          rotation={[0.1, 0, 0]}
          material={materials.cabPaint}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.34, 0.95, 1.7]} />
        </mesh>

        {/* Sculpted Hood Center Ridge */}
        <mesh
          position={[0, 0.58, 0.2]}
          rotation={[0.1, 0, 0]}
          material={materials.orangeAccent}
          castShadow
        >
          <boxGeometry args={[0.42, 0.04, 1.65]} />
        </mesh>

        {/* Left & Right Sculpted Wheel Arches */}
        <mesh position={[-1.12, -0.15, 0.25]} material={materials.cabPaint} castShadow>
          <boxGeometry args={[0.18, 0.6, 1.6]} />
        </mesh>
        <mesh position={[1.12, -0.15, 0.25]} material={materials.cabPaint} castShadow>
          <boxGeometry args={[0.18, 0.6, 1.6]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 4. CHROME FRONT GRILLE & AERODYNAMIC BUMPER                              */}
      {/* ========================================================================= */}
      <group position={[0, 0.92, 2.38]}>
        {/* Chrome Grille Outer Surround Frame */}
        <mesh material={materials.mirrorChrome} castShadow>
          <boxGeometry args={[1.56, 0.88, 0.08]} />
        </mesh>
        {/* Grille Inner Dark Core */}
        <mesh position={[0, 0, 0.02]} material={materials.darkChassis}>
          <boxGeometry args={[1.44, 0.78, 0.06]} />
        </mesh>
        {/* Vertical Chrome Grille Slats */}
        {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((gx, idx) => (
          <mesh key={idx} position={[gx, 0, 0.05]} material={materials.mirrorChrome}>
            <boxGeometry args={[0.04, 0.74, 0.04]} />
          </mesh>
        ))}
        {/* Horizontal Chrome Grille Center Bar with Northline Emblem */}
        <mesh position={[0, 0.08, 0.06]} material={materials.mirrorChrome}>
          <boxGeometry args={[1.48, 0.06, 0.04]} />
        </mesh>
        <mesh position={[0, 0.08, 0.09]} material={materials.orangeAccent}>
          <boxGeometry args={[0.22, 0.08, 0.03]} />
        </mesh>

        {/* Front Heavy-Duty Aerodynamic Chrome Bumper */}
        <group position={[0, -0.48, 0.02]}>
          <mesh material={materials.mirrorChrome} castShadow>
            <boxGeometry args={[2.42, 0.32, 0.22]} />
          </mesh>
          {/* Lower Aerodynamic Air Dam Skirt */}
          <mesh position={[0, -0.2, 0]} material={materials.darkChassis}>
            <boxGeometry args={[2.38, 0.12, 0.16]} />
          </mesh>
          {/* Forward Collision Radar & LiDAR Sensor Pod */}
          <mesh position={[0, -0.04, 0.12]} material={materials.darkChassis}>
            <boxGeometry args={[0.24, 0.12, 0.06]} />
          </mesh>
          <mesh position={[0, -0.04, 0.15]} material={materials.orangeAccent}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
          </mesh>
          {/* Lower Fog Lights */}
          <mesh position={[-0.88, -0.04, 0.1]} material={materials.headlightLed}>
            <boxGeometry args={[0.2, 0.08, 0.04]} />
          </mesh>
          <mesh position={[0.88, -0.04, 0.1]} material={materials.headlightLed}>
            <boxGeometry args={[0.2, 0.08, 0.04]} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 5. DUAL LED HEADLIGHT CLUSTERS WITH DRL BROWS                             */}
      {/* ========================================================================= */}
      {/* Left Headlight */}
      <group position={[-1.02, 0.95, 2.34]}>
        {/* Chrome Headlight Housing */}
        <mesh material={materials.mirrorChrome}>
          <boxGeometry args={[0.26, 0.34, 0.08]} />
        </mesh>
        {/* Dual LED Projector Lenses */}
        <mesh position={[-0.04, 0.05, 0.04]} material={materials.headlightLed}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        </mesh>
        <mesh position={[-0.04, -0.06, 0.04]} material={materials.headlightLed}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        </mesh>
        {/* Amber LED Turn Indicator */}
        <mesh position={[0.08, 0, 0.04]} material={materials.amberLed}>
          <boxGeometry args={[0.05, 0.28, 0.02]} />
        </mesh>
      </group>

      {/* Right Headlight */}
      <group position={[1.02, 0.95, 2.34]}>
        <mesh material={materials.mirrorChrome}>
          <boxGeometry args={[0.26, 0.34, 0.08]} />
        </mesh>
        <mesh position={[0.04, 0.05, 0.04]} material={materials.headlightLed}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        </mesh>
        <mesh position={[0.04, -0.06, 0.04]} material={materials.headlightLed}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        </mesh>
        <mesh position={[-0.08, 0, 0.04]} material={materials.amberLed}>
          <boxGeometry args={[0.05, 0.28, 0.02]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 6. AERODYNAMIC WINDSHIELD, CAB GLASS & VISIBLE INTERIOR                  */}
      {/* ========================================================================= */}
      {/* Sloped Panoramic Windshield */}
      <mesh
        position={[0, 1.84, 1.05]}
        rotation={[-0.38, 0, 0]}
        material={materials.windowGlass}
        castShadow
      >
        <boxGeometry args={[2.24, 0.85, 0.04]} />
      </mesh>
      {/* Windshield Center Divider & Wiper Arms */}
      <mesh position={[0, 1.84, 1.06]} rotation={[-0.38, 0, 0]} material={materials.darkChassis}>
        <boxGeometry args={[0.04, 0.86, 0.05]} />
      </mesh>
      <mesh position={[-0.45, 1.55, 1.15]} rotation={[-0.38, 0, 0.4]} material={materials.darkChassis}>
        <boxGeometry args={[0.03, 0.55, 0.03]} />
      </mesh>
      <mesh position={[0.45, 1.55, 1.15]} rotation={[-0.38, 0, 0.4]} material={materials.darkChassis}>
        <boxGeometry args={[0.03, 0.55, 0.03]} />
      </mesh>

      {/* Driver & Passenger Side Windows */}
      <mesh position={[-1.21, 1.8, 0.55]} material={materials.windowGlass}>
        <boxGeometry args={[0.04, 0.65, 0.85]} />
      </mesh>
      <mesh position={[1.21, 1.8, 0.55]} material={materials.windowGlass}>
        <boxGeometry args={[0.04, 0.65, 0.85]} />
      </mesh>

      {/* Aerodynamic Sun Visor with 5 Amber Clearance LED Lights */}
      <group position={[0, 2.26, 1.18]} rotation={[-0.2, 0, 0]}>
        <mesh material={materials.cabPaint} castShadow>
          <boxGeometry args={[2.32, 0.14, 0.26]} />
        </mesh>
        <mesh position={[0, -0.04, 0.12]} material={materials.orangeAccent}>
          <boxGeometry args={[2.3, 0.03, 0.04]} />
        </mesh>
        {/* 5 Amber Roof Marker Lights */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((lx, idx) => (
          <mesh key={idx} position={[lx, 0.04, 0.12]} material={materials.amberLed}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
          </mesh>
        ))}
      </group>

      {/* Visible Cabin Interior (Seats, Dashboard, Steering Wheel) */}
      <group position={[0, 1.5, 0.4]}>
        {/* Dashboard Console */}
        <mesh position={[0, 0.05, 0.4]} material={materials.interiorTrim}>
          <boxGeometry args={[1.9, 0.28, 0.45]} />
        </mesh>
        {/* Glowing Instrument Cluster Display */}
        <mesh position={[-0.45, 0.18, 0.35]} material={materials.amberLed}>
          <boxGeometry args={[0.26, 0.1, 0.02]} />
        </mesh>
        {/* Driver Air-Ride Seat */}
        <mesh position={[-0.55, -0.1, -0.1]} material={materials.interiorTrim}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </mesh>
        <mesh position={[-0.55, 0.3, -0.3]} material={materials.interiorTrim}>
          <boxGeometry args={[0.48, 0.65, 0.18]} />
        </mesh>
        {/* Passenger Seat */}
        <mesh position={[0.55, -0.1, -0.1]} material={materials.interiorTrim}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </mesh>
        <mesh position={[0.55, 0.3, -0.3]} material={materials.interiorTrim}>
          <boxGeometry args={[0.48, 0.65, 0.18]} />
        </mesh>
        {/* Steering Column & Wheel */}
        <mesh position={[-0.55, 0.12, 0.22]} rotation={[0.4, 0, 0]} material={materials.darkChassis}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 12]} />
        </mesh>
        <mesh position={[-0.55, 0.22, 0.15]} rotation={[0.4, 0, 0]} material={materials.interiorTrim}>
          <torusGeometry args={[0.16, 0.02, 8, 20]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 7. AERODYNAMIC SIDE MIRRORS WITH CONVEX SPOTTERS                         */}
      {/* ========================================================================= */}
      {/* Left Mirror */}
      <group position={[-1.38, 1.82, 0.85]}>
        {/* Top & Bottom Mounting Brackets */}
        <mesh position={[0.1, 0.2, 0]} material={materials.mirrorChrome}>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
        </mesh>
        <mesh position={[0.1, -0.2, 0]} material={materials.mirrorChrome}>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
        </mesh>
        {/* Main Aerodynamic Mirror Housing */}
        <mesh position={[-0.04, 0, 0]} material={materials.cabPaint} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.18]} />
        </mesh>
        {/* Primary Mirror Glass */}
        <mesh position={[-0.04, 0.08, -0.09]} material={materials.mirrorChrome}>
          <boxGeometry args={[0.06, 0.34, 0.01]} />
        </mesh>
        {/* Lower Wide-Angle Convex Spotter Glass */}
        <mesh position={[-0.04, -0.18, -0.09]} material={materials.mirrorChrome}>
          <boxGeometry args={[0.06, 0.12, 0.01]} />
        </mesh>
      </group>

      {/* Right Mirror */}
      <group position={[1.38, 1.82, 0.85]}>
        <mesh position={[-0.1, 0.2, 0]} material={materials.mirrorChrome}>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
        </mesh>
        <mesh position={[-0.1, -0.2, 0]} material={materials.mirrorChrome}>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
        </mesh>
        <mesh position={[0.04, 0, 0]} material={materials.cabPaint} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.18]} />
        </mesh>
        <mesh position={[0.04, 0.08, -0.09]} material={materials.mirrorChrome}>
          <boxGeometry args={[0.06, 0.34, 0.01]} />
        </mesh>
        <mesh position={[0.04, -0.18, -0.09]} material={materials.mirrorChrome}>
          <boxGeometry args={[0.06, 0.12, 0.01]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 8. DUAL CHROME EXHAUST STACKS WITH HEAT SHIELDS                          */}
      {/* ========================================================================= */}
      {/* Left Vertical Exhaust Stack */}
      <group position={[-1.15, 2.2, -1.1]}>
        {/* Perforated Heat Shield */}
        <mesh material={materials.mirrorChrome} position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 1.4, 16, 1, true]} />
        </mesh>
        {/* Internal & Upper Exhaust Pipe with Slash Cut Tip */}
        <mesh material={materials.mirrorChrome} position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.8, 16]} />
        </mesh>
        <mesh
          material={materials.mirrorChrome}
          position={[0, 1.25, 0.06]}
          rotation={[0.3, 0, 0]}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
        </mesh>
      </group>

      {/* Right Vertical Exhaust Stack */}
      <group position={[1.15, 2.2, -1.1]}>
        <mesh material={materials.mirrorChrome} position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 1.4, 16, 1, true]} />
        </mesh>
        <mesh material={materials.mirrorChrome} position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.8, 16]} />
        </mesh>
        <mesh
          material={materials.mirrorChrome}
          position={[0, 1.25, 0.06]}
          rotation={[0.3, 0, 0]}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 9. CHASSIS SIDE FAIRINGS, DUAL FUEL TANKS & BOARDING STEPS                */}
      {/* ========================================================================= */}
      {/* Left Cylindrical Polished Aluminum Fuel Tank */}
      <group position={[-0.95, 0.58, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={materials.mirrorChrome} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 1.5, 24]} />
        </mesh>
        {/* Tank Retaining Straps */}
        <mesh position={[0, 0.45, 0]} material={materials.darkChassis}>
          <cylinderGeometry args={[0.37, 0.37, 0.06, 24]} />
        </mesh>
        <mesh position={[0, -0.45, 0]} material={materials.darkChassis}>
          <cylinderGeometry args={[0.37, 0.37, 0.06, 24]} />
        </mesh>
      </group>

      {/* Right Fuel Tank */}
      <group position={[0.95, 0.58, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={materials.mirrorChrome} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 1.5, 24]} />
        </mesh>
        <mesh position={[0, 0.45, 0]} material={materials.darkChassis}>
          <cylinderGeometry args={[0.37, 0.37, 0.06, 24]} />
        </mesh>
        <mesh position={[0, -0.45, 0]} material={materials.darkChassis}>
          <cylinderGeometry args={[0.37, 0.37, 0.06, 24]} />
        </mesh>
      </group>

      {/* Left Aerodynamic Chassis Skirt with Integrated Step */}
      <group position={[-1.18, 0.55, 0.35]}>
        <mesh material={materials.cabPaint} castShadow>
          <boxGeometry args={[0.1, 0.42, 1.3]} />
        </mesh>
        {/* Boarding Step Tread */}
        <mesh position={[-0.04, -0.08, 0]} material={materials.brushedAluminum}>
          <boxGeometry args={[0.14, 0.04, 0.7]} />
        </mesh>
        {/* Ground LED Marker Strip */}
        <mesh position={[-0.05, -0.18, 0]} material={materials.amberLed}>
          <boxGeometry args={[0.02, 0.03, 1.1]} />
        </mesh>
      </group>

      {/* Right Chassis Skirt */}
      <group position={[1.18, 0.55, 0.35]}>
        <mesh material={materials.cabPaint} castShadow>
          <boxGeometry args={[0.1, 0.42, 1.3]} />
        </mesh>
        <mesh position={[0.04, -0.08, 0]} material={materials.brushedAluminum}>
          <boxGeometry args={[0.14, 0.04, 0.7]} />
        </mesh>
        <mesh position={[0.05, -0.18, 0]} material={materials.amberLed}>
          <boxGeometry args={[0.02, 0.03, 1.1]} />
        </mesh>
      </group>
    </group>
  );
}
