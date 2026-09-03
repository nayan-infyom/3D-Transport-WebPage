import * as THREE from 'three';
import { ROAD_SECTION, ROAD_WIDTH } from '../../config/route';

/**
 * Procedural surface maps.
 *
 * Everything is drawn into a canvas at load time - no texture downloads, no
 * decode cost, a few hundred KB of GPU memory in total. The point is not
 * photoreal detail but *variation*: breaking up the flat, sterile look that
 * untextured PBR primitives always have.
 */
const cache = new Map<string, THREE.Texture>();

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return { canvas, ctx };
}

/** Value noise, tileable in both axes. */
function noiseField(w: number, h: number, cells: number, seed: number) {
  const grid = new Float32Array(cells * cells);
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < grid.length; i++) grid[i] = rand();

  const out = new Float32Array(w * h);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < h; y++) {
    const gy = (y / h) * cells;
    const y0 = Math.floor(gy) % cells;
    const y1 = (y0 + 1) % cells;
    const fy = smooth(gy - Math.floor(gy));
    for (let x = 0; x < w; x++) {
      const gx = (x / w) * cells;
      const x0 = Math.floor(gx) % cells;
      const x1 = (x0 + 1) % cells;
      const fx = smooth(gx - Math.floor(gx));
      const a = grid[y0 * cells + x0] * (1 - fx) + grid[y0 * cells + x1] * fx;
      const b = grid[y1 * cells + x0] * (1 - fx) + grid[y1 * cells + x1] * fx;
      out[y * w + x] = a * (1 - fy) + b * fy;
    }
  }
  return out;
}

