# 3D_SITE_AUDIT.md

# 1. PROJECT OVERVIEW

The project is a React-based 3D web application focused on cinematic logistics and transportation storytelling. It heavily utilizes Three.js (via React Three Fiber) to render a continuous, scrolling-driven 3D scene of a heavy-duty commercial truck navigating through various environments (warehouse, highway, port). 

* **Framework:** React 19 (via Vite)
* **Build Tool:** Vite 6.2.3
* **Language:** TypeScript
* **Major Libraries:** `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `gsap`, `lenis`, `motion`
* **Entry Points:** `src/main.tsx` mounts the `App` component (`src/App.tsx`).
* **Overall Architecture:** A single massive scrolling container (`1200vh`) drives the global scroll progress (normalized 0 to 1). The 3D canvas and the UI overlay are sticky and respond to this global `scrollProgress` value.
* **How the application starts:** Run `npm run dev` to start Vite on `0.0.0.0:3000`.
* **How the production build works:** Run `npm run build` to execute `vite build`.

**Project Tree (Important Files):**
```
src/
├── main.tsx
├── App.tsx
├── index.css
├── hooks/
│   └── useScrollProgress.ts
└── components/
    ├── Overlay.tsx
    └── Scene/
        ├── MainCanvas.tsx
        ├── LightingRig.tsx
        ├── CameraController.tsx
        ├── Environment/
        │   ├── EnvironmentMaster.tsx
        │   ├── HighwayRoad.tsx
        │   ├── WarehouseEnvironment.tsx
        │   ├── ShipyardEnvironment.tsx
        │   └── ...
        └── Truck/
            ├── TruckAssembly.tsx
            ├── TractorCab.tsx
            ├── Trailer53ft.tsx
            ├── WheelAssembly.tsx
            └── Materials.ts
