import * as THREE from 'three';
import type { QualitySettings } from '../../../config/quality';
import { asphaltTextures, surfaceTexture } from '../../../systems/materials/textures';

/**
 * One shared material library for the whole world.
 *
 * Every environment module pulls from here, so a kilometre of highway, three
 * facilities and six hundred containers between them use a couple of dozen
 * materials rather than one per mesh. Procedural maps carry the roughness
 * variation that keeps the surfaces from reading as untextured plastic.
 */
export function createEnvironmentMaterials(quality: QualitySettings) {
  const { textureSize: size, anisotropy } = quality;

  const road = asphaltTextures(size, anisotropy);
  const concreteMap = surfaceTexture('concrete', size, [8, 8], anisotropy);
  const groundMap = surfaceTexture('ground', size, [90, 90], anisotropy);
  const metalMap = surfaceTexture('metal', size, [4, 4], anisotropy);
  const waterNormal = surfaceTexture('water', size, [26, 26], anisotropy);

  const asphalt = new THREE.MeshStandardMaterial({
    map: road.map,
    roughnessMap: road.roughnessMap,
    color: '#ffffff',
    roughness: 1,
    metalness: 0.04,
  });

  const apron = new THREE.MeshStandardMaterial({
    map: concreteMap,
    color: '#8B8B87',
    roughness: 0.92,
    metalness: 0.03,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const warehouseFloor = new THREE.MeshStandardMaterial({
    map: concreteMap,
    color: '#4E5052',
    roughness: 0.78,
    metalness: 0.06,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });

  const ground = new THREE.MeshStandardMaterial({
    map: groundMap,
    color: '#7C8062',
    roughness: 0.99,
    metalness: 0,
  });

  const verge = new THREE.MeshStandardMaterial({
    map: groundMap,
    color: '#8A8B6C',
    roughness: 0.98,
    metalness: 0,
  });

  const galvanised = new THREE.MeshStandardMaterial({
    map: metalMap,
    color: '#9AA2A8',
    roughness: 0.42,
    metalness: 0.85,
    side: THREE.DoubleSide,
  });

  const concreteBarrier = new THREE.MeshStandardMaterial({
    map: concreteMap,
    color: '#9C9A93',
    roughness: 0.88,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const darkSteel = new THREE.MeshStandardMaterial({
    color: '#2A2E32',
    roughness: 0.62,
    metalness: 0.78,
  });

  const paintedSteel = new THREE.MeshStandardMaterial({
    map: metalMap,
    color: '#B9BEC2',
    roughness: 0.55,
    metalness: 0.55,
  });

  const cladding = new THREE.MeshStandardMaterial({
    map: metalMap,
    color: '#7E858B',
    roughness: 0.6,
    metalness: 0.42,
  });

  const claddingDark = new THREE.MeshStandardMaterial({
    map: metalMap,
    color: '#33383D',
    roughness: 0.72,
    metalness: 0.35,
  });

  const craneOrange = new THREE.MeshStandardMaterial({
    map: metalMap,
    color: '#C25A24',
    roughness: 0.52,
    metalness: 0.45,
  });

  const hazard = new THREE.MeshStandardMaterial({
    color: '#E0A62E',
    roughness: 0.6,
    metalness: 0.2,
  });

  const containers = new THREE.MeshStandardMaterial({
    map: metalMap,
    color: '#ffffff',
    roughness: 0.68,
    metalness: 0.32,
  });

  const foliageDark = new THREE.MeshStandardMaterial({
    color: '#3E5140',
    roughness: 0.92,
    metalness: 0.02,
    flatShading: true,
  });

  const foliageLight = new THREE.MeshStandardMaterial({
    color: '#57694F',
    roughness: 0.9,
    metalness: 0.02,
    flatShading: true,
  });

  const timber = new THREE.MeshStandardMaterial({
    color: '#3D3229',
    roughness: 0.95,
    metalness: 0.02,
  });

  const glass = new THREE.MeshStandardMaterial({
    color: '#0F1A22',
    roughness: 0.12,
    metalness: 0.86,
    envMapIntensity: 1.6,
  });

  const water = new THREE.MeshStandardMaterial({
    color: '#0A141C',
    normalMap: waterNormal,
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 0.14,
    metalness: 0.94,
    envMapIntensity: 2.2,
  });

  const distantTerrain = new THREE.MeshStandardMaterial({
    color: '#6E7566',
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });

  const distantCity = new THREE.MeshStandardMaterial({
    color: '#6C7480',
    roughness: 0.9,
    metalness: 0.1,
  });

  const lampEmissive = new THREE.MeshStandardMaterial({
    color: '#FFE9C4',
    emissive: new THREE.Color('#FFD79A'),
    emissiveIntensity: 1,
    roughness: 0.3,
  });

  const signFace = new THREE.MeshStandardMaterial({
    color: '#1D5C39',
    roughness: 0.45,
    metalness: 0.18,
  });

  const signText = new THREE.MeshStandardMaterial({
    color: '#EDF2F0',
    roughness: 0.4,
    metalness: 0.1,
  });

  const paintLine = new THREE.MeshStandardMaterial({
    color: '#D8D2BE',
    roughness: 0.6,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });

  const vehiclePaint = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.32,
    metalness: 0.35,
  });

  const all = [
    asphalt,
    apron,
    warehouseFloor,
    ground,
    verge,
    galvanised,
    concreteBarrier,
    darkSteel,
    paintedSteel,
    cladding,
    claddingDark,
    craneOrange,
    hazard,
    containers,
    foliageDark,
    foliageLight,
    timber,
    glass,
    water,
    distantTerrain,
    distantCity,
    lampEmissive,
    signFace,
    signText,
    paintLine,
    vehiclePaint,
  ];

  return {
    asphalt,
    apron,
    warehouseFloor,
    ground,
    verge,
    galvanised,
    concreteBarrier,
    darkSteel,
    paintedSteel,
    cladding,
    claddingDark,
    craneOrange,
    hazard,
    containers,
    foliageDark,
    foliageLight,
    timber,
    glass,
    water,
    distantTerrain,
    distantCity,
    lampEmissive,
    signFace,
    signText,
    paintLine,
    vehiclePaint,
    waterNormal,
    dispose() {
      all.forEach((m) => m.dispose());
    },
  };
}

export type EnvironmentMaterials = ReturnType<typeof createEnvironmentMaterials>;

/** Shipping-container livery. Muted, industrial, no cartoon primaries. */
export const CONTAINER_COLORS = [
  '#2E4A63',
  '#8C3A2C',
  '#3D5B4A',
  '#B0763A',
  '#4A4F55',
  '#7A8288',
  '#26343F',
  '#96502F',
];
