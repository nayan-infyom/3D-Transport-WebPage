import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '../../systems/core/scrollStore';
import { getWorld } from '../../systems/World';

/**
 * The single frame loop.
 *
 * Every system is stepped from here, in a fixed order, once per frame. Nothing
 * else in the scene owns timing, which is what keeps the vehicle, the camera,
 * the light and the audio from ever drifting a frame apart.
 */
export function WorldRunner({ narrowViewport }: { narrowViewport: boolean }) {
  const world = getWorld();
  const { camera, invalidate } = useThree();

  useEffect(() => {
    world.camera.narrowViewport = narrowViewport;
  }, [world, narrowViewport]);

  useEffect(() => {
    // Start the rig exactly where the timeline says it should be, so the very
    // first frame is already the opening shot rather than a slide into it.
    world.vehicle.reset(scrollState.progress);
    invalidate();
  }, [world, invalidate]);

  useFrame((state, delta) => {
    world.reducedMotion = scrollState.reducedMotion;
    world.camera.pointerX = scrollState.pointerX;
    world.camera.pointerY = scrollState.pointerY;
    world.update(delta, state.camera as THREE.PerspectiveCamera, scrollState.progress);
  });

  return null;
}
