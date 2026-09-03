import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  scrollProgress: number; // 0 to 1
  mouseCoords: { x: number; y: number }; // normalized -1 to 1
  isMobile?: boolean;
}

// 9 Intentional Cinematic Logistics Story Camera Shots
const CAMERA_SHOTS = [
  // 0.00 - ORIGIN (Warehouse) - High/Wide establishing shot, quiet, dramatic
  {
    progress: 0.0,
    pos: new THREE.Vector3(5.5, 2.8, 14.5),
    target: new THREE.Vector3(0.0, 1.2, 2.0),
    fov: 34,
  },
  // 0.15 - PREPARATION (Trailer Connection) - Extremely low macro near the coupling point
  {
    progress: 0.15,
    pos: new THREE.Vector3(-3.5, 0.8, -1.0),
    target: new THREE.Vector3(0.0, 1.2, -4.0),
    fov: 28,
  },
  // 0.28 - DEPARTURE (Warehouse Exit) - Tracking low near the ground as it drives past
  {
    progress: 0.28,
    pos: new THREE.Vector3(4.5, 0.5, 8.0),
    target: new THREE.Vector3(-0.5, 1.2, 0.0),
    fov: 32,
  },
  // 0.42 - JOURNEY (Highway Tracking) - Close-up on the massive rolling wheels
  {
    progress: 0.42,
    pos: new THREE.Vector3(-3.2, 0.4, 3.5),
    target: new THREE.Vector3(1.1, 0.52, 1.5),
    fov: 24,
  },
  // 0.60 - TRANSFER (Second Warehouse Arrival) - Majestic drone-like orbit
  {
    progress: 0.60,
    pos: new THREE.Vector3(18.0, 6.5, 8.0),
    target: new THREE.Vector3(0.0, 1.5, -2.0),
    fov: 36,
  },
  // 0.76 - JOURNEY II (Road to Port) - Front three-quarter aggressive angle
  {
    progress: 0.76,
    pos: new THREE.Vector3(4.5, 1.2, 7.5),
    target: new THREE.Vector3(0.0, 1.5, 2.0),
    fov: 26,
  },
  // 0.90 - DESTINATION (Massive Port Reveal) - Extremely wide high-angle looking down at tiny truck vs massive port
  {
    progress: 0.90,
    pos: new THREE.Vector3(22.0, 15.0, 25.0),
    target: new THREE.Vector3(-8.0, 2.0, -15.0),
    fov: 42,
  },
  // 1.00 - DELIVERY (Final Pull-back) - Golden hour resting shot, soft and grounded
  {
    progress: 1.0,
    pos: new THREE.Vector3(-6.0, 1.8, -20.0),
    target: new THREE.Vector3(0.0, 2.2, -5.0),
    fov: 32,
  },
];

/**
 * Spline-Interpolated Cinematic Automotive Commercial Camera Controller
 * Uses Catmull-Rom centripetal spline curves to achieve buttery-smooth,
 * physical camera transitions across all 9 commercial shots with dynamic FOV and subtle parallax.
 */
export function CameraController({
  scrollProgress,
  mouseCoords,
  isMobile = false,
}: CameraControllerProps) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(3.8, 1.6, 9.2));
  const currentTarget = useRef(new THREE.Vector3(0, 1.2, 1.6));

  // Build smooth spline curves through the 9 keyframe positions & targets
  const { posCurve, targetCurve } = useMemo(() => {
    const positions = CAMERA_SHOTS.map((s) => s.pos);
    const targets = CAMERA_SHOTS.map((s) => s.target);
    return {
      posCurve: new THREE.CatmullRomCurve3(positions, false, 'centripetal', 0.5),
      targetCurve: new THREE.CatmullRomCurve3(targets, false, 'centripetal', 0.5),
    };
  }, []);

  // Calculate interpolated state for a given scroll progress value
  const getCameraState = (p: number) => {
    const clampedP = Math.max(0, Math.min(1, p));

    // Sample from smooth splines
    const pos = posCurve.getPoint(clampedP);
    const target = targetCurve.getPoint(clampedP);

    // Segment search for FOV Hermite smoothstep
    let idx = 0;
    for (let i = 0; i < CAMERA_SHOTS.length - 1; i++) {
      if (clampedP >= CAMERA_SHOTS[i].progress && clampedP <= CAMERA_SHOTS[i + 1].progress) {
        idx = i;
        break;
      }
    }
    const k1 = CAMERA_SHOTS[idx];
    const k2 = CAMERA_SHOTS[idx + 1] || k1;
    const segRange = k2.progress - k1.progress || 1;
    const t = Math.max(0, Math.min(1, (clampedP - k1.progress) / segRange));
    const smoothT = t * t * (3 - 2 * t);
    const fov = THREE.MathUtils.lerp(k1.fov, k2.fov, smoothT);

    // Mobile camera composition adaptations
    if (isMobile) {
      pos.multiplyScalar(1.24);
      pos.y += 0.5;
    }

    return { pos, target, fov };
  };

  useFrame((state, delta) => {
    const { pos, target, fov } = getCameraState(scrollProgress);

    // Subtle physical mouse tracking parallax
    const parallaxFactor = isMobile ? 0 : 0.28;
    
    // Simulate subtle high-frequency camera shake from road vibration
    const t = state.clock.getElapsedTime();
    const speedFactor = scrollProgress < 0.5 ? 1.0 : (scrollProgress > 0.8 ? 1.5 : 0.2); // Faster shake on highway
    const shakeX = Math.sin(t * 35.0) * 0.0015 * speedFactor;
    const shakeY = Math.cos(t * 42.0) * 0.0015 * speedFactor;

    const targetX = pos.x + mouseCoords.x * parallaxFactor + shakeX;
    const targetY = pos.y + mouseCoords.y * (parallaxFactor * 0.35) + shakeY;
    const targetZ = pos.z;

    // Smooth physical damping
    const lerpSpeed = Math.min(1, 4.8 * delta);
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetX, lerpSpeed);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetY, lerpSpeed);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetZ, lerpSpeed);

    currentTarget.current.x = THREE.MathUtils.lerp(currentTarget.current.x, target.x, lerpSpeed);
    currentTarget.current.y = THREE.MathUtils.lerp(currentTarget.current.y, target.y, lerpSpeed);
    currentTarget.current.z = THREE.MathUtils.lerp(currentTarget.current.z, target.z, lerpSpeed);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, fov, lerpSpeed);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
