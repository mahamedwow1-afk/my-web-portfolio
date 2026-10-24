# My Web Portfolio

Interactive 3D portfolio website — drive a hover car around a stylized world to discover content zones.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Accelerate |
| S / ↓ | Brake / Reverse |
| A / ← | Turn left |
| D / → | Turn right |
| Space | Handbrake |
| Shift | Boost |
| R | Reset car |

Mobile: on-screen joystick appears automatically.

## i18n (Languages)

- **English** (default)
- **العربية** (RTL support)

Toggle language in the top bar. Browser language is detected automatically on first visit.

To add a new language:
1. Create `src/i18n/locales/<code>.json` with all keys from `en.json`
2. Import and register it in `src/i18n/index.ts`
3. Done — no other code changes needed

## Data

- GitHub data: `scripts/fetch-github.mjs` — pulls from GitHub API, saves to `src/data/github.json`
- Profile data: `src/data/profile.ts` — single source of truth, edit directly
- Required env: `GITHUB_TOKEN` (optional, for higher rate limits)

## Build & Deploy

```bash
npm run build       # Production build → dist/
npm run preview     # Preview build locally
npm run deploy      # Deploy to Cloudflare Workers
```

## Custom Domain (Cloudflare)

1. Buy a domain from any registrar (Namecheap, Cloudflare Registrar, etc.)
2. In Cloudflare Dashboard → add your domain
3. Set nameservers to Cloudflare's (you'll get 2 NS records)
4. In Cloudflare → Workers & Pages → your worker → Custom Domains → add your domain
5. Wait for DNS propagation (usually minutes)
6. Your site will be live at `https://yourdomain.com`

## Project Structure

```
src/
  core/        — Three.js engine, animation loop
  world/       — Ground, buildings, nature, lighting
  vehicle/     — Hover car, physics, controls
  zones/       — Content zones (About, Projects, Skills...)
  ui/          — DOM overlays, HUD, minimap
  data/        — Profile data (single source of truth)
  i18n/        — Language files (en.json, ar.json)
  audio/       — Engine sound, SFX
```

## Development

```bash
npm run dev          # Start dev server (HMR enabled)
npx tsc --noEmit     # Type check
npm run build        # Production build
```

## Tech Stack

- Vite + TypeScript
- Three.js (r170+)
- Rapier.js (physics, planned)
- GSAP (animations)
- Howler.js (audio)
- lil-gui (debug panel)

## License

Private portfolio — not open source.
