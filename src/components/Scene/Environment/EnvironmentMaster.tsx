import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HighwayRoad } from './HighwayRoad';
import { Guardrails } from './Guardrails';
import { MountainRange } from './MountainRange';
import { RoadsideFoliage } from './RoadsideFoliage';
import { LogisticsTerminal } from './LogisticsTerminal';
import { TopologicalNetwork } from './TopologicalNetwork';
import { WarehouseEnvironment } from './WarehouseEnvironment';
import { ShipyardEnvironment } from './ShipyardEnvironment';

interface EnvironmentMasterProps {
  scrollProgress: number;
  isMobile?: boolean;
}

export function EnvironmentMaster({ scrollProgress, isMobile = false }: EnvironmentMasterProps) {
  const highwayLoopRef = useRef<THREE.Group>(null);
  const originWarehouseRef = useRef<THREE.Group>(null);
  const transferWarehouseRef = useRef<THREE.Group>(null);
  const shipyardRef = useRef<THREE.Group>(null);
  const currentSpeedRef = useRef<number>(0.0);

  // The scroll defines absolute distance mapping for specific landmarks
  // Scale factor: How far does 1.0 scrollProgress represent in meters?
  const SCROLL_DISTANCE_SCALE = 600;

  useFrame((_, delta) => {
    // 1. Endless Looping for the Highway elements (Road, Guardrails, Trees)
    let targetSpeed = 0.0;
    if (scrollProgress >= 0.20 && scrollProgress < 0.30) {
      const phase = (scrollProgress - 0.20) / 0.10;
      targetSpeed = THREE.MathUtils.lerp(0.0, 18.0, phase);
    } else if (scrollProgress >= 0.30 && scrollProgress < 0.50) {
      targetSpeed = 24.0;
    } else if (scrollProgress >= 0.50 && scrollProgress < 0.60) {
      const phase = (scrollProgress - 0.50) / 0.10;
      targetSpeed = THREE.MathUtils.lerp(24.0, 0.0, phase);
    } else if (scrollProgress >= 0.70 && scrollProgress < 0.85) {
      const phase = Math.min(1.0, (scrollProgress - 0.70) / 0.05);
      targetSpeed = THREE.MathUtils.lerp(0.0, 22.0, phase);
    } else if (scrollProgress >= 0.85 && scrollProgress < 0.95) {
      const phase = (scrollProgress - 0.85) / 0.10;
      targetSpeed = THREE.MathUtils.lerp(22.0, 0.0, phase);
    }
    
    currentSpeedRef.current = THREE.MathUtils.lerp(currentSpeedRef.current, targetSpeed, 1.5 * delta);
    const move = currentSpeedRef.current * delta;

    if (highwayLoopRef.current) {
      highwayLoopRef.current.position.z -= move;
      if (highwayLoopRef.current.position.z < -24) {
        highwayLoopRef.current.position.z += 24;
      }
    }

    // 2. Absolute positioning for major landmarks based on scrollProgress
    if (originWarehouseRef.current) {
      originWarehouseRef.current.position.z = (0.0 - scrollProgress) * SCROLL_DISTANCE_SCALE;
    }
    
    if (transferWarehouseRef.current) {
      transferWarehouseRef.current.position.z = (0.65 - scrollProgress) * SCROLL_DISTANCE_SCALE;
      transferWarehouseRef.current.visible = Math.abs(transferWarehouseRef.current.position.z) < 250;
    }
    
    if (shipyardRef.current) {
      shipyardRef.current.position.z = (0.95 - scrollProgress) * SCROLL_DISTANCE_SCALE;
      shipyardRef.current.visible = Math.abs(shipyardRef.current.position.z) < 250;
    }
  });

  return (
    <group>
      {/* Endless Looping Highway Elements */}
      <group ref={highwayLoopRef}>
        <HighwayRoad scrollProgress={scrollProgress} />
        <Guardrails />
        <RoadsideFoliage />
      </group>

      {/* Static Parallax Mountain Ranges */}
      <MountainRange />

      {/* Major Story Landmarks */}
      <group ref={originWarehouseRef}>
        <WarehouseEnvironment type="origin" />
      </group>

      <group ref={transferWarehouseRef}>
        <WarehouseEnvironment type="transfer" />
        <LogisticsTerminal scrollProgress={scrollProgress} />
      </group>

      <group ref={shipyardRef}>
        <ShipyardEnvironment />
      </group>
      
      {/* Network Effect */}
      <TopologicalNetwork scrollProgress={scrollProgress} />
    </group>
  );
}
