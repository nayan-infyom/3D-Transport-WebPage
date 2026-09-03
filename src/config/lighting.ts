import type { LightingKey } from './timeline';

/**
 * Cinematic lighting states.
 *
 * These describe a whole *look*, not just a light colour: key light, bounce,
 * sky gradient, fog, exposure, star field and how hard the in-world practical
 * fixtures burn. Blending between two of these moves the entire time of day.
 */
export interface LightingState {
  /** Key light (sun / moon / gantry array). */
  sunColor: string;
  sunIntensity: number;
  /** Direction the key light sits in, relative to the truck. Metres. */
  sunOffset: [number, number, number];

  /** Sky bounce. */
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;

  ambientColor: string;
  ambientIntensity: number;

  fogColor: string;
  fogDensity: number;

  /** Procedural sky dome. */
  skyZenith: string;
  skyHorizon: string;
  skyGlow: string;
  glowFalloff: number;
  starOpacity: number;

  /** Renderer / image. */
  exposure: number;
  envIntensity: number;

  /** Multiplier for in-world practical fixtures (warehouse, port floods). */
  practicals: number;
  /** Vehicle lamps: headlights, markers, tail lights. */
  vehicleLights: number;
}

export const LIGHTING_STATES: Record<LightingKey, LightingState> = {
  /* Cold, cavernous, top-lit. Deep shadow between the pools of light. */
  warehouse: {
    sunColor: '#9FB4C4',
    sunIntensity: 0.55,
    sunOffset: [-40, 46, 60],
    hemiSky: '#4A5A66',
    hemiGround: '#14181B',
    hemiIntensity: 0.45,
    ambientColor: '#2A343C',
    ambientIntensity: 0.35,
    fogColor: '#12171B',
    fogDensity: 0.011,
    skyZenith: '#0C1114',
    skyHorizon: '#1B242A',
    skyGlow: '#33424C',
    glowFalloff: 12,
    starOpacity: 0,
    exposure: 1.02,
    envIntensity: 0.28,
    practicals: 1.0,
    vehicleLights: 1.0,
  },

  /* Big open daylight. High sun, clean sky, long clear air. */
  day: {
    sunColor: '#FFF4E2',
    sunIntensity: 3.1,
    sunOffset: [-90, 110, 70],
    hemiSky: '#BFDCF2',
    hemiGround: '#B4A991',
    hemiIntensity: 0.85,
    ambientColor: '#C9D9E6',
    ambientIntensity: 0.32,
    fogColor: '#CBD9E2',
    fogDensity: 0.0022,
    skyZenith: '#2E6EA8',
    skyHorizon: '#CFE1EC',
    skyGlow: '#FFF6E4',
    glowFalloff: 40,
    starOpacity: 0,
    exposure: 1.0,
    envIntensity: 1.0,
    practicals: 0.0,
    vehicleLights: 0.15,
  },

  /* Under the transfer canopy: neutral, flat, sodium-tinted fill. */
  industrial: {
    sunColor: '#EDE6D8',
    sunIntensity: 1.5,
    sunOffset: [-70, 90, 30],
    hemiSky: '#9FB0BC',
    hemiGround: '#6B6558',
    hemiIntensity: 0.7,
    ambientColor: '#9AA6AE',
    ambientIntensity: 0.4,
    fogColor: '#AEB8BE',
    fogDensity: 0.0045,
    skyZenith: '#4E7FA6',
    skyHorizon: '#C2CFD8',
    skyGlow: '#F4EFE2',
    glowFalloff: 34,
    starOpacity: 0,
    exposure: 1.0,
    envIntensity: 0.85,
    practicals: 0.7,
    vehicleLights: 0.5,
  },

  /* Low warm key, long shadows, cool shadow side. */
  sunset: {
    sunColor: '#FF9A4D',
    sunIntensity: 2.6,
    sunOffset: [-140, 26, -60],
    hemiSky: '#F0A268',
    hemiGround: '#3A2A22',
    hemiIntensity: 0.65,
    ambientColor: '#6B5A62',
    ambientIntensity: 0.32,
    fogColor: '#D79561',
    fogDensity: 0.0042,
    skyZenith: '#1E3A66',
    skyHorizon: '#F0A05A',
    skyGlow: '#FFD9A0',
    glowFalloff: 9,
    starOpacity: 0.05,
    exposure: 1.02,
    envIntensity: 0.85,
    practicals: 0.35,
    vehicleLights: 0.85,
  },

  /* The blue half-hour after the sun goes. */
  dusk: {
    sunColor: '#5E7CA8',
    sunIntensity: 0.9,
    sunOffset: [-130, 16, -80],
    hemiSky: '#3C5878',
    hemiGround: '#1B1F24',
    hemiIntensity: 0.5,
    ambientColor: '#2E3E52',
    ambientIntensity: 0.34,
    fogColor: '#3A4C63',
    fogDensity: 0.0055,
    skyZenith: '#0E1A31',
    skyHorizon: '#5D6E88',
    skyGlow: '#C08F70',
    glowFalloff: 7,
    starOpacity: 0.45,
    exposure: 1.05,
    envIntensity: 0.5,
    practicals: 0.85,
    vehicleLights: 1.0,
  },

  /* Full night. The port is lit entirely by its own machinery. */
  night: {
    sunColor: '#4C6684',
    sunIntensity: 0.34,
    sunOffset: [-100, 70, -110],
    hemiSky: '#16233A',
    hemiGround: '#080A0D',
    hemiIntensity: 0.34,
    ambientColor: '#141E2C',
    ambientIntensity: 0.3,
    fogColor: '#0B131C',
    fogDensity: 0.0072,
    skyZenith: '#03060C',
    skyHorizon: '#101E2E',
    skyGlow: '#22364C',
    glowFalloff: 16,
    starOpacity: 1,
    exposure: 1.16,
    envIntensity: 0.28,
    practicals: 1.0,
    vehicleLights: 1.0,
  },
};
