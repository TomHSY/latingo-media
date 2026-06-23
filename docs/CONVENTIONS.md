# Conventions

## Design system — Noche

Tokens live in `src/tokens/noche.ts` and `src/tokens/dance-types.ts`.

### Colors

| Token | Hex | Use |
|-------|-----|-------|
| Background | `#1a1a2e` | Deep navy |
| Surface | `#252542` | Card backgrounds |
| Text | `#FFFFFF` | Primary |
| Secondary | `#a0a0b0` | Subtitles |
| Gold/Accent | `#f5c542` | Dates, highlights |
| Coral | `#ff6b6b` | CTAs, counts |

### Dance type colors

| Slug | Accent |
|------|--------|
| salsa | `#ff6b6b` |
| bachata | `#a855f7` |
| kizomba | `#f5c542` |
| zouk | `#2dd4bf` |
| semba | `#f59e0b` |
| west-coast-swing | `#3b82f6` |
| tango | `#e11d48` |

### Typography

- Font: **DM Sans** (Google Fonts)
- Hero: 700 weight, tight letter-spacing
- Body: 400–500 weight

### Logo

- LatinGo wordmark embedded as base64 PNG (relative URLs fail in Playwright `about:blank`)
- Watermark: bottom center, 44px height, 0.7 opacity
- Pin logo (`pin_large.png`) used in Ce Soir stories

## Types

`MediaEvent` in `src/types.ts` mirrors the API `EventOut` shape. Fields used in templates:

- Always: `id`, `title`, `start_datetime`, `city`, `dance_types`
- Often: `image_url`, `rsvp_count`
- Cancellation: `status`, `cancelled_at`, `cancellation_reason`

## Copy

- User-facing text: **French**
- Developer docs and code comments: **English**
- Instagram captions generated in `src/publisher/caption.ts`

## Naming

- Templates: `src/templates/{name}/` with one component per slide/format
- Scripts: `src/scripts/render-{purpose}.ts`, `test-{purpose}.ts`
- Output: `output/{real|test|week-YYYY-MM-DD}/carousel/` and `stories/`
