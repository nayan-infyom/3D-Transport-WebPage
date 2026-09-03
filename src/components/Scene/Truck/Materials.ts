import * as THREE from 'three';

/**
 * High-End PBR Material Definitions for Northline Commercial Truck & Trailer
 * Uses MeshPhysicalMaterial for multi-layered clearcoat automotive paint,
 * authentic chrome reflections, refractive glass, and realistic rubber.
 */
export function createTruckMaterials() {
  // 1. Premium Pearl Ivory / Warm White Automotive Paint with Dual Clearcoat
  const cabPaint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F0EBE1'),
    metalness: 0.1,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 1.0,
    ior: 1.5,
    envMapIntensity: 2.0,
  });

  // 2. Industrial Signature Orange Accent
  const orangeAccent = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#E56B2F'),
    metalness: 0.2,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.5,
  });

  // 3. Obsidian Matte Aerodynamic Fairings & Chassis Structural Steel
  const darkChassis = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#111315'),
    metalness: 0.6,
    roughness: 0.7,
    envMapIntensity: 0.5,
  });

  // 4. Polished Mirror Chrome (Grille, Exhaust Stacks, Mirrors, Rim Hubs, Fuel Tanks)
  const mirrorChrome = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFFFFF'),
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 2.5,
  });

  // 5. Brushed Aluminum (Trailer Frame, Step Plates, Diamond Plate Catwalk)
  const brushedAluminum = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C8D0D8'),
    metalness: 0.85,
    roughness: 0.35,
    envMapIntensity: 1.2,
  });

  // 6. 53ft Trailer Wall - Architectural White Coated Aluminum
  const trailerWall = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F2F0EB'),
    metalness: 0.1,
    roughness: 0.4,
    envMapIntensity: 0.8,
  });

  // 7. Trailer Corrugated Aluminum Ribs
  const trailerRib = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E8E6E0'),
    metalness: 0.3,
    roughness: 0.3,
    envMapIntensity: 1.0,
  });

  // 8. Heavy Duty Commercial Tire Rubber with Low Reflectivity
  const tireRubber = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0F1113'),
    roughness: 0.95,
    metalness: 0.02,
    envMapIntensity: 0.2,
  });

  // 9. Steel Wheel Rim (Gloss Silver Industrial Coating)
  const wheelRim = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#D0D4D8'),
    metalness: 0.8,
    roughness: 0.15,
    envMapIntensity: 1.5,
  });

  // 10. Disc Brake Rotor & Caliper
  const brakeDisc = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#555A5F'),
    metalness: 0.9,
    roughness: 0.4,
    envMapIntensity: 1.0,
  });

  // 11. Refractive Windshield & Aerodynamic Window Glass
  const windowGlass = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0A1118'),
    metalness: 0.1,
    roughness: 0.0,
    transmission: 0.95,
    ior: 1.52,
    thickness: 0.5,
    transparent: true,
    opacity: 1.0,
    envMapIntensity: 2.5,
  });

  // 12. Interior Cabin Charcoal Molded Trim
  const interiorTrim = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1A1C1E'),
    roughness: 0.9,
    metalness: 0.1,
  });

  // 13. LED Headlight Projector Core (Daylight White)
  const headlightLed = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFFFFF'),
    emissive: new THREE.Color('#FFFFFF'),
    emissiveIntensity: 5.0,
    roughness: 0.1,
  });

  // 14. Amber Clearance & Cab Roof Marker LED
  const amberLed = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFAA00'),
    emissive: new THREE.Color('#FF8800'),
    emissiveIntensity: 4.0,
    roughness: 0.1,
  });

  // 15. Rear Trailer Safety Taillight LED (Vibrant Crimson)
  const tailLightRed = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FF0000'),
    emissive: new THREE.Color('#FF0000'),
    emissiveIntensity: 4.0,
    roughness: 0.1,
  });

  // 16. DOT-C2 Red & White Retro-Reflective Safety Conspicuity Tape
  const dotTapeRed = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#B01010'),
    metalness: 0.2,
    roughness: 0.2,
    envMapIntensity: 1.0,
  });
  const dotTapeWhite = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E0E0E0'),
    metalness: 0.3,
    roughness: 0.15,
    envMapIntensity: 1.0,
  });

  return {
    cabPaint,
    orangeAccent,
    darkChassis,
    mirrorChrome,
    brushedAluminum,
    trailerWall,
    trailerRib,
    tireRubber,
    wheelRim,
    brakeDisc,
    windowGlass,
    interiorTrim,
    headlightLed,
    amberLed,
    tailLightRed,
    dotTapeRed,
    dotTapeWhite,
  };
}
