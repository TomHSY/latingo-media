# Landing Page

Public marketing site for LatinGo. Converts local SBK dancers into app downloads and captures iOS waitlist signups. Lives in `landing/` — separate from the media engine (`src/`).

## Purpose

Single-page funnel: explain the problem, show features, display live event previews, build trust, drive Play Store downloads, collect iOS waitlist signups, recruit organizers. Deployed at **www.latingo.fr**.

Brand voice aligns with [strategy/CONTEXT.md](strategy/CONTEXT.md). Instagram carousel CTAs link to app stores or this site.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS 3 (custom dark theme tokens)
- French copy throughout
- DM Sans (Google Fonts)

## Page structure

`landing/src/App.tsx` composes:

Navbar → Hero → Problem → Features → Screenshots → EventsPreview → LocalProof → Download → IOSWaitlist → Organizers → FAQ → Footer

## Dynamic event data

Event stats and preview cards are fetched from `api.latingo.fr` at build time:

- Script: `landing/scripts/fetch-events.ts`
- Output: `landing/src/data/events.json` (committed; refreshed on deploy)
- Fallback: `landing/src/data/events.fallback.json` if fetch fails locally

**Refresh schedule:**

- Every push to `main` (via `deploy-landing.yml`)
- Daily at 8am Paris (via `refresh-landing.yml`)

Requires GitHub secrets: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (same service account as media engine).

## Commands

Run from `landing/`:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local dev server |
| `npm run fetch-events` | Refresh `events.json` from API |
| `npm run build` | Fetch events + production build → `landing/dist/` |
| `npm run build:site` | Build only (skip fetch) |
| `npm run preview` | Preview production build |

Root `package.json` scripts do **not** cover the landing site.

## Deploy

GitHub Actions workflows:

- `.github/workflows/deploy-landing.yml` — push to `main`
- `.github/workflows/refresh-landing.yml` — daily cron + manual trigger

Both fetch events, build `landing/`, deploy `landing/dist/` to GitHub Pages. Custom domain: `landing/public/CNAME` → `www.latingo.fr`.

## iOS waitlist form

`IOSWaitlist.tsx` submits to **Formspree** (`formspree.io`) — no backend in this repo. Fields: prénom, email, ville, commentaires (optional).

## External links

| Link | URL |
|------|-----|
| Google Play | `https://play.google.com/store/apps/details?id=fr.latingo.app` |
| Instagram | `https://www.instagram.com/latingo.fr/` |
| Facebook | `https://www.facebook.com/profile.php?id=61590203503679` |
| Contact | `contact@latingo.fr` |

## Design tokens

Tailwind config in `landing/tailwind.config.js`:

| Token | Hex |
|-------|-----|
| background | `#0F0F14` |
| surface | `#1C1C24` |
| coral | `#FF4E3A` |
| gold | `#FFB830` |
| primary-text | `#F5F0EA` |
| secondary-text | `#9B97A3` |

Similar palette to media engine Noche theme but independently configured.

## Assets

Images in `landing/public/images/`. App screenshots sourced from repo `pictures/Screenshot_*.jpg`.

## Relationship to media engine

| | Media engine (`src/`) | Landing (`landing/`) |
|--|----------------------|---------------------|
| Build | Root `package.json` | `landing/package.json` |
| Output | PNG files in `output/` | Static HTML in `landing/dist/` |
| API | Reads api.latingo.fr | Formspree + build-time events fetch |
| Deploy | Manual / GitHub Actions | GitHub Pages auto |
