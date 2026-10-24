# Phase 0 Analysis — Reference Site & Research

## 1. Reference Site Analysis: https://bruno-simon.com/

### Experience Walkthrough
- **Loading**: Custom WebGL canvas loads first; a 3D car appears on a procedural city grid. A "Click to start" overlay appears — clicking unlocks audio (Web Audio / Howler).
- **Driving**: Third-person chase camera following a low-poly Toyota 86. Controls: WASD/Arrows to drive, Space for handbrake, R to reset. Physics feel: arcade-ish with drift.
- **World**: Isometric-ish perspective. City grid with buildings, trees, street furniture. Soft global illumination + baked lighting feel via ambient + directional lights. Fog for depth. Bloom post-processing.
- **Zones**: Floating 3D panels/cards representing portfolio sections. Each zone has a title + icon. Driving near a zone brings up an HTML overlay with content.
- **UI**: DOM overlays on top of canvas. Clicking zones opens detail panels. Top-right minimap showing position in world.
- **Audio**: Engine loop (pitch-shifted by RPM), tire screech on drift, ambient city sounds. All via Howler.js.
- **Easter eggs**: Hidden zones, special car skins, bonus physics behaviors.
- **Mobile**: Touch joystick overlay; reduced physics complexity; simpler geometry.

### Technical Stack (observed/inferred)
- **Three.js** (r152+) for rendering
- **Rapier.js** (or custom arcade physics) for vehicle dynamics — raycast car with wheels
- **Howler.js** for audio
- **GSAP** for UI transitions and camera animations
- **lil-gui** for debug panel (visible when `#debug` hash present)
- **Vite** for bundling (HMR, ES modules)
- **Post-processing**: UnrealBloomPass, vignette, possibly ToneMapping
- **Shadows**: PCFSoft shadow maps from directional light (sun)
- **Geometry**: Mostly procedural — BoxGeometry, CylinderGeometry, InstancedMesh for repeated elements (trees, poles, buildings)
- **No external 3D models loaded** — entirely procedural
- **Asset compression**: Not applicable (no GLB files)
- **Performance**: ~60fps desktop, ~30-40fps mobile. Draw calls kept low via InstancedMesh.

### Architecture Patterns
- Single HTML entry point with canvas
- Vite config for dev server + production build
- Modular TS source: `src/core/`, `src/world/`, `src/vehicle/`, `src/ui/`, `src/audio/`
- Entity-component style: world objects as classes with update loops
- Zone system: trigger volumes in 3D space that show/hide UI panels
- Camera rig: follows car with lerp/damping, speed-reactive FOV

### What to Replicate (Conceptually)
- Drivable car through a 3D world
- Content zones triggered by proximity
- DOM overlay UI on top of Three.js canvas
- Audio feedback (engine, UI clicks)
- Loading screen with progress
- Mobile touch controls
- Minimap
- Day/night toggle

### What to Do Differently
- Procedural geometry instead of any copied assets
- Original art direction (ask user for approval)
- Different vehicle (not a Toyota 86)
- Content populated from real profile data (GitHub + LinkedIn)
- Original code structure and naming

## 2. Open-Source References

### Bruno Simon's Public Repos
- GitHub: https://github.com/BrunoSimon
- Courses: Three.js Journey (paid, but some free content on YouTube)
- Learning approach: procedural generation, learning-by-doing methodology

### Similar Open-Source Projects Found
- [Igor-Polischuk/car-driving-three-js](https://github.com/Igor-Polischuk/car-driving-three-js) — basic Three.js car driving
- Various "three.js portfolio" repos using React Three Fiber

### Key Techniques to Study
- Rapier raycast vehicle setup (wheel joints, engine force, steering)
- Chase camera with spring-damper follow
- Proximity-based zone triggering (distance check or overlap)
- InstancedMesh for repeated world elements
- Post-processing bloom pass

## 3. Performance Targets
- Desktop: 60fps
- Mobile: 30+ fps
- Draw calls: < 100 (use InstancedMesh)
- Triangle count: < 50k total
- Initial load: < 3s on broadband
- Bundle size: < 500KB gzipped
