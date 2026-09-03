import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { QUALITY_PRESETS, detectQualityTier, type QualityTier } from '../../config/quality';
import { getWorld } from '../../systems/World';
import { EnvironmentRoot } from './Environment/EnvironmentRoot';
import { LightingRig } from './Lighting/LightingRig';
import { PostFX } from './Effects/PostFX';
import { TruckRig } from './Truck/TruckRig';
import { WorldRunner } from './WorldRunner';

/**
 * The 3D stage.
 *
 * Quality is chosen once from the device, then owned by React so a demotion
 * from the runtime FPS monitor rebuilds the environment at the lower tier
 * (fewer instances, smaller shadows, no post) without touching the story.
 */
export function MainCanvas() {
  const [tier, setTier] = useState<QualityTier>(() => detectQualityTier());
  const [narrowViewport, setNarrowViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 900
  );

  const world = getWorld(tier);
  const quality = QUALITY_PRESETS[tier];

  useEffect(() => {
    world.setQuality(tier);
  }, [world, tier]);

  useEffect(() => {
    world.onQualityChange = (next) => setTier((current) => (current === next ? current : next));
    return () => {
      world.onQualityChange = null;
    };
  }, [world]);

  useEffect(() => {
    const onResize = () => setNarrowViewport(window.innerWidth < 900);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden" aria-hidden="true">
      <Canvas
        shadows={quality.shadows ? { type: quality.shadowType } : false}
        dpr={quality.dpr}
        gl={{
          antialias: !quality.postProcessing,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{ position: [19, 11.5, -9], fov: 32, near: 0.35, far: 2600 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.02;
        }}
      >
        <Suspense fallback={null}>
          <WorldRunner narrowViewport={narrowViewport} />
          <LightingRig quality={quality} />

          {/* A small baked studio probe: gives the chrome, glass and wet
              asphalt something to reflect without downloading an HDRI. */}
          <Environment resolution={128} frames={1} environmentIntensity={0.3}>
            <Lightformer intensity={2.4} position={[0, 6, 0]} scale={[12, 12, 1]} rotation={[-Math.PI / 2, 0, 0]} />
            <Lightformer intensity={0.9} position={[-6, 2, 4]} scale={[8, 6, 1]} color="#9DB6CC" />
            <Lightformer intensity={0.7} position={[6, 2, -4]} scale={[8, 6, 1]} color="#D9C7A8" />
            <Lightformer intensity={0.35} position={[0, -4, 0]} scale={[14, 14, 1]} rotation={[Math.PI / 2, 0, 0]} color="#3A3A38" />
          </Environment>

          <TruckRig quality={quality} />
          <EnvironmentRoot quality={quality} />
          <PostFX quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  );
}
