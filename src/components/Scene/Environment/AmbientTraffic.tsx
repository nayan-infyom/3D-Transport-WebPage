import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CORRIDORS } from '../../../config/route';
import type { QualitySettings } from '../../../config/quality';
import { seededRandom } from '../../../systems/geometry/ribbon';
import { getWorld } from '../../../systems/World';
import type { EnvironmentMaterials } from './materials';

interface TrafficUnit {
  distance: number;
  lateral: number;
  speed: number;
  /** -1 = oncoming carriageway, +1 = same direction. */
  direction: 1 | -1;
  length: number;
  colour: THREE.Color;
}

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _matrix = new THREE.Matrix4();
const _up = new THREE.Vector3(0, 1, 0);

/**
 * A little life on the road.
 *
 * A handful of vehicles working the corridor, recycled in a window around the
 * rig so they are only ever simulated where they can be seen. Oncoming traffic
 * in particular does more for the sense of speed than any amount of blur.
 */
export function AmbientTraffic({
  quality,
  materials,
}: {
  quality: QualitySettings;
  materials: EnvironmentMaterials;
}) {
  const world = getWorld();
  const route = world.route;
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const cabRef = useRef<THREE.InstancedMesh>(null);

  const units = useMemo<TrafficUnit[]>(() => {
    const rand = seededRandom(6402);
    const corridors = CORRIDORS.filter((c) => c.kind === 'highway');
    const list: TrafficUnit[] = [];
    for (let i = 0; i < quality.trafficCount; i++) {
      const corridor = corridors[i % corridors.length];
      const from = route.at(corridor.from);
      const to = route.at(corridor.to);
      const oncoming = i % 3 !== 0;
      list.push({
        distance: from + rand() * (to - from),
        lateral: oncoming ? -14.5 - rand() * 7 : rand() > 0.5 ? -3.7 : 0,
        speed: 22 + rand() * 10,
        direction: oncoming ? -1 : 1,
        length: rand() > 0.55 ? 15.5 : 4.6,
        colour: new THREE.Color().setHSL(0.08 + rand() * 0.55, 0.12, 0.34 + rand() * 0.4),
      });
    }
    return list;
  }, [route, quality.trafficCount]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    for (let i = 0; i < units.length; i++) body.setColorAt(i, units[i].colour);
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
  }, [units]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    const cab = cabRef.current;
    if (!body || !cab) return;

    const truckDistance = world.vehicle.distance;
    const dt = Math.min(delta, 1 / 20);

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      unit.distance += unit.speed * unit.direction * dt;

      // Recycle around the rig so traffic is always where the camera is.
      const relative = unit.distance - truckDistance;
      if (relative < -320) unit.distance = truckDistance + 300 + Math.random() * 120;
      else if (relative > 460) unit.distance = truckDistance - 240 - Math.random() * 120;

      route.offsetPosition(unit.distance, unit.lateral, _pos);
      const heading = route.heading(unit.distance) + (unit.direction === -1 ? Math.PI : 0);
      _quat.setFromAxisAngle(_up, heading);

      _scale.set(1, 1, unit.length / 12);
      _pos.y += 1.55;
      _matrix.compose(_pos, _quat, _scale);
      body.setMatrixAt(i, _matrix);

      _scale.set(1, 1, 1);
      _pos.y += 0.6;
      _matrix.compose(_pos, _quat, _scale);
      cab.setMatrixAt(i, _matrix);
    }

    body.instanceMatrix.needsUpdate = true;
    cab.instanceMatrix.needsUpdate = true;
  });

  const count = Math.max(1, units.length);

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, count]}
        material={materials.containers}
        frustumCulled={false}
        castShadow={quality.shadows}
      >
        <boxGeometry args={[2.5, 3.0, 12]} />
      </instancedMesh>
      <instancedMesh
        ref={cabRef}
        args={[undefined, undefined, count]}
        material={materials.vehiclePaint}
        frustumCulled={false}
      >
        <boxGeometry args={[2.4, 1.1, 2.2]} />
      </instancedMesh>
    </group>
  );
}
