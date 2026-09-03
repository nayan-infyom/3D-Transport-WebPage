import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createTruckMaterials } from './Materials';
import { TractorCab } from './TractorCab';
import { Trailer53ft } from './Trailer53ft';
import { WheelAssembly, WheelAssemblyHandle } from './WheelAssembly';

interface TruckAssemblyProps {
  scrollProgress: number; // 0 to 1
  isMobile?: boolean;
}

/**
 * Master 3D Truck Assembly
 * Combines high-detail Class 8 aerodynamic tractor cab, 53ft corrugated freight trailer,
 * and 10 detailed 22.5" commercial wheel assemblies with physically accurate rolling,
 * independent steer knuckle yaw, air-ride suspension vibration, and 5th-wheel articulation.
 */
export function TruckAssembly({ scrollProgress, isMobile = false }: TruckAssemblyProps) {
  const masterGroupRef = useRef<THREE.Group>(null);
  const tractorRef = useRef<THREE.Group>(null);
  const trailerRef = useRef<THREE.Group>(null);
  const driveshaftRef = useRef<THREE.Mesh>(null);
  const steerWheelsRef = useRef<(WheelAssemblyHandle | null)[]>([]);
  const allWheelsRef = useRef<(WheelAssemblyHandle | null)[]>([]);

  // Wheel rolling rotation accumulator (in radians)
  const wheelAngleRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(22.0); // m/s
  const currentAccelRef = useRef<number>(0.0);

  // Memoize materials across all sub-components
  const materials = useMemo(() => createTruckMaterials(), []);

  // Frame animation loop with heavy physics & wheel kinematics
  useFrame((state, delta) => {
    if (!masterGroupRef.current) return;

    // --------------------------------------------------------
    // CINEMATIC TIMELINE & SPEED CONTROL
    // --------------------------------------------------------
    let targetSpeed = 0.0;
    let tractorOffsetZ = 0.0;
    let trailerOffsetZ = 0.0;
    let tractorRotY = 0.0;
    
    // 0.00 - 0.05: WAREHOUSE (Origin) - Tractor parked ahead of trailer
    if (scrollProgress < 0.05) {
      targetSpeed = 0.0;
      tractorOffsetZ = 8.0; 
      trailerOffsetZ = 0.0;
    } 
    // 0.05 - 0.15: PREPARE (Coupling) - Tractor reverses into trailer
    else if (scrollProgress >= 0.05 && scrollProgress < 0.15) {
      targetSpeed = 0.0;
      const phase = (scrollProgress - 0.05) / 0.10; // 0 to 1
      tractorOffsetZ = THREE.MathUtils.lerp(8.0, 0.0, phase);
      trailerOffsetZ = 0.0;
      // Slight steer correction as it backs up
      tractorRotY = Math.sin(phase * Math.PI) * 0.05;
    }
    // 0.15 - 0.20: CONNECTED - Waiting for departure
    else if (scrollProgress >= 0.15 && scrollProgress < 0.20) {
      targetSpeed = 0.0;
      tractorOffsetZ = 0.0;
      trailerOffsetZ = 0.0;
    }
    // 0.20 - 0.30: DEPARTURE - Accelerating out of warehouse
    else if (scrollProgress >= 0.20 && scrollProgress < 0.30) {
      const phase = (scrollProgress - 0.20) / 0.10;
      targetSpeed = THREE.MathUtils.lerp(0.0, 18.0, phase);
    }
    // 0.30 - 0.50: JOURNEY - Highway cruising
    else if (scrollProgress >= 0.30 && scrollProgress < 0.50) {
      targetSpeed = 24.0;
    }
    // 0.50 - 0.60: TRANSFER - Slowing down into Warehouse 2
    else if (scrollProgress >= 0.50 && scrollProgress < 0.60) {
      const phase = (scrollProgress - 0.50) / 0.10;
      targetSpeed = THREE.MathUtils.lerp(24.0, 0.0, phase);
    }
    // 0.60 - 0.70: WAREHOUSE 2 - Stopped for operation
    else if (scrollProgress >= 0.60 && scrollProgress < 0.70) {
      targetSpeed = 0.0;
    }
    // 0.70 - 0.85: JOURNEY II - Road to Port
    else if (scrollProgress >= 0.70 && scrollProgress < 0.85) {
      const phase = Math.min(1.0, (scrollProgress - 0.70) / 0.05);
      targetSpeed = THREE.MathUtils.lerp(0.0, 22.0, phase);
    }
    // 0.85 - 0.95: DESTINATION - Slowing down into Shipyard
    else if (scrollProgress >= 0.85 && scrollProgress < 0.95) {
      const phase = (scrollProgress - 0.85) / 0.10;
      targetSpeed = THREE.MathUtils.lerp(22.0, 0.0, phase);
    }
    // 0.95 - 1.00: DELIVERY - Stopped at Port
    else {
      targetSpeed = 0.0;
    }

    // Apply exact tractor Z offset for coupling
    if (tractorRef.current) {
      tractorRef.current.position.z = THREE.MathUtils.lerp(tractorRef.current.position.z, tractorOffsetZ, 0.1);
      tractorRef.current.rotation.y = THREE.MathUtils.lerp(tractorRef.current.rotation.y, tractorRotY, 0.1);
    }
    if (trailerRef.current) {
      trailerRef.current.position.z = THREE.MathUtils.lerp(trailerRef.current.position.z, trailerOffsetZ, 0.1);
    }

    // Calculate acceleration and smoothly update speed
    const previousSpeed = currentSpeedRef.current;
    currentSpeedRef.current = THREE.MathUtils.lerp(currentSpeedRef.current, targetSpeed, 1.5 * delta);
    const instantaneousAccel = (currentSpeedRef.current - previousSpeed) / delta;
    
    // Smooth out acceleration for physics calculation
    currentAccelRef.current = THREE.MathUtils.lerp(currentAccelRef.current, instantaneousAccel, 4.0 * delta);

    // 1. Physically accurate Wheel Angular Velocity & Rotation
    // Absolute speed used for wheels so they rotate correctly even if reversing
    const wheelSpeed = scrollProgress >= 0.05 && scrollProgress < 0.15 ? -4.0 : currentSpeedRef.current;
    const wheelRadius = 0.52; // 295/75R22.5 tire rolling radius in meters
    const angularVelocity = wheelSpeed / wheelRadius;

    wheelAngleRef.current = (wheelAngleRef.current + angularVelocity * delta) % (Math.PI * 2 * 1000);

    // Apply exact forward roll rotation to all 10 wheel assemblies
    allWheelsRef.current.forEach((wheel, index) => {
      if (wheel) {
        // Only spin trailer wheels if connected
        if (index >= 6 && scrollProgress < 0.15) {
          wheel.setRotation(0);
        } else {
          wheel.setRotation(wheelAngleRef.current);
        }
      }
    });

    if (driveshaftRef.current) {
      driveshaftRef.current.rotation.y = wheelAngleRef.current * 3.5;
    }

    // 2. Heavy 20+ Ton Vehicle Suspension & Air-Ride Physics
    const t = state.clock.getElapsedTime();
    
    // Engine vibration scales with speed/acceleration
    const vibrationFreq = 15.0 + (Math.abs(currentSpeedRef.current) * 0.1);
    const engineVibe = Math.sin(t * vibrationFreq) * 0.0008;

    // Low-frequency weighted chassis suspension bounce
    const suspensionBounce = Math.sin(t * 12) * 0.0015 + Math.cos(t * 7.2) * 0.001 + engineVibe;
    
    // Dynamic Pitching (Squat on acceleration, Dive on braking)
    const accelPitch = currentAccelRef.current * 0.004;
    
    // Micro-pitching of cab on pneumatic air-ride cushions + accel pitch
    const cabMicroPitch = Math.sin(t * 5.4) * 0.0006 + Math.cos(t * 9.1) * 0.0004 + accelPitch;
    
    // Subtle cab lateral roll sway
    const cabRoll = Math.sin(t * 4.2) * 0.0015;

    if (tractorRef.current) {
      tractorRef.current.position.y = suspensionBounce - (accelPitch * 0.5); 
      // Add existing base rotation X
      tractorRef.current.rotation.x = cabMicroPitch;
      tractorRef.current.rotation.z = cabRoll;
    }

    if (trailerRef.current) {
      trailerRef.current.position.y = suspensionBounce * 0.75 + (accelPitch * 1.2);
      trailerRef.current.rotation.x = -accelPitch * 0.3; 
      trailerRef.current.rotation.z = -cabRoll * 0.5;
    }

    // 3. Highway Steering & Curve Articulation based on Scroll Narrative
    let targetSteer = 0;
    let tractorYaw = 0;
    let trailerYaw = 0;
    let posX = 0;
    
    // Instead of sliding the truck left and right (strafing), we keep it centered
    // and rely on the cinematic camera and environment. 
    // We only apply very subtle micro-steering to make it feel alive.
    if (scrollProgress >= 0.30 && scrollProgress <= 0.85) {
      const alivePhase = t * 0.5;
      targetSteer = Math.sin(alivePhase) * 0.01;
      tractorYaw = targetSteer * 0.5;
      trailerYaw = -targetSteer * 0.2;
    }

    masterGroupRef.current.position.x = THREE.MathUtils.lerp(masterGroupRef.current.position.x, posX, 0.1);
    masterGroupRef.current.rotation.y = THREE.MathUtils.lerp(masterGroupRef.current.rotation.y, tractorYaw, 0.1);

    if (trailerRef.current) {
      trailerRef.current.rotation.y = THREE.MathUtils.lerp(trailerRef.current.rotation.y, trailerYaw, 0.1);
    }

    // Apply steering angle to front steer wheels
    steerWheelsRef.current.forEach((steerWheel) => {
      if (steerWheel) {
        steerWheel.setSteering(targetSteer);
      }
    });
  });

  return (
    <group ref={masterGroupRef} position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* 1. TRACTOR CAB UNIT                                                       */}
      {/* ========================================================================= */}
      <group ref={tractorRef}>
        <TractorCab materials={materials} />

        {/* Dynamic Spinning Driveshaft */}
        <mesh ref={driveshaftRef} position={[0, 0.45, 3.2]} rotation={[Math.PI / 2, 0, 0]} material={materials.darkChassis} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 3.5, 12]} />
        </mesh>

        {/* Tractor Rear Mudflaps */}
        <group position={[-1.2, 0.45, -0.2]}>
          <mesh material={materials.tireRubber} castShadow>
            <boxGeometry args={[0.65, 0.7, 0.04]} />
          </mesh>
          <mesh position={[0, -0.3, 0.022]} material={materials.mirrorChrome}>
            <boxGeometry args={[0.6, 0.08, 0.01]} />
          </mesh>
        </group>
        <group position={[1.2, 0.45, -0.2]}>
          <mesh material={materials.tireRubber} castShadow>
            <boxGeometry args={[0.65, 0.7, 0.04]} />
          </mesh>
          <mesh position={[0, -0.3, 0.022]} material={materials.mirrorChrome}>
            <boxGeometry args={[0.6, 0.08, 0.01]} />
          </mesh>
        </group>

        {/* Tractor Front Steer Axle (Single Steer Wheels with independent steering) */}
        <WheelAssembly
          ref={(el) => {
            steerWheelsRef.current[0] = el;
            allWheelsRef.current[0] = el;
          }}
          position={[-1.12, 0.52, 5.0]}
          materials={materials}
          isSteer={true}
          isLeft={true}
        />
        <WheelAssembly
          ref={(el) => {
            steerWheelsRef.current[1] = el;
            allWheelsRef.current[1] = el;
          }}
          position={[1.12, 0.52, 5.0]}
          materials={materials}
          isSteer={true}
          isLeft={false}
        />

        {/* Tractor Tandem Drive Axle 1 (Forward Drive Duals) */}
        <WheelAssembly
          ref={(el) => { allWheelsRef.current[2] = el; }}
          position={[-1.12, 0.52, 1.8]}
          materials={materials}
          isDual={true}
          isLeft={true}
        />
        <WheelAssembly
          ref={(el) => { allWheelsRef.current[3] = el; }}
          position={[1.12, 0.52, 1.8]}
          materials={materials}
          isDual={true}
          isLeft={false}
        />

        {/* Tractor Tandem Drive Axle 2 (Rear Drive Duals) */}
        <WheelAssembly
          ref={(el) => { allWheelsRef.current[4] = el; }}
          position={[-1.12, 0.52, 0.45]}
          materials={materials}
          isDual={true}
          isLeft={true}
        />
        <WheelAssembly
          ref={(el) => { allWheelsRef.current[5] = el; }}
          position={[1.12, 0.52, 0.45]}
          materials={materials}
          isDual={true}
          isLeft={false}
        />
      </group>

      {/* ========================================================================= */}
      {/* 2. 53FT FREIGHT TRAILER UNIT                                              */}
      {/* ========================================================================= */}
      <group ref={trailerRef}>
        <Trailer53ft materials={materials} />

        {/* Coiled Air Brake & Electrical Lines connecting Tractor Catwalk to Trailer */}
        <group position={[0, 1.1, 1.8]}>
          {/* Red Emergency Air Line */}
          <mesh material={materials.dotTapeRed} position={[-0.14, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.7, 8]} />
          </mesh>
          {/* Blue Service Air Line */}
          <mesh material={materials.windowGlass} position={[0.14, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.7, 8]} />
          </mesh>
          {/* Green 7-Way Electrical Cable */}
          <mesh material={materials.darkChassis} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
          </mesh>
        </group>

        {/* Trailer Tandem Axle 1 (Forward Duals) */}
        <WheelAssembly
          ref={(el) => { allWheelsRef.current[6] = el; }}
          position={[-1.14, 0.52, -7.0]}
          materials={materials}
          isDual={true}
          isLeft={true}
        />
        <WheelAssembly
          ref={(el) => { allWheelsRef.current[7] = el; }}
          position={[1.14, 0.52, -7.0]}
          materials={materials}
          isDual={true}
          isLeft={false}
        />

        {/* Trailer Tandem Axle 2 (Rear Duals) */}
        <WheelAssembly
          ref={(el) => { allWheelsRef.current[8] = el; }}
          position={[-1.14, 0.52, -8.35]}
          materials={materials}
          isDual={true}
          isLeft={true}
        />
        <WheelAssembly
          ref={(el) => { allWheelsRef.current[9] = el; }}
          position={[1.14, 0.52, -8.35]}
          materials={materials}
          isDual={true}
          isLeft={false}
        />

        {/* Trailer Rear Mudflaps */}
        <group position={[-1.2, 0.45, -9.1]}>
          <mesh material={materials.tireRubber} castShadow>
            <boxGeometry args={[0.7, 0.75, 0.04]} />
          </mesh>
          <mesh position={[0, -0.32, 0.022]} material={materials.mirrorChrome}>
            <boxGeometry args={[0.65, 0.08, 0.01]} />
          </mesh>
        </group>
        <group position={[1.2, 0.45, -9.1]}>
          <mesh material={materials.tireRubber} castShadow>
            <boxGeometry args={[0.7, 0.75, 0.04]} />
          </mesh>
          <mesh position={[0, -0.32, 0.022]} material={materials.mirrorChrome}>
            <boxGeometry args={[0.65, 0.08, 0.01]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
