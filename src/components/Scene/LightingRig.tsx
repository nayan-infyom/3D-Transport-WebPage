import { Environment, ContactShadows } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface LightingRigProps {
  scrollProgress: number;
  isMobile?: boolean;
}

export function LightingRig({ scrollProgress, isMobile = false }: LightingRigProps) {
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const skyFillRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);

  // Reusable colors
  const warehouseSun = new THREE.Color('#90A4AE');
  const warehouseHemi = new THREE.Color('#455A64');
  
  const daySun = new THREE.Color('#FFF6EA');
  const dayHemi = new THREE.Color('#FFFDF8');
  
  const sunsetSun = new THREE.Color('#FF8A65');
  const sunsetHemi = new THREE.Color('#5D4037');

  const nightSun = new THREE.Color('#2C3E50');
  const nightHemi = new THREE.Color('#1A252F');

  useFrame(() => {
    let targetSunColor = daySun;
    let targetHemiColor = dayHemi;
    let targetSunIntensity = 2.3;

    if (scrollProgress < 0.25) {
      // Warehouse 1
      targetSunColor = warehouseSun;
      targetHemiColor = warehouseHemi;
      targetSunIntensity = 1.0;
    } else if (scrollProgress >= 0.25 && scrollProgress < 0.65) {
      // Highway Daylight
      targetSunColor = daySun;
      targetHemiColor = dayHemi;
      targetSunIntensity = 2.3;
    } else if (scrollProgress >= 0.65 && scrollProgress < 0.85) {
      // Highway 2 / Sunset
      targetSunColor = sunsetSun;
      targetHemiColor = sunsetHemi;
      targetSunIntensity = 1.5;
    } else if (scrollProgress >= 0.85) {
      // Port Night
      targetSunColor = nightSun;
      targetHemiColor = nightHemi;
      targetSunIntensity = 0.5;
    }

    if (sunLightRef.current) {
      sunLightRef.current.color.lerp(targetSunColor, 0.05);
      sunLightRef.current.intensity = THREE.MathUtils.lerp(sunLightRef.current.intensity, targetSunIntensity, 0.05);
    }
    
    if (hemiLightRef.current) {
      hemiLightRef.current.color.lerp(targetHemiColor, 0.05);
    }
  });

  return (
    <>
      <Environment preset="city" environmentIntensity={0.82} />

      <ContactShadows
        position={[0, 0.015, 0]}
        opacity={0.9}
        scale={30}
        blur={2.4}
        far={6}
        resolution={isMobile ? 512 : 1024}
        color="#080a0c"
      />

      <directionalLight
        ref={sunLightRef}
        position={[22, 28, 16]}
        intensity={2.3}
        color="#FFF6EA"
        castShadow
        shadow-mapSize-width={isMobile ? 1024 : 2048}
        shadow-mapSize-height={isMobile ? 1024 : 2048}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0001}
      />

      <directionalLight
        ref={skyFillRef}
        position={[-18, 14, -10]}
        intensity={0.7}
        color="#DFEEF8"
      />

      <directionalLight
        ref={rimLightRef}
        position={[-12, 10, -26]}
        intensity={1.5}
        color="#FFE8C2"
      />

      <directionalLight
        position={[0, 5, 20]}
        intensity={0.45}
        color="#FFFFFF"
      />

      <hemisphereLight
        ref={hemiLightRef}
        color="#FFFDF8"
        groundColor="#D6CEBE"
        intensity={0.85}
      />
    </>
  );
}
