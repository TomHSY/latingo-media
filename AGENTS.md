# LatinGo Media Engine — Agent Instructions

Generates Instagram/social PNG assets from LatinGo event data. Separate repo from the main `latingo-app` monorepo. Also contains the marketing landing page under `landing/` (Play + App Store funnel at www.latingo.fr).

## Stack

TypeScript, React SSR (`renderToStaticMarkup`), Playwright screenshots, Node.js.

## Setup

```bash
npm install
cp .env.example .env   # fill in secrets — see docs/DEPLOYMENT.md
npx playwright install chromium
```

## Commands (media engine — root)

| Script | Purpose |
|--------|---------|
| `npm run render:real` | Carousel + stories from live API |
| `npm run render:week [date] [--upload]` | Week-scoped render + optional Drive upload |
| `npm run publish:real` | Render → R2 → Instagram carousel (+ stories unless scheduled) |
| `npm run publish:stories-today` | One story per event today (Europe/Paris); resumes via R2 manifest |
| `npm run seed:stories-manifest` | Seed manifest for partial-run recovery |
| `npm run publish:carousel-if-scheduled` | Tue 14:00 Paris → carousel only (GitHub Actions) |
| `npm run publish:stories-if-scheduled` | Daily 12:00 Paris → stories (GitHub Actions) |
| `npm run render:thursday-preview` | Thursday lens preview (local, DRY_RUN) |
| `npm run render:thursday-gallery` | All 6 Thursday variants for template inspection |
| `npm run publish:thursday-if-approved` | Publish Thursday lens after founder review |
| `npm run render:test` | Mock-data render |
| `npm run test:api` | API diagnostic |
| `npm run preview` | Preview server at localhost:3456 |
| `npm run typecheck` | TypeScript check |

TLS for `api.latingo.fr`: npm scripts use [`scripts/run-tsx.mjs`](scripts/run-tsx.mjs) — adds `tsx --use-system-ca` on Windows/macOS only; Linux CI uses default CAs.

## Landing page (`landing/`)

Separate npm project — see [docs/LANDING.md](docs/LANDING.md).

```bash
cd landing && npm install && npm run dev
```

Deployed to GitHub Pages at `www.latingo.fr` on push to `main`.

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Instagram automation setup + GitHub Actions |
| [docs/PRD.md](docs/PRD.md) | Templates, Instagram rules, shipped/planned |
| [docs/API.md](docs/API.md) | LatinGo API consumer contract — update when main repo API changes |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Render pipeline, project layout |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | Noche tokens, component patterns |
| [docs/LANDING.md](docs/LANDING.md) | Marketing site subproject |
| [docs/strategy/](docs/strategy/) | Brand voice, decisions, roadmap, [THURSDAY-LENS.md](docs/strategy/THURSDAY-LENS.md) |

## Scope rules

- Read-only API consumer — no writes except auth login.
- **Carousels:** exclude cancelled events (`status !== 'cancelled'`) before selection.
- **Stories:** include cancelled events with visual "ANNULÉE" mark so users are informed.
- Instagram shows teasers only — no full address, ticket links, or full descriptions.
- User-facing copy in French; developer communication in English.
