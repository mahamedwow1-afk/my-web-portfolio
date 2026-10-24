# Credits & References

## Inspiration
- [Bruno Simon's Portfolio](https://bruno-simon.com/) — Concept inspiration for interactive 3D portfolio with drivable vehicle
  - No code, assets, or textures were copied

## Open-Source Libraries Used
| Library | License | Purpose |
|---------|---------|---------|
| Three.js | MIT | 3D rendering |
| @dimforge/rapier3d-compat | Apache 2.0 | Physics engine (vehicle dynamics) |
| GSAP | GSAP License | Animation & transitions |
| Howler.js | MIT | Audio |
| lil-gui | MIT | Debug panel |
| Vite | MIT | Build tool |

## Open-Source References Studied
- [Igor-Polischuk/car-driving-three-js](https://github.com/Igor-Polischuk/car-driving-three-js) — Three.js car driving basics
- [Bruno Simon's Three.js Journey](https://threejs-journey.com/) — Teaching methodology and techniques

## Data Sources
- GitHub API (`api.github.com`) — User profile and repository data
- Profile data manually curated in `src/data/profile.ts`

## Assets
All 3D assets (buildings, trees, car, terrain) are **procedurally generated** using Three.js primitives. No external model files are used.

Sound effects are generated programmatically via Web Audio API (oscillators for engine, noise buffers for tire screech).