```

---

# 2. TECH STACK

| Technology | Version | Purpose | Important Notes |
| ---------- | ------- | ------- | --------------- |
| React | 19.0.1 | UI Framework | Drives the application state and layout |
| Vite | 6.2.3 | Build Tool | Extremely fast HMR and optimized build |
| Three.js | 0.185.1 | 3D Engine | Core WebGL rendering |
| @react-three/fiber | 9.7.0 | React renderer for Three.js | Declarative 3D scene construction |
| @react-three/drei | 10.7.8 | R3F Helpers | Used for `Environment` and `ContactShadows` |
| @react-three/postprocessing| 3.1.1 | Visual Effects | Bloom, Vignette, DepthOfField |
| GSAP | 3.15.0 | Scroll / Animation | `ScrollTrigger` used for global scroll state |
| Lenis | 1.3.26 | Smooth Scrolling | Overrides native browser scroll |
| Motion (Framer) | 12.23.24 | UI Animation | Declarative UI transitions in `Overlay.tsx` |
| Tailwind CSS | 4.1.14 | Styling | Utility-first CSS |

---

# 3. APPLICATION ARCHITECTURE

**Main Application Flow:**
`App.tsx` sets up a `1200vh` scrollable div. It mounts the `MainCanvas` and the `CinematicOverlay`. `useScrollProgress` hooks into Lenis and GSAP's ScrollTrigger to return a normalized `scrollProgress` (0 to 1) and `mouseCoords` (-1 to 1).

**Component Hierarchy:**
*   `App`
    *   `MainCanvas` (React Three Fiber)
        *   `SceneAnimator`
        *   `LightingRig`
        *   `CameraController`
        *   `TruckAssembly`
        *   `EnvironmentMaster`
        *   `EffectComposer`
    *   `CinematicOverlay` (HTML/React UI)

**State Management / Data Flow:**
State is entirely top-down. The `scrollProgress` value originates from `useScrollProgress` in `App.tsx` and is drilled down as a prop to almost every 3D component. There is no global state manager like Zustand or Redux; the application relies entirely on React state and React refs for performance inside `useFrame`.

**Animation Control Flow & 3D Lifecycle:**
Instead of declarative animation timelines (like GSAP timelines inside the canvas), the 3D scene relies entirely on `useFrame` loops reading the `scrollProgress` prop. Calculations for positions, rotations, and physics happen *imperatively* every frame based on mathematical `lerp` functions tied to `scrollProgress`.

**Tightly Coupled Areas:**
`TruckAssembly.tsx` and `EnvironmentMaster.tsx` are tightly coupled to specific hardcoded decimal ranges of `scrollProgress`. Changing the story pacing requires manually recalculating complex `if/else if` ranges in multiple files.

---

# 4. 3D ENGINE / SCENE ARCHITECTURE

**Canvas Configuration:**
*   Shadows enabled
*   DPR: Mobile `[1, 1.5]`, Desktop `[1, 2]`
*   Anti-aliasing: True
*   Power Preference: `high-performance`
*   Tone Mapping: `ACESFilmicToneMapping` with exposure `1.08`
*   Fog: `THREE.FogExp2` (density 0.0068), color interpolates dynamically based on scroll progress.

**Camera:**
*   `PerspectiveCamera` managed entirely by a custom `CameraController` using `useFrame`.
*   Initial setup: `fov: 34`, `near: 0.1`, `far: 320`.

**Lighting:**
*   `LightingRig` utilizes dynamic DirectionalLights and HemisphereLights whose colors and intensities interpolate based on `scrollProgress`.
*   Environment mapping via `@react-three/drei`'s `<Environment preset="city" />`.
*   Contact shadows provided via `@react-three/drei`'s `<ContactShadows />`.

**Materials:**
*   All materials are generated procedurally using standard Three.js materials (`MeshStandardMaterial`, `MeshPhysicalMaterial`). There are NO external texture maps (albedo, normal, roughness) loaded.
*   Centralized in `Materials.ts` to ensure consistency and single-instantiation.

**Models:**
*   There are NO external 3D models (GLTF/GLB). Every single 3D object (Truck, Trailer, Warehouse, Shipyard, Highway) is constructed manually using primitive geometries (`boxGeometry`, `cylinderGeometry`, `sphereGeometry`, `torusGeometry`) composed together in groups.

**Post-Processing:**
*   `@react-three/postprocessing` is used on desktop only.
*   Includes `DepthOfField` (focusDistance: 0.015, focalLength: 0.05), `Bloom` (threshold 1.2, intensity 0.5), and `Vignette`.

**Physics & Animation:**
*   No external physics engine (like Cannon or Rapier). Physics (suspension, acceleration pitch, wheel rotation) are mathematically simulated in `useFrame` based on time (`state.clock.getElapsedTime()`) and calculated speed.

---

# 5. 3D ASSETS

| Asset | Type | Location | Format | Approx Size | Used Where | Notes |
| ----- | ---- | -------- | ------ | ----------- | ---------- | ----- |
| *None* | *None* | *None* | *None* | 0 KB | N/A | The entire scene is constructed from Three.js primitives and procedural materials. No external assets (GLB, HDR, JPG, MP3) are loaded. |

---

# 6. 3D ANIMATION SYSTEM

The animation system relies entirely on `useFrame` interpolations. There are no GSAP timelines inside the 3D scene.

*   **Trigger:** User scrolling (`scrollProgress` 0 -> 1).
*   **Time-driven (Unclamped):** `state.clock.getElapsedTime()` is used for continuous animations that happen regardless of scroll (e.g., suspension bounce, engine vibration, camera shake).
*   **Camera Animations:** `CameraController.tsx` uses a `CatmullRomCurve3` spline. It maps 9 keyframes to `scrollProgress` and smoothly interpolates position, target, and FOV.
*   **Truck Movement:** In `TruckAssembly.tsx`, `scrollProgress` is mapped to target speeds. Current speed lerps to target speed. Distance is calculated by integrating speed over delta time.
*   **Environment Movement:** In `EnvironmentMaster.tsx`, the highway loops infinitely by moving `-Z` based on the truck's calculated speed, resetting when it passes a threshold. Warehouses and the Shipyard are placed absolutely based on `scrollProgress` multiplied by a massive scale factor (`600`).

---

# 7. USER EXPERIENCE / STORY FLOW

1.  **0.00 - 0.15 (ORIGIN):** The truck cab is parked in a warehouse, slightly ahead of the trailer. As the user scrolls, the cab slowly reverses and couples with the trailer.
2.  **0.15 - 0.20 (PREPARATION):** Brief pause as coupling finishes.
3.  **0.20 - 0.30 (DEPARTURE):** Truck accelerates out of the warehouse. Camera drops low.
4.  **0.30 - 0.50 (JOURNEY):** Highway cruising. The environment loops infinitely backward simulating forward movement. Lighting transitions to daylight.
5.  **0.50 - 0.60 (TRANSFER):** Truck slows down and arrives at a second "transfer" warehouse.
6.  **0.60 - 0.70 (TRANSFER PAUSE):** Truck is stationary inside the transfer warehouse.
7.  **0.70 - 0.85 (JOURNEY II):** Truck accelerates out onto the highway again. Lighting transitions to sunset.
8.  **0.85 - 0.95 (DESTINATION):** Truck slows down and enters a massive shipyard at night.
9.  **0.95 - 1.00 (DELIVERY):** Truck comes to a halt at the shipyard. The final UI CTA appears.

---

# 8. SCENE / SECTION INVENTORY

| # | Section / Scene | 3D Objects | Camera | Animation | Trigger | UI | Transition |
| - | --------------- | ---------- | ------ | --------- | ------- | -- | ---------- |
| 1 | Origin | Truck, Warehouse 1 | High Wide -> Low Macro | Cab reverses to trailer | Scroll < 0.15 | "ORIGIN" | Fog color lerps to daylight |
| 2 | Departure | Truck, Highway | Low Tracking | Acceleration | Scroll 0.20-0.30 | None (Silent) | Highway loop begins |
| 3 | Journey 1 | Truck, Highway | Wheel Macro | Constant Speed | Scroll 0.30-0.50 | None (Silent) | N/A |
| 4 | Transfer | Truck, Warehouse 2 | Orbit | Deceleration | Scroll 0.50-0.60 | "TRANSFER" | Fog color lerps to day |
| 5 | Journey 2 | Truck, Highway | Aggressive Front | Acceleration | Scroll 0.70-0.85 | None (Silent) | Fog lerps to sunset |
| 6 | Shipyard | Truck, Shipyard | Massive Crane Pullback | Deceleration | Scroll 0.85-0.95 | "DESTINATION" | Fog lerps to night |
| 7 | Delivery | Truck, Shipyard | Grounded resting | Stopped | Scroll 0.95-1.00 | "DELIVERED" + CTA | End |

---

# 9. CAMERA SYSTEM

*   **Type:** `THREE.PerspectiveCamera`
*   **Controller:** Custom `CameraController` mapping `scrollProgress` to `CatmullRomCurve3` splines.
*   **Movement System:**
    *   Evaluates `pos` and `target` from splines based on `scrollProgress`.
    *   Evaluates `fov` via a Hermite smoothstep between keyframes.
    *   Applies a mouse parallax offset (desktop only).
    *   Applies a high-frequency time-based noise to simulate road vibration/camera shake.
    *   Lerps the final position and lookAt target using delta time to smooth out scroll wheel chunkiness.
*   **Potential Problems:** The camera system is extremely rigid. Adding a new scene or altering pacing requires recalculating the spline knots and updating the `CAMERA_SHOTS` array manually. The mouse parallax and camera shake are added *after* the spline evaluation, which is good, but they are hardcoded math formulas rather than configurable parameters.

---

# 10. VEHICLE / TRUCK PHYSICS AND MOVEMENT

*   **Movement Mechanism:** The truck is mostly stationary on the Z-axis (except for the initial coupling). Forward movement is simulated by moving the *environment* backward (the highway loops).
*   **Wheel Rotation:** Physically calculated (`speed / radius`). Works correctly, even in reverse.
*   **Steering:** A procedural time-based sine wave creates micro-steering (`targetSteer = Math.sin(t * 0.5) * 0.01`). The front wheels articulate on the Y-axis. The cab and trailer yaw slightly to match, giving a "live" feeling.
*   **Suspension:** A complex mix of low-frequency sine waves (bounce) and engine vibration.
*   **Acceleration Pitch:** Calculates instantaneous acceleration and pitches the cab up (squat) or down (dive).
*   **Trailer Articulation:** The trailer pitches and rolls slightly offset from the cab to simulate 5th-wheel joint physics.
*   **Physics Realism:** Visually believable for a commercial, but purely kinematic/procedural. There is no true rigid body physics or path-following.
*   **Risks:** Because movement is simulated by moving the ground, placing absolute landmarks (like warehouses) requires extreme precision to match the truck's simulated speed.

---

# 11. LIGHTING & MATERIAL QUALITY

*   **Lighting Strategy:** Time-of-day simulation via interpolation in `LightingRig.tsx` and `SceneAnimator` (fog).
*   **Light Types:** `DirectionalLight` (Sun/Key, Sky Fill, Rim Light), `HemisphereLight` (Ambient base).
*   **Shadows:** High-resolution shadow maps (2048x2048 on desktop).
*   **Contact Shadows:** Used under the truck to ground it without requiring raytraced ambient occlusion.
*   **Material Quality:** Excellent procedural usage. `MeshPhysicalMaterial` is heavily utilized for clearcoat car paint and refractive window glass. `MeshStandardMaterial` for metals and rubber.
*   **Tone Mapping:** `ACESFilmicToneMapping` with `1.08` exposure gives a cinematic, highly-contrasted look.
*   **Post-Processing:** Bloom adds glow to emissive LEDs, Vignette frames the shots, and Depth of Field (desktop only) focuses the eye.
*   **Overall Look:** Very high quality given that it uses zero external textures, but it lacks the micro-details (scratches, dirt, decals) that require UV unwrapping and texture maps.

---

# 12. VISUAL DESIGN

*   **Color Palette:** Monochromatic UI (White text via `mix-blend-difference` on black/dark backgrounds) allowing the 3D scene colors (orange, chrome, sunset, night) to pop.
*   **Typography:** Editorial, minimal, uppercase. Relies on font weight extremes (Black vs. Light) and aggressive letter-spacing (`tracking-[0.3em]`, `tracking-tighter`).
*   **Layout:** Fixed overlay, UI elements pushed to the absolute edges (padding `p-6 md:p-12`), leaving the center clear for the 3D scene.
*   **UX:** Extremely minimal. Only a scroll indicator, chapter tracker, header navigation, and a final CTA.
*   **Design Language:** "Premium Industrial / Automotive Commercial." It avoids glassmorphism, rounded UI cards, or arbitrary gradients, sticking to raw typography and negative space.

---

# 13. RESPONSIVE DESIGN

*   **Desktop/Laptop:** Full features (Post-processing enabled, mouse parallax enabled, high-res shadows).
*   **Mobile/Tablet:** Detected via `window.innerWidth < 768`.
    *   Post-processing (Bloom, DoF, Vignette) is entirely disabled for performance.
    *   DPR is capped at 1.5.
    *   Shadow maps reduced to 1024x1024.
    *   Mouse parallax is disabled.
    *   Camera FOV/Position is adjusted (`pos.multiplyScalar(1.24)`, `pos.y += 0.5`) to fit the wider 3D subject into a portrait screen aspect ratio.
*   **CSS:** Tailwind responsive prefixes (`md:`) handle UI scaling.

---

# 14. PERFORMANCE AUDIT

*   🔴 **Critical:** The sheer number of primitive geometries used to build the complex truck and environments. Every single wheel lug nut, vent hole, corrugated rib, and structural beam is a separate mesh. This results in massive draw calls.
*   🟠 **High:** Post-processing Depth of Field is extremely expensive. Even on desktop, it may cause frame drops on integrated GPUs.
*   🟡 **Medium:** InstancedMesh should be used for repetitive elements like the warehouse pillars, trailer ribs, and wheel lug nuts to reduce draw calls.
*   🟢 **Low:** React state is well isolated. `useFrame` is used correctly without triggering React re-renders.

---

# 15. CODE QUALITY

*   **Problem:** Massive primitive geometry trees.
    *   **File:** `TruckAssembly.tsx`, `Trailer53ft.tsx`, `WheelAssembly.tsx`, `ShipyardEnvironment.tsx`.
    *   **Why:** Thousands of lines of JSX defining individual `boxGeometry` and `cylinderGeometry`.
    *   **Suggested Direction:** These should absolutely be replaced by optimized GLB models modeled in Blender.
*   **Problem:** Hardcoded timeline logic.
    *   **File:** `TruckAssembly.tsx`, `EnvironmentMaster.tsx`.
    *   **Why:** Huge `if/else if` blocks checking `scrollProgress` ranges make modifying the story pacing a nightmare.
    *   **Suggested Direction:** Use a timeline sequencer or mapping configuration object.
*   **Code Quality Pros:** Excellent use of refs. No React state inside the render loop. Excellent mathematical physics logic for the truck dynamics.

---

# 16. HARD-CODED VALUES

| Value | File | Purpose | Should Become Configurable? |
| ----- | ---- | ------- | --------------------------- |
| `CAMERA_SHOTS` | `CameraController.tsx` | Camera keyframes | Yes, via visual editor or config JSON |
| `scrollProgress` thresholds | `TruckAssembly.tsx` | Truck speed/state phases | Yes, timeline config |
| `SCROLL_DISTANCE_SCALE = 600` | `EnvironmentMaster.tsx` | Maps 0-1 scroll to 3D distance | Yes |
| All Mesh Positions | Almost all files | Procedural modeling | No, they should be replaced by GLB models |

---

# 17. BUG / RISK INVENTORY

### Confirmed Problems
*   **Draw Call Bottleneck:** The procedural generation of the truck and environment creates hundreds/thousands of individual meshes and materials. This is a severe anti-pattern in Three.js and will cause heavy draw call overhead.

### Potential Problems
*   **Timeline Desync:** Because the truck moves forward by moving the ground backward, but landmarks (warehouses) are placed based on absolute `scrollProgress`, any modification to the truck's acceleration curves will cause the truck to visually slide across the warehouse floors.
*   **Mobile Performance:** Even with post-processing disabled, the geometry count might cause older mobile devices to throttle.

---

# 18. LOADING EXPERIENCE

*   **Current State:** Near instant.
*   **Why:** Because there are zero external assets (no textures, no GLBs), the browser only has to download the JS bundle. There is a basic `<Suspense fallback={null}>` wrapper.
*   **Missing:** There is no loading screen. If heavy GLB assets are introduced during a redesign, a proper `useProgress` loader from `@react-three/drei` will be mandatory.

---

# 19. ACCESSIBILITY

*   **Issues:** The entire experience relies on scrolling. There is no fallback for users who cannot scroll. The UI text uses `mix-blend-difference`, which can sometimes result in poor contrast depending on the exact pixel values behind it, violating strict WCAG contrast rules.
*   **Missing:** `<canvas>` lacks ARIA labels describing the 3D scene.

---

# 20. SEO

*   **Issues:** The content is heavily hidden inside JavaScript arrays (`CHAPTERS`).
*   **Missing:** No `next-seo` or standard React Helmet implementation for meta tags, Open Graph, etc. (Since this is a Vite SPA, SEO requires pre-rendering or SSR, which is not present).

---

# 21. BROWSER / DEVICE COMPATIBILITY

*   Requires WebGL 2.0.
*   Will struggle on devices with poor GPU performance due to high geometry count.
*   Safari iOS might struggle with the `1200vh` scroll container combined with Lenis smooth scrolling and `mix-blend-difference`.

---

# 22. DESIGN QUALITY ASSESSMENT

*   Visual quality: 8/10 (Procedural materials are excellent, but lacks texture detail)
*   3D quality: 6/10 (Impressive procedural generation, but terrible practice for production)
*   Animation quality: 9/10 (Kinematics and math are buttery smooth)
*   Realism: 7/10 (Lighting and physics are great, geometry is inevitably a bit blocky)
*   Cinematic quality: 9/10 (Camera splines and framing are excellent)
*   UX: 8/10 (Clean, stays out of the way)
*   Storytelling: 8/10
*   Performance: 4/10 (Draw calls are a major hidden issue)
*   Responsiveness: 7/10 (Basic mobile handling, but could be better)
*   Code quality: 6/10 (Good React patterns, bad 3D composition patterns)

---

# 23. BIGGEST WEAKNESSES

1.  **Procedural Geometry Overload:** Building complex models out of Three.js primitives causes massive draw call overhead and limits visual fidelity. (Severity: Critical) -> Replace with optimized GLB models.
2.  **Hardcoded Timeline Logic:** Complex `if/else` chains tied to decimals make iterating on the story nearly impossible without breaking synchronization. (Severity: High) -> Implement a central timeline state/config.
3.  **Treadmill Synchronization:** Moving the ground backward while trying to align absolute positions for warehouses based on scroll progress is extremely fragile. (Severity: High) -> Move the truck forward through world-space instead of moving the world backward.
4.  **No Textures:** The lack of normal maps, roughness maps, or baked ambient occlusion makes the world feel slightly sterile despite good PBR material settings. (Severity: Medium).
5.  **Lack of Audio:** A cinematic experience relies heavily on sound (engine rumble, air brakes, atmospheric wind), which is entirely missing. (Severity: Medium).

---

# 24. STRONGEST EXISTING PARTS

*   **Camera Spline System:** The `CatmullRomCurve3` implementation with FOV interpolation and road vibration shake is excellent and highly cinematic.
*   **Vehicle Kinematics:** The math for the suspension bounce, acceleration pitch, and physically accurate wheel rotation is top-tier and should be preserved.
*   **Material Definitions:** The procedural PBR material settings (dual clearcoat paint, glass IOR) are expertly tuned.
*   **Scroll Synchronization:** The integration of Lenis and GSAP ScrollTrigger to drive a normalized progress value is rock solid.

---

# 25. PREMIUM REFERENCE DIRECTION

To elevate this to an award-winning premium tier:
*   **Assets:** Replace all primitive constructions with hyper-detailed, baked GLB models (compressing textures via KTX2 and geometry via Draco).
*   **Audio:** Implement the Web Audio API mapped to `scrollProgress`. Engine RPM should rise with calculated acceleration. Air brakes should hiss when speed drops.
*   **World Movement:** Convert the scene to move the truck through real 3D space rather than the "treadmill" effect, allowing for much more organic curving roads and varied environments.
*   **Micro-interactions:** Allow the user to drag the screen to slightly orbit the camera during the "paused" warehouse scenes.

---

# 26. INFORMATION NEEDED FOR A FUTURE REDESIGN

**Known from code:**
*   Target aesthetic (industrial, cinematic, dark/moody, orange accents).
*   Target device constraints (mobile fallbacks exist).

**Unknown / needs decision:**
*   Are there official CAD models or branding guidelines for the truck/trailers?
*   Should the user have interactive control over the truck, or is it strictly a scrolling cinematic?
*   Will there be actual copy/content (services, about us) inserted, or is this purely an experiential hero section?

---

# 27. FILE-BY-FILE IMPORTANT CODE MAP

| File | Responsibility | Important Functions/Components | Importance |
| ---- | -------------- | ------------------------------ | ---------- |
| `hooks/useScrollProgress.ts` | Scroll state generation | `useScrollProgress`, Lenis, GSAP setup | High |
| `components/Scene/MainCanvas.tsx` | R3F Root | `<Canvas>`, `SceneAnimator` | High |
| `components/Scene/CameraController.tsx`| Camera logic | `getCameraState`, spline calculation | High |
| `components/Scene/Truck/TruckAssembly.tsx`| Truck movement logic | `useFrame` for speed, suspension, steer | High |
| `components/Scene/LightingRig.tsx` | Lighting & time of day | `useFrame` color interpolation | Medium |
| `components/Overlay.tsx` | UI Layer | `CHAPTERS`, HTML overlay | Medium |
| `components/Scene/Environment/EnvironmentMaster.tsx` | World layout | Loops highway, places warehouses | Medium |

---

# 28. FINAL TECHNICAL SUMMARY

## Architecture Summary
The application is a scroll-driven cinematic experience. A large HTML container dictates scroll depth, which is intercepted by Lenis and GSAP to provide a smooth, normalized `0` to `1` progress value. This single value is passed down to all 3D components to drive an imperative render loop.

## 3D System Summary
The 3D scene relies completely on procedural generation using Three.js primitives rather than external models. Materials are high-quality procedural PBR. Post-processing provides a cinematic filmic look on desktop.

## Story Flow Summary
The user scrolls through 9 distinct narrative phases: Origin Warehouse (coupling), Departure, Highway Journey (day), Transfer Warehouse (pause), Highway Journey 2 (sunset), Shipyard Destination (night), and Delivery (stop).

## Performance Summary
The biggest concern is draw call overhead due to thousands of uninstanced primitive geometries. Post-processing DoF is also a heavy burden.

## Code Quality Summary
React patterns are clean and avoid unnecessary renders. However, the 3D logic relies on fragile, hardcoded decimal ranges and complex "treadmill" math to fake forward movement, making structural narrative changes very difficult.

## Redesign Constraints
The camera splines and mathematical vehicle physics are excellent and should be preserved and mapped to actual GLB models rather than discarded.

## Recommended Modification Order
1.  Rip out procedural primitive geometries and replace with optimized GLB models.
2.  Refactor the "treadmill" environment to move the truck through actual world space.
3.  Implement a centralized Timeline configuration object to replace hardcoded `if/else` scroll thresholds.
4.  Re-link the existing excellent camera spline logic and vehicle suspension physics to the new models and timeline.
5.  Add ambient and spatial audio.
6.  Enhance the HTML UI layer.
