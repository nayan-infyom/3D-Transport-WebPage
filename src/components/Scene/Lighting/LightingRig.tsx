import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { QualitySettings } from '../../../config/quality';
import { getWorld } from '../../../systems/World';
import { SkyDome } from './SkyDome';

/**
 * The global light rig: one key, one sky bounce, one ambient lift and the fog.
 *
 * Deliberately small. Every look change comes from the lighting system blending
 * states across these few lights plus the sky dome, rather than from a pile of
 * fill lights that can never be reasoned about.
 */
export function LightingRig({ quality }: { quality: QualitySettings }) {
  const world = getWorld();
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const { scene, gl } = useThree();

  useEffect(() => {
    const lighting = world.lighting;
    lighting.sun = sunRef.current;
    lighting.hemi = hemiRef.current;
    lighting.ambient = ambientRef.current;
    lighting.renderer = gl;
    lighting.scene = scene;

    const fog = new THREE.FogExp2('#12171B', 0.011);
    scene.fog = fog;
    scene.background = new THREE.Color('#12171B');
    lighting.fog = fog;

    const sun = sunRef.current;
    if (sun && sun.target.parent !== scene) scene.add(sun.target);

    return () => {
      lighting.sun = null;
      lighting.hemi = null;
      lighting.ambient = null;
      lighting.fog = null;
      lighting.renderer = null;
      lighting.scene = null;
    };
  }, [world, scene, gl]);

  const shadowExtent = 46;

  return (
    <>
      <SkyDome />

      <directionalLight
        ref={sunRef}
        position={[-90, 110, 70]}
        intensity={0.55}
        color="#9FB4C4"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-near={20}
        shadow-camera-far={320}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-bias={-0.0006}
        shadow-normalBias={0.035}
      />

      <hemisphereLight ref={hemiRef} args={['#4A5A66', '#14181B', 0.45]} />
      <ambientLight ref={ambientRef} color="#2A343C" intensity={0.35} />
    </>
  );
}
