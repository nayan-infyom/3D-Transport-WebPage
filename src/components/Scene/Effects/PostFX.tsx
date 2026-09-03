import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DepthOfFieldEffect } from 'postprocessing';
import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { QualitySettings } from '../../../config/quality';
import { getWorld } from '../../../systems/World';

/**
 * Image finish.
 *
 * Deliberately restrained: a filmic bloom that only touches genuine highlights
 * (headlamps, floodlights, the sun), a light vignette, and - on capable
 * hardware only - a shallow depth of field whose focal plane rides the truck,
 * so the macro shots actually rack focus instead of guessing a distance.
 *
 * The three configurations are separate trees rather than conditional children,
 * because the composer builds its effect chain from its children on mount.
 */
export function PostFX({ quality }: { quality: QualitySettings }) {
  const world = getWorld();
  const dofRef = useRef<DepthOfFieldEffect>(null);
  const initialTarget = useMemo(() => new THREE.Vector3(0, 1.6, 0), []);

  useFrame(() => {
    // The wrapper only copies its `target` prop when the prop identity changes,
    // so the focal plane has to be pushed onto the effect itself each frame.
    const target = dofRef.current?.target;
    if (!target) return;
    target.copy(world.vehicle.position);
    target.y += 1.6;
  });

  if (!quality.postProcessing) return null;

  if (quality.depthOfField) {
    return (
      <EffectComposer multisampling={4} enableNormalPass={false}>
        <DepthOfField
          ref={dofRef}
          target={initialTarget}
          focalLength={0.045}
          bokehScale={2.6}
          height={480}
        />
        <Bloom luminanceThreshold={0.92} luminanceSmoothing={0.28} mipmapBlur intensity={0.62} />
        <Vignette eskil={false} offset={0.12} darkness={0.72} />
      </EffectComposer>
    );
  }

  if (quality.bloom) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom luminanceThreshold={0.92} luminanceSmoothing={0.28} mipmapBlur intensity={0.55} />
        <Vignette eskil={false} offset={0.14} darkness={0.68} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Vignette eskil={false} offset={0.16} darkness={0.6} />
    </EffectComposer>
  );
}
