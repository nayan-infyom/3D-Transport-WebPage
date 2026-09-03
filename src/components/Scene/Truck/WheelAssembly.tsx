import { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { createTruckMaterials } from './Materials';

export interface WheelAssemblyHandle {
  setRotation: (angle: number) => void;
  setSteering: (angle: number) => void;
}

interface WheelAssemblyProps {
  position: [number, number, number];
  materials: ReturnType<typeof createTruckMaterials>;
  isDual?: boolean;
  isSteer?: boolean;
  isLeft?: boolean;
}

/**
 * 22.5" Heavy-Duty Commercial Truck Wheel Assembly
 * Physically accurate wheel assembly with:
 * - Rounded tire sidewall geometry (aligned precisely with X-axis)
 * - 3 circumferential deep tread sipes
 * - 22.5" deep-dish steel rim with 6 ventilation handholes
 * - 10 chrome lug nuts on 285.75mm bolt circle
 * - Oil-bath axle hub cap with glass sight window
 * - Stationary ventilated disc brake rotor and heavy-duty caliper
 * - Independent steering knuckle (Y-axis) & rolling hub (X-axis)
 */
export const WheelAssembly = forwardRef<WheelAssemblyHandle, WheelAssemblyProps>(
  ({ position, materials, isDual = false, isSteer = false, isLeft = false }, ref) => {
    const steeringKnuckleRef = useRef<THREE.Group>(null);
    const rollingHubRef = useRef<THREE.Group>(null);

    // Expose methods to update rolling rotation and steering independently
    useImperativeHandle(ref, () => ({
      setRotation: (angle: number) => {
        if (rollingHubRef.current) {
          rollingHubRef.current.rotation.x = angle;
        }
      },
      setSteering: (angle: number) => {
        if (steeringKnuckleRef.current && isSteer) {
          steeringKnuckleRef.current.rotation.y = angle;
        }
      },
    }));

    // Outward direction multiplier (+1 for right, -1 for left)
    const outDir = isLeft ? -1 : 1;

    // 10 Chrome Lug Nut angles around hub circle
    const lugAngles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

    // 6 Vent handholes around rim face
    const ventAngles = [0, 60, 120, 180, 240, 300];

    // Helper sub-component for single tire + rim assembly
    const renderSingleWheel = (xOffset: number, isOuterWheel: boolean) => (
      <group position={[xOffset, 0, 0]}>
        {/* =================================================================== */}
        {/* 1. TIRE RUBBER PROFILE & TREAD                                      */}
        {/* =================================================================== */}
        {/* Main Tire Crown Cylinder */}
        <mesh material={materials.tireRubber} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.52, 0.52, 0.28, 36, 1, false]} />
        </mesh>

        {/* Outer Tread Shoulder Ring */}
        <mesh
          material={materials.tireRubber}
          position={[outDir * 0.12, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.48, 0.045, 16, 36]} />
        </mesh>

        {/* Inner Tread Shoulder Ring */}
        <mesh
          material={materials.tireRubber}
          position={[-outDir * 0.12, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.48, 0.045, 16, 36]} />
        </mesh>

        {/* 3 Circumferential Rain Sipes / Tread Grooves */}
        {[-0.07, 0, 0.07].map((gx, idx) => (
          <mesh
            key={`sipe-${idx}`}
            material={materials.darkChassis}
            position={[gx, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.522, 0.522, 0.02, 36, 1, true]} />
          </mesh>
        ))}

        {/* Outer Curved Sidewall Bulge */}
        <mesh
          material={materials.tireRubber}
          position={[outDir * 0.08, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.42, 0.08, 16, 36]} />
        </mesh>

        {/* Inner Curved Sidewall Bulge */}
        <mesh
          material={materials.tireRubber}
          position={[-outDir * 0.08, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.42, 0.08, 16, 36]} />
        </mesh>

        {/* =================================================================== */}
        {/* 2. 22.5" COMMERCIAL STEEL / ALLOY WHEEL RIM                         */}
        {/* =================================================================== */}
        {/* Outer Rim Lip */}
        <mesh
          material={materials.wheelRim}
          position={[outDir * 0.13, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.34, 0.34, 0.03, 32]} />
        </mesh>

        {/* Rim Barrel Cylinder */}
        <mesh
          material={materials.wheelRim}
          position={[0, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.33, 0.33, 0.26, 32, 1, true]} />
        </mesh>

        {/* Steer vs Drive/Trailer Rim Disc Profile (Convex vs Deep Dish) */}
        {isSteer ? (
          // Steer Front Wheel (Convex Outer Disc)
          <group position={[outDir * 0.09, 0, 0]}>
            <mesh material={materials.wheelRim} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.33, 0.33, 0.05, 32]} />
            </mesh>
            {/* Center Hub Boss */}
            <mesh
              material={materials.mirrorChrome}
              position={[outDir * 0.04, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.13, 0.13, 0.06, 24]} />
            </mesh>
            {/* Sight Glass */}
            <mesh
              material={materials.amberLed}
              position={[outDir * 0.075, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
            </mesh>
          </group>
        ) : (
          // Drive & Trailer Wheels (Deep Dish Inward Recessed Hub)
          <group position={[outDir * 0.02, 0, 0]}>
            <mesh material={materials.wheelRim} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.33, 0.28, 0.12, 32]} />
            </mesh>
            {/* Recessed Center Axle Hub Cap */}
            <mesh
              material={materials.mirrorChrome}
              position={[-outDir * 0.03, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.12, 0.12, 0.06, 20]} />
            </mesh>
          </group>
        )}

        {/* 6 Ventilation Handholes on Rim Face (Only for outer visible wheel) */}
        {isOuterWheel &&
          ventAngles.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const vr = 0.24;
            const vy = Math.cos(rad) * vr;
            const vz = Math.sin(rad) * vr;
            return (
              <mesh
                key={`vent-${i}`}
                position={[outDir * (isSteer ? 0.11 : 0.05), vy, vz]}
                material={materials.darkChassis}
              >
                <boxGeometry args={[0.02, 0.05, 0.08]} />
              </mesh>
            );
          })}

        {/* 10 Heavy-Duty Chrome Lug Nuts Array */}
        {isOuterWheel &&
          lugAngles.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const lr = 0.17;
            const ly = Math.cos(rad) * lr;
            const lz = Math.sin(rad) * lr;
            return (
              <mesh
                key={`lug-${i}`}
                position={[outDir * (isSteer ? 0.12 : 0.03), ly, lz]}
                rotation={[0, 0, Math.PI / 2]}
                material={materials.mirrorChrome}
              >
                <cylinderGeometry args={[0.018, 0.018, 0.035, 6]} />
              </mesh>
            );
          })}
      </group>
    );

    return (
      <group position={position}>
        {/* =================================================================== */}
        {/* STEERING KNUCKLE (Yaw around Y-axis for front wheels)               */}
        {/* =================================================================== */}
        <group ref={steeringKnuckleRef}>
          {/* ================================================================= */}
          {/* STATIONARY AXLE & BRAKE CALIPER (Does NOT spin with wheel)        */}
          {/* ================================================================= */}
          <group position={[-outDir * (isDual ? 0.28 : 0.05), 0, 0]}>
            {/* Ventilated Brake Disc Rotor */}
            <mesh material={materials.brakeDisc} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.26, 0.26, 0.04, 24]} />
            </mesh>
            {/* Heavy Cast Iron Brake Caliper Housing */}
            <mesh
              material={materials.darkChassis}
              position={[0, 0.18, 0.04]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.14, 0.18]} />
            </mesh>
          </group>

          {/* ================================================================= */}
          {/* ROTATING WHEEL HUB & TIRES (Spins strictly around X-axis)         */}
          {/* ================================================================= */}
          <group ref={rollingHubRef}>
            {/* Outer Wheel */}
            {renderSingleWheel(0, true)}

            {/* If Dual Axle (Drive & Trailer Tandem Wheels) -> Add Inner Wheel */}
            {isDual && renderSingleWheel(-outDir * 0.34, false)}
          </group>
        </group>
      </group>
    );
  }
);
