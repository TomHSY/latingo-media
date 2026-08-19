# Architecture

## Repo layout

This repository contains two independent subprojects:

| Path | Purpose | Stack |
|------|---------|-------|
| `src/` | Media engine — render social PNGs from API data | React SSR + Playwright + Node |
| `landing/` | Marketing site (app download funnel) | React + Vite + Tailwind |

See [LANDING.md](LANDING.md) for the landing subproject.

## Media engine stack

- **Language:** TypeScript
- **Rendering:** React SSR (`renderToStaticMarkup`) → HTML → Playwright screenshot → PNG
- **Runtime:** Node.js with `--use-system-ca` (TLS for api.latingo.fr)
- **Orchestration:** n8n (future); currently manual via npm scripts

## Render pipeline

```
API fetch → activeEventsOnly (carousels only) → select events → React SSR → HTML
  → Playwright page.setContent → screenshot → PNG in output/
```

Story scripts may include cancelled events; `EventStory` applies visual "ANNULÉE" styling.

## Event selection (carousel)

1. Fetch events for date range
2. Filter to active only (`status !== 'cancelled'`)
3. Score and rank candidates with RSVP/views/popularity plus diversity bonuses
4. Apply recurring down-rank heuristic (no hard exclusion without API metadata)
5. Select top 4 with **city diversity** and **dance diversity** bonuses
6. Closing slide: total active events minus 4

Story publication remains image-only with current Instagram Graph API integration. Clickable link stickers are deferred until official API support is available.

## Image handling

- Source aspect ratios vary: 746×1600, 800×800, 800×450, etc.
- Fixed height container (820px), `object-fit: cover`, `object-position: center top`
- Fallback: branded gradient when `image_url` is null

## Project structure

```
latingo-media-engine/
├── src/
│   ├── tokens/              # noche.ts, dance-types.ts
│   ├── components/          # DanceTypePill, EventImage, layouts/
│   ├── templates/
│   │   ├── weekly-digest/   # Cover, EventSlide, ClosingSlide
│   │   └── ce-soir/         # EventStory
│   ├── renderer/            # render.ts (Playwright)
│   ├── api/                 # client.ts — auth, fetch, activeEventsOnly
│   ├── publisher/           # Instagram, Facebook, Drive, R2 upload, captions
│   ├── scripts/             # render-real, render-week, publish-real, test-api, …
│   ├── mock/                # Fake events for offline render
│   ├── utils/               # dates.ts (French formatting)
│   ├── server/              # preview.ts (Express :3456)
│   └── types.ts             # MediaEvent, MediaFormat, DIMENSIONS
├── landing/                 # Marketing site (separate package.json)
├── assets/                  # icon-text.png (logo)
├── output/                  # Generated PNGs (gitignored)
├── docs/
├── AGENTS.md
├── .env                     # API credentials (gitignored)
└── package.json
```

## Key scripts

| Script | File | Purpose |
|--------|------|---------|
| `render:real` | `render-real.ts` | Weekend carousel + stories from live API |
| `render:week` | `render-week.ts` | Week-scoped carousel; optional Drive upload |
| `publish:real` | `publish-real.ts` | Render → R2 upload → Instagram/Facebook |
| `render:test` | `test-render.ts` | Offline render from mock data |
| `test:api` | `test-api.ts` | API diagnostic + image analysis |
| `preview` | `preview.ts` | Local preview server |

Additional one-off scripts: `render-week-stories.ts`, `render-story-d.ts`, `rerender-sbrk.ts`, `upload-drive.ts`.

## Publishing pipeline

`src/publisher/` handles post-render delivery:

- `upload.ts` — R2/S3 image hosting for Meta APIs
- `instagram.ts` — Instagram Graph API carousel/story publish
- `facebook.ts` — Facebook album publish
- `gdrive.ts` — Google Drive upload (used by `render:week --upload`)
- `caption.ts` — French carousel caption generation
