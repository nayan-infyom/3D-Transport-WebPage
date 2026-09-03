import * as THREE from 'three';

export type QualityTier = 'low' | 'medium' | 'high';

export interface QualitySettings {
  tier: QualityTier;
  dpr: [number, number];
  shadows: boolean;
  shadowMapSize: number;
  shadowType: THREE.ShadowMapType;
  postProcessing: boolean;
  depthOfField: boolean;
  bloom: boolean;
  /** Number of instanced roadside trees across the whole route. */
  treeCount: number;
  /** Instanced street light count. */
  lightPoleCount: number;
  /** Container instances in the port climax. */
  containerCount: number;
  /** Metres between generated road cross-sections. Lower = smoother curves. */
  roadStep: number;
  /** Ambient traffic vehicles. */
  trafficCount: number;
  /** Texture resolution for procedurally generated surface maps. */
  textureSize: number;
  anisotropy: number;
  /** Practical (in-world) lights are expensive; cap how many are live. */
  practicalLights: boolean;
  /** Hard ceiling on real point lights any one location may switch on. */
  maxPracticalLights: number;
  headlightSpots: boolean;
}

export const QUALITY_PRESETS: Record<QualityTier, QualitySettings> = {
  high: {
    tier: 'high',
    dpr: [1, 1.85],
    shadows: true,
    shadowMapSize: 2048,
    shadowType: THREE.PCFSoftShadowMap,
    postProcessing: true,
    depthOfField: true,
    bloom: true,
    treeCount: 520,
    lightPoleCount: 64,
    containerCount: 620,
    roadStep: 3,
    trafficCount: 10,
    textureSize: 512,
    anisotropy: 8,
    practicalLights: true,
    maxPracticalLights: 12,
    headlightSpots: true,
  },
  medium: {
    tier: 'medium',
    dpr: [1, 1.5],
    shadows: true,
    shadowMapSize: 1024,
    shadowType: THREE.PCFShadowMap,
    postProcessing: true,
    depthOfField: false,
    bloom: true,
    treeCount: 280,
    lightPoleCount: 40,
    containerCount: 340,
    roadStep: 4.5,
    trafficCount: 6,
    textureSize: 512,
    anisotropy: 4,
    practicalLights: true,
    maxPracticalLights: 8,
    headlightSpots: true,
  },
  low: {
    tier: 'low',
    dpr: [1, 1.25],
    shadows: false,
    shadowMapSize: 512,
    shadowType: THREE.BasicShadowMap,
    postProcessing: false,
    depthOfField: false,
    bloom: false,
    treeCount: 140,
    lightPoleCount: 22,
    containerCount: 180,
    roadStep: 7,
    trafficCount: 3,
    textureSize: 256,
    anisotropy: 2,
    practicalLights: false,
    maxPracticalLights: 3,
    headlightSpots: false,
  },
};

/**
 * Best-effort GPU / device classification. Deliberately conservative: it is far
 * better to start at medium and get promoted by the runtime FPS monitor than to
 * start at high on an integrated GPU and stutter through the opening shot.
 */
export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium';

  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(ua) || window.innerWidth < 820;
  if (isMobile) return 'low';

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;

  let renderer = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '');
      const loseCtx = gl.getExtension('WEBGL_lose_context');
      loseCtx?.loseContext();
    }
  } catch {
    /* renderer sniffing is a nicety, never a requirement */
  }

  const weakGpu = /(SwiftShader|llvmpipe|Software|Intel.*(HD|UHD) Graphics (5|6)\d{2})/i.test(renderer);
  if (weakGpu || cores <= 4 || memory <= 4) return 'medium';

  return 'high';
}

export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}