function fbm(w: number, h: number, seed: number, octaves = 4) {
  const out = new Float32Array(w * h);
  let amplitude = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const layer = noiseField(w, h, 4 * Math.pow(2, o), seed + o * 977);
    for (let i = 0; i < out.length; i++) out[i] += layer[i] * amplitude;
    total += amplitude;
    amplitude *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function finish(canvas: HTMLCanvasElement, repeat: [number, number], anisotropy: number, srgb: boolean) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = anisotropy;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/* ------------------------------------------------------------------------- */
/* Asphalt with baked lane markings                                           */
/* ------------------------------------------------------------------------- */

/**
 * One texture carries the whole road cross-section: aggregate, tyre polish,
 * shoulder, yellow median line, dashed lane divider and the white fog line.
 * That is one draw call for a kilometre of correctly marked highway.
 */
export function asphaltTextures(size: number, anisotropy: number) {
  const key = 'asphalt' + size;
  const cachedMap = cache.get(key + 'map');
  const cachedRough = cache.get(key + 'rough');
  if (cachedMap && cachedRough) return { map: cachedMap, roughnessMap: cachedRough };

  const w = size;
  const h = size * 2;
  const { canvas, ctx } = makeCanvas(w, h);
  const { canvas: rCanvas, ctx: rCtx } = makeCanvas(w, h);

  const grain = fbm(w, h, 11, 5);
  const patches = fbm(w, h, 731, 3);

  const image = ctx.createImageData(w, h);
  const rough = rCtx.createImageData(w, h);

  const uToMetres = (u: number) => ROAD_SECTION.left + u * ROAD_WIDTH;
  const metreToU = (m: number) => (m - ROAD_SECTION.left) / ROAD_WIDTH;

  const dashStart = 0;
  const dashEnd = ROAD_SECTION.dashLength / ROAD_SECTION.dashPeriod;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const u = x / w;
      const metres = uToMetres(u);
      const g = grain[y * w + x];
      const p = patches[y * w + x];

      // Base asphalt with aggregate and repair-patch tonal drift.
      let r = 30 + g * 26 + p * 10;
      let gr = 32 + g * 26 + p * 10;
      let b = 35 + g * 26 + p * 11;
      let roughness = 0.86 + g * 0.12;

      // Shoulders: coarser, lighter, dustier.
      const onShoulder = metres < ROAD_SECTION.yellowLine - 0.35 || metres > ROAD_SECTION.fogLine + 0.25;
      if (onShoulder) {
        r += 16 + p * 14;
        gr += 15 + p * 13;
        b += 12 + p * 11;
        roughness = 0.94 + g * 0.06;
      }

      // Polished tyre ruts in both travel lanes.
      const rut = Math.min(
        Math.abs(Math.abs(metres - 0) - 0.95),
        Math.abs(Math.abs(metres - -3.7) - 0.95)
      );
      if (rut < 0.42) {
        const k = 1 - rut / 0.42;
        r -= 8 * k;
        gr -= 8 * k;
        b -= 7 * k;
        roughness -= 0.16 * k;
      }

      // Markings.
      const yellow = Math.abs(metres - ROAD_SECTION.yellowLine) < 0.075;
      const fog = Math.abs(metres - ROAD_SECTION.fogLine) < 0.075;
      const dashLane = Math.abs(metres - ROAD_SECTION.dashLine) < 0.075;
      const inDash = v >= dashStart && v < dashEnd;

      if (yellow) {
        r = 214 - g * 30;
        gr = 158 - g * 26;
        b = 38;
        roughness = 0.42 + g * 0.12;
      } else if (fog || (dashLane && inDash)) {
        r = 226 - g * 32;
        gr = 226 - g * 32;
        b = 219 - g * 30;
        roughness = 0.4 + g * 0.14;
      }

      image.data[i] = r;
      image.data[i + 1] = gr;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;

      const rv = Math.max(0, Math.min(255, roughness * 255));
      rough.data[i] = rv;
      rough.data[i + 1] = rv;
      rough.data[i + 2] = rv;
      rough.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  rCtx.putImageData(rough, 0, 0);

  const map = finish(canvas, [1, 1], anisotropy, true);
  map.wrapS = THREE.ClampToEdgeWrapping;
  const roughnessMap = finish(rCanvas, [1, 1], anisotropy, false);
  roughnessMap.wrapS = THREE.ClampToEdgeWrapping;

  cache.set(key + 'map', map);
  cache.set(key + 'rough', roughnessMap);
  return { map, roughnessMap };
}

/* ------------------------------------------------------------------------- */
/* Generic surfaces                                                           */
/* ------------------------------------------------------------------------- */

export type SurfaceKind = 'concrete' | 'ground' | 'grunge' | 'metal' | 'water';

const SURFACE_TINTS: Record<SurfaceKind, [number, number, number, number]> = {
  //          base r,g,b, contrast
  concrete: [120, 120, 118, 34],
  ground: [116, 112, 92, 30],
  grunge: [190, 190, 190, 64],
  metal: [176, 180, 184, 22],
  water: [128, 128, 255, 0],
};

export function surfaceTexture(
  kind: SurfaceKind,
  size: number,
  repeat: [number, number],
  anisotropy: number
): THREE.Texture {
  const key = kind + size + repeat.join('x');
  const cached = cache.get(key);
  if (cached) return cached;

  const { canvas, ctx } = makeCanvas(size, size);
  const image = ctx.createImageData(size, size);
  const base = fbm(size, size, kind.length * 137 + size, 5);
  const detail = fbm(size, size, 4211, 3);
  const [br, bg, bb, contrast] = SURFACE_TINTS[kind];

  for (let i = 0; i < size * size; i++) {
    const n = base[i];
    const d = detail[i];
    const idx = i * 4;

    if (kind === 'water') {
      // Packed normal map: gentle swell.
      const x = size === 0 ? 0 : i % size;
      const y = Math.floor(i / size);
      const left = base[y * size + ((x - 1 + size) % size)];
      const up = base[((y - 1 + size) % size) * size + x];
      const nx = (n - left) * 6;
      const ny = (n - up) * 6;
      image.data[idx] = 128 + nx * 110;
      image.data[idx + 1] = 128 + ny * 110;
      image.data[idx + 2] = 235;
      image.data[idx + 3] = 255;
      continue;
    }

    let k = (n - 0.5) * contrast + (d - 0.5) * contrast * 0.4;
    if (kind === 'concrete') {
      // Expansion-joint grid and staining.
      const x = i % size;
      const y = Math.floor(i / size);
      const joint = x % (size / 4) < 2 || y % (size / 4) < 2;
      if (joint) k -= 26;
      if (d > 0.72) k -= 14;
    }
    if (kind === 'metal') {
      const y = Math.floor(i / size);
      k += Math.sin(y * 0.7) * 3;
    }

    image.data[idx] = Math.max(0, Math.min(255, br + k));
    image.data[idx + 1] = Math.max(0, Math.min(255, bg + k));
    image.data[idx + 2] = Math.max(0, Math.min(255, bb + k));
    image.data[idx + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
  const texture = finish(canvas, repeat, anisotropy, kind !== 'water');
  cache.set(key, texture);
  return texture;
}

/** Soft radial falloff, for haze and smoke points. */
export function softSprite(size = 64): THREE.Texture {
  const key = 'sprite' + size;
  const cached = cache.get(key);
  if (cached) return cached;

  const { canvas, ctx } = makeCanvas(size, size);
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.42)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}

export function disposeTextures() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
