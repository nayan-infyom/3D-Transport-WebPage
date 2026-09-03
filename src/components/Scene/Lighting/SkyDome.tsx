import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getWorld } from '../../../systems/World';
import type { SkyUniforms } from '../../../systems/lighting/LightingSystem';

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uSunDir;
  uniform float uFalloff;
  uniform float uStars;
  varying vec3 vDir;

  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vec3 d = normalize(vDir);

    // Vertical gradient, weighted so the horizon band stays thin and clean.
    float up = clamp(d.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uZenith, pow(up, 0.42));

    // Ground haze below the horizon so the fog and the sky agree.
    col = mix(uHorizon * 0.86, col, smoothstep(-0.08, 0.14, d.y));

    // Sun / moon bloom.
    float sun = pow(max(dot(d, normalize(uSunDir)), 0.0), uFalloff);
    col += uGlow * sun * 1.35;

    if (uStars > 0.001) {
      vec3 cell = floor(d * 380.0);
      float star = step(0.9979, hash13(cell));
      float twinkle = 0.65 + 0.35 * hash13(cell + 17.0);
      col += vec3(star * twinkle) * uStars * smoothstep(0.02, 0.3, d.y);
    }

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Procedural sky dome.
 *
 * A single unlit sphere that owns the entire look of the sky - gradient, sun
 * bloom, stars - so the lighting system can move it from warehouse gloom to
 * noon to sunset to a starfield by animating six uniforms.
 */
export function SkyDome() {
  const world = getWorld();
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const material = useMemo(() => {
    const uniforms: SkyUniforms = {
      uZenith: { value: new THREE.Color('#0C1114') },
      uHorizon: { value: new THREE.Color('#1B242A') },
      uGlow: { value: new THREE.Color('#33424C') },
      uSunDir: { value: new THREE.Vector3(-0.4, 0.6, 0.6).normalize() },
      uFalloff: { value: 12 },
      uStars: { value: 0 },
    };
    world.lighting.sky = uniforms;
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      toneMapped: true,
    });
  }, [world]);

  useFrame(() => {
    // The dome rides with the camera so it can be small enough to stay inside
    // the far plane while still reading as infinitely distant.
    meshRef.current?.position.copy(camera.position);
  });

  return (
    <mesh ref={meshRef} material={material} frustumCulled={false} renderOrder={-1000}>
      <sphereGeometry args={[900, 32, 16]} />
    </mesh>
  );
}
