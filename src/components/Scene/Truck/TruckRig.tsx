import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { QualitySettings } from '../../../config/quality';
import { getWorld } from '../../../systems/World';
import { createTruckMaterials } from './Materials';
import { TractorCab } from './TractorCab';
import { Trailer53ft } from './Trailer53ft';
import { WheelAssembly, type WheelAssemblyHandle } from './WheelAssembly';
import { softSprite } from '../../../systems/materials/textures';

const DRIVE_AXLES: [number, number][] = [
  [-1.12, 1.8],
  [1.12, 1.8],
  [-1.12, 0.45],
  [1.12, 0.45],
];

const TRAILER_AXLES: [number, number][] = [
  [-1.14, -7.0],
  [1.14, -7.0],
  [-1.14, -8.35],
  [1.14, -8.35],
];

/**
 * The rig.
 *
 * Placement, steering, articulation and suspension all come from the vehicle
 * system; this component owns only the scene graph and the lamps. The split
 * matters: wheels live in the *path* frame so they never inherit body roll,
 * while the cab and van bodies sit in a nested frame that carries the
 * suspension - exactly how the real thing is put together.
 */
export function TruckRig({ quality }: { quality: QualitySettings }) {
  const world = getWorld();
  const materials = useMemo(() => createTruckMaterials(), []);

  const tractorRoot = useRef<THREE.Group>(null);
  const tractorBody = useRef<THREE.Group>(null);
  const trailerRoot = useRef<THREE.Group>(null);
  const trailerBody = useRef<THREE.Group>(null);
  const airLines = useRef<THREE.Group>(null);
  const driveshaft = useRef<THREE.Mesh>(null);
  const exhaust = useRef<THREE.Points>(null);

  const steerWheels = useRef<(WheelAssemblyHandle | null)[]>([]);
  const tractorWheels = useRef<(WheelAssemblyHandle | null)[]>([]);
  const trailerWheels = useRef<(WheelAssemblyHandle | null)[]>([]);

  useEffect(() => {
    const objects = world.vehicle.objects;
    objects.tractorRoot = tractorRoot.current;
    objects.tractorBody = tractorBody.current;
    objects.trailerRoot = trailerRoot.current;
    objects.trailerBody = trailerBody.current;
    world.vehicle.reset(world.progress);
    return () => {
      objects.tractorRoot = null;
      objects.tractorBody = null;
      objects.trailerRoot = null;
      objects.trailerBody = null;
    };
  }, [world]);

  /* Diesel stack haze - 24 points recycled up the exhaust plume. */
  const exhaustGeometry = useMemo(() => {
    const count = 24;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i] = i / count;
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData.seeds = seeds;
    return geometry;
  }, []);

  const exhaustMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color('#8C949B'),
        map: softSprite(),
        size: 0.62,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );

  useFrame((_, delta) => {
    const vehicle = world.vehicle;
    const lamps = world.lighting.current.vehicleLights;

    const angle = vehicle.wheelRotation;
    for (let i = 0; i < tractorWheels.current.length; i++) {
      tractorWheels.current[i]?.setRotation(angle);
    }
    for (let i = 0; i < steerWheels.current.length; i++) {
      steerWheels.current[i]?.setSteering(vehicle.steer);
    }
    const trailerAngle = vehicle.coupled ? vehicle.trailerWheelRotation : 0;
    for (let i = 0; i < trailerWheels.current.length; i++) {
      trailerWheels.current[i]?.setRotation(trailerAngle);
    }

    if (driveshaft.current) driveshaft.current.rotation.y = angle * 3.2;

    if (airLines.current) {
      const latch = vehicle.couplingLatch;
      airLines.current.visible = latch > 0.02;
      airLines.current.scale.setScalar(0.2 + latch * 0.8);
    }

    // Lamps follow the time of day; brake lights follow deceleration.
    const braking = THREE.MathUtils.clamp(-vehicle.accel * 0.45, 0, 1);
    materials.headlightLed.emissiveIntensity = 1.2 + lamps * 7;
    materials.amberLed.emissiveIntensity = 0.6 + lamps * 3.4;
    materials.tailLightRed.emissiveIntensity = 0.5 + lamps * 2.4 + braking * 6;

    // Exhaust: rises, drifts back, recycles. Cheap, and it sells the idle.
    if (exhaust.current) {
      const attr = exhaust.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const seeds = exhaust.current.geometry.userData.seeds as Float32Array;
      const rate = 0.35 + vehicle.engineLoad * 1.6;
      for (let i = 0; i < attr.count; i++) {
        let y = attr.getY(i) + delta * (0.8 + seeds[i] * 0.9) * rate;
        let z = attr.getZ(i) - delta * Math.abs(vehicle.displaySpeed) * 0.35;
        if (y > 2.6) {
          y = 0;
          z = 0;
        }
        attr.setXYZ(i, Math.sin(seeds[i] * 31 + y * 2.2) * y * 0.14, y, z);
      }
      attr.needsUpdate = true;
      exhaustMaterial.opacity = 0.05 + vehicle.engineLoad * 0.16;
    }
  });

  return (
    <>
      {/* ================= TRACTOR ================= */}
      <group ref={tractorRoot}>
        <group ref={tractorBody}>
          <TractorCab materials={materials} />

          {/* Air / electrical umbilicals, revealed as the kingpin locks. */}
          <group ref={airLines} position={[0, 1.15, -0.9]} visible={false}>
            <mesh material={materials.dotTapeRed} position={[-0.15, 0, 0]} rotation={[0.35, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 1.1, 6]} />
            </mesh>
            <mesh material={materials.windowGlass} position={[0.15, 0, 0]} rotation={[0.35, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 1.1, 6]} />
            </mesh>
            <mesh material={materials.darkChassis} rotation={[0.35, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1.1, 6]} />
            </mesh>
          </group>

          <points ref={exhaust} geometry={exhaustGeometry} material={exhaustMaterial} position={[-1.15, 3.45, 2.1]} />
        </group>

        <group position={[0, 0.45, 3.2]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh ref={driveshaft} material={materials.darkChassis}>
            <cylinderGeometry args={[0.06, 0.06, 3.5, 6]} />
          </mesh>
        </group>

        <WheelAssembly
          ref={(el) => {
            steerWheels.current[0] = el;
            tractorWheels.current[0] = el;
          }}
          position={[-1.12, 0.52, 5.0]}
          materials={materials}
          isSteer
          isLeft
        />
        <WheelAssembly
          ref={(el) => {
            steerWheels.current[1] = el;
            tractorWheels.current[1] = el;
          }}
          position={[1.12, 0.52, 5.0]}
          materials={materials}
          isSteer
        />

        {DRIVE_AXLES.map(([x, z], i) => (
          <WheelAssembly
            key={'drive-' + i}
            ref={(el) => {
              tractorWheels.current[2 + i] = el;
            }}
            position={[x, 0.52, z]}
            materials={materials}
            isDual
            isLeft={x < 0}
          />
        ))}

        {quality.headlightSpots && (
          <>
            <HeadlightBeam x={-1.02} />
            <HeadlightBeam x={1.02} />
          </>
        )}
      </group>

      {/* ================= TRAILER ================= */}
      <group ref={trailerRoot}>
        <group ref={trailerBody}>
          <Trailer53ft materials={materials} />
        </group>

        {TRAILER_AXLES.map(([x, z], i) => (
          <WheelAssembly
            key={'trailer-' + i}
            ref={(el) => {
              trailerWheels.current[i] = el;
            }}
            position={[x, 0.52, z]}
            materials={materials}
            isDual
            isLeft={x < 0}
          />
        ))}

        {[-1.2, 1.2].map((x) => (
          <group key={'flap-' + x} position={[x, 0.45, -9.1]}>
            <mesh material={materials.tireRubber} castShadow>
              <boxGeometry args={[0.7, 0.75, 0.04]} />
            </mesh>
            <mesh position={[0, -0.32, 0.022]} material={materials.mirrorChrome}>
              <boxGeometry args={[0.65, 0.08, 0.01]} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

/** A real cone of light on the road; the lamp lens itself is emissive geometry. */
function HeadlightBeam({ x }: { x: number }) {
  const world = getWorld();
  const light = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (light.current && target.current) light.current.target = target.current;
  }, []);

  useFrame(() => {
    if (!light.current) return;
    const lamps = world.lighting.current.vehicleLights;
    light.current.intensity = lamps * 55;
    light.current.visible = lamps > 0.05;
  });

  return (
    <>
      <spotLight
        ref={light}
        position={[x, 0.95, 5.5]}
        angle={0.52}
        penumbra={0.75}
        distance={62}
        decay={1.35}
        color="#EAF2FF"
        intensity={0}
      />
      <object3D ref={target} position={[x * 1.6, 0.05, 30]} />
    </>
  );
}
