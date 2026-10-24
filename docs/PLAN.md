# Phase 2 Plan — 3D Interactive Portfolio

## Project Overview
**Name**: My Web Portfolio (working title)
**User**: Mahamed Yasser — Python Developer & Video Editor
**GitHub**: https://github.com/mahamedwow1-afk
**Location**: Qalyubia, Egypt
**Style**: Drivable 3D world, original content, inspired by bruno-simon.com concept

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Build | Vite + TypeScript |
| 3D | Three.js r160+ |
| Physics | @dimforge/rapier3d-compat (RaycastVehicle) |
| Animations | GSAP 3 |
| Audio | Howler.js 2 |
| Debug UI | lil-gui |
| Styling | Plain CSS + CSS Variables |
| Data | Typed JSON from GitHub API + manual profile |

## Folder Structure
```
D:/Project/My Web/
├── docs/
│   ├── ANALYSIS.md          # Phase 0 analysis (already written)
│   ├── PLAN.md              # This file
│   └── TROUBLESHOOTING.md   # Bug log
├── scripts/
│   ├── fetch-github.mjs     # GitHub API data fetcher
│   └── parse-linkedin.mjs   # LinkedIn data parser (if export provided)
├── src/
│   ├── core/
│   │   ├── engine.ts        # Three.js renderer setup
│   │   ├── loop.ts          # Animation frame loop
│   │   └── resize.ts        # Canvas resize handler
│   ├── world/
│   │   ├── ground.ts        # Ground plane + grid
│   │   ├── buildings.ts     # Procedural city buildings
│   │   ├── nature.ts        # Trees, grass, particles
│   │   ├── lighting.ts      # Ambient + directional + fog
│   │   └── postprocessing.ts # Bloom, vignette
│   ├── vehicle/
│   │   ├── car.ts           # RaycastVehicle setup
│   │   ├── controls.ts      # Keyboard + gamepad + touch
│   │   └── camera.ts        # Chase camera with damping
│   ├── zones/
│   │   ├── manager.ts       # Zone trigger system
│   │   ├── about.ts         # About me zone
│   │   ├── projects.ts      # Projects zone (GitHub data)
│   │   ├── experience.ts    # Experience timeline
│   │   ├── skills.ts        # Skills as physical objects
│   │   ├── education.ts     # Education & certs
│   │   └── contact.ts       # Contact zone
│   ├── ui/
│   │   ├── overlay.ts       # Main DOM overlay manager
│   │   ├── loading.ts       # Loading screen
│   │   ├── minimap.ts       # Minimap component
│   │   └── modal.ts         # Zone detail modal
│   ├── data/
│   │   ├── profile.ts       # Single source of truth (typed)
│   │   └── github.json      # Fetched GitHub data
│   └── audio/
│       ├── engine.ts        # Engine sound (WebAudio oscillators)
│       └── sfx.ts           # UI click SFX
├── index.html               # Entry point
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
├── CREDITS.md
└── README.md
```

## Data Sources
| Source | Method | Fallback |
|--------|--------|----------|
| GitHub Profile | REST API (`/users/mahamedwow1-afk`) | Hardcoded fallback in `src/data/profile.ts` |
| GitHub Repos | REST API (`/users/mahamedwow1-afk/repos`) | Same fallback |
| LinkedIn | Manual JSON (`data/profile.manual.json`) | Hardcoded fallback |
| Personal Info | Filled into `src/data/profile.ts` | Already populated from GitHub |

### Current Profile Data (from GitHub)
- **Name**: Mahamed Yasser
- **Title**: Python Developer & Video Editor
- **Bio**: "Python Developer & Video Editor | Passionate about building automation tools and creating visual stories."
- **Location**: Qalyubia, Egypt
- **GitHub**: https://github.com/mahamedwow1-afk
- **Public Repos**: 5 (mahamedwow1-afk, media-organizer-pro, platform, my-first-app, Smart-File-Organizer)
- **Email**: To be provided (GitHub API doesn't expose without `user` scope)
- **LinkedIn**: To be provided

## Art Direction Questions (need approval)
1. **Visual style**: Realistic low-poly, cel-shaded, or neon/cyberpunk?
2. **Color palette**: Warm earth tones, cool blues/teals, or something else?
3. **Vehicle type**: Sports car, off-road rover, futuristic hover vehicle, or something else?
4. **World theme**: City streets, open landscape, abstract geometric, or something else?
5. **Time of day**: Default day, day/night toggle, or sunset golden hour?

## Milestones
1. **M1**: Project scaffold (Vite + TS + Three.js + Rapier) — `npm install` + dev server works
2. **M2**: Basic world (ground + buildings + lighting + fog) — renderable scene
3. **M3**: Vehicle + physics + controls — can drive around
4. **M4**: Chase camera + minimap — proper camera follow
5. **M5**: Zone system + UI overlays — click/drive to zones, show content
6. **M6**: Data integration (GitHub repos as zone content)
7. **M7**: Audio (engine + SFX)
8. **M8**: Polish (particles, bloom, loading screen, mobile controls)
9. **M9**: Classic view (accessible HTML fallback)
10. **M10**: Deployment + Lighthouse

## What You'll Personalize
- Profile data (email, LinkedIn URL, bio refinements)
- Art direction choices (style, colors, vehicle type)
- Zone content text and order
- Any additional projects you want featured
- CV/resume PDF for download

## Next Step
Waiting for your approval on:
1. The folder structure and tech stack
2. The art direction questions above
3. Any missing personal data you want to provide now

Once approved, I'll proceed to Phase 1 (data collection) and then Phase 2 (build).
