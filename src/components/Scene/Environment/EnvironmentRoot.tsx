import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { QualitySettings } from '../../../config/quality';
import { getWorld } from '../../../systems/World';
import { AmbientTraffic } from './AmbientTraffic';
import { OriginWarehouse } from './OriginWarehouse';
import { PortTerminal } from './PortTerminal';
import { RoadCorridor } from './RoadCorridor';
import { RoadsideProps } from './RoadsideProps';
import { Terrain } from './Terrain';
import { TransferFacility } from './TransferFacility';
import { createEnvironmentMaterials } from './materials';

/**
 * Hides a facility entirely when the rig is nowhere near it.
 *
 * Frustum culling still costs a traversal, and fog hides these long before the
 * camera would; gating on route distance takes three whole facilities out of
 * the render for most of the journey.
 */
function DistanceGate({
  from,
  to,
  children,
}: {
  from: number;
  to: number;
  children: ReactNode;
}) {
  const world = getWorld();
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const d = world.vehicle.distance;
    const visible = d >= from && d <= to;
    if (group.visible !== visible) group.visible = visible;
  });

  return <group ref={ref}>{children}</group>;
}

/**
 * The world the journey passes through.
 *
 * Composed of independent, route-anchored modules rather than one giant list of
 * primitives - each can be moved, retimed or replaced with a loaded asset
 * without touching anything else.
 */
export function EnvironmentRoot({ quality }: { quality: QualitySettings }) {
  const world = getWorld();
  const materials = useMemo(() => createEnvironmentMaterials(quality), [quality]);

  useEffect(() => () => materials.dispose(), [materials]);

  const routeLength = world.route.length;

  return (
    <group>
      <Terrain quality={quality} materials={materials} />
      <RoadCorridor quality={quality} materials={materials} />
      <RoadsideProps quality={quality} materials={materials} />
      <AmbientTraffic quality={quality} materials={materials} />

      <DistanceGate from={-40} to={300}>
        <OriginWarehouse quality={quality} materials={materials} />
      </DistanceGate>

      <DistanceGate from={430} to={940}>
        <TransferFacility quality={quality} materials={materials} />
      </DistanceGate>

      <DistanceGate from={840} to={routeLength + 200}>
        <PortTerminal quality={quality} materials={materials} />
      </DistanceGate>
    </group>
  );
}
