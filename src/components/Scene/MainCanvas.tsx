import { Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TruckAssembly } from './Truck/TruckAssembly';
import { EnvironmentMaster } from './Environment/EnvironmentMaster';
import { CameraController } from './CameraController';
import { LightingRig } from './LightingRig';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';

// Create a component specifically to animate scene properties
function SceneAnimator({ scrollProgress }: { scrollProgress: number }) {
  useFrame(({ scene }) => {
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      let targetFogColor = new THREE.Color('#F3EFE6'); // Daylight

      if (scrollProgress < 0.25) {
        targetFogColor = new THREE.Color('#455A64'); // Warehouse
      } else if (scrollProgress >= 0.25 && scrollProgress < 0.65) {
        targetFogColor = new THREE.Color('#F3EFE6'); // Day
      } else if (scrollProgress >= 0.65 && scrollProgress < 0.85) {
        targetFogColor = new THREE.Color('#5D4037'); // Sunset
      } else if (scrollProgress >= 0.85) {
        targetFogColor = new THREE.Color('#1A252F'); // Night Port
      }

      scene.fog.color.lerp(targetFogColor, 0.05);
    }
  });
  return null;
}

interface MainCanvasProps {
  scrollProgress: number;
  mouseCoords: { x: number; y: number };
}

/**
 * Main 3D Canvas Scene Root
 * Configures WebGL ACES Filmic tone mapping, calibrated daylight atmospheric fog (#F3EFE6),
 * high-performance shadow settings, and coordinates camera, lighting, vehicle, and environment.
 */
export function MainCanvas({ scrollProgress, mouseCoords }: MainCanvasProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <Canvas
        shadows
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        camera={{
          position: [3.2, 1.4, 8.2],
          fov: 34,
          near: 0.1,
          far: 320,
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          // Calibrated daylight atmospheric fog in warm ivory #F3EFE6
          scene.fog = new THREE.FogExp2('#F3EFE6', 0.0068);
        }}
      >
        <Suspense fallback={null}>
          <SceneAnimator scrollProgress={scrollProgress} />
          {/* 1. Cinematic Daylight Lighting Rig with Drei Environment & Contact Shadows */}
          <LightingRig scrollProgress={scrollProgress} isMobile={isMobile} />

          {/* 2. Catmull-Rom Spline Camera Choreography */}
          <CameraController
            scrollProgress={scrollProgress}
            mouseCoords={mouseCoords}
            isMobile={isMobile}
          />

          {/* 3. High-Detail Master Semi-Truck Vehicle Assembly */}
          <TruckAssembly scrollProgress={scrollProgress} isMobile={isMobile} />

          {/* 4. Complete Highway & Landscape Subsystems */}
          <EnvironmentMaster scrollProgress={scrollProgress} isMobile={isMobile} />
          
          {/* 5. Post Processing Cinematic Effects */}
          {!isMobile && (
            <EffectComposer multisampling={4}>
              <DepthOfField focusDistance={0.015} focalLength={0.05} bokehScale={3} height={480} />
              <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.5} />
              <Vignette eskil={false} offset={0.05} darkness={0.8} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
