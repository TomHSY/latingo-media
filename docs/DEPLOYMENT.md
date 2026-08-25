# Deployment — Instagram automation

Automated publishing: **weekly carousel** (Tuesday 14:00 Europe/Paris) and **daily stories** (every day 12:00 Europe/Paris, one story per event that day). Full Instagram editorial calendar (Wed app/founder, Thu lens rotation, empty Mon/Fri–Sun) lives in [strategy/CONTEXT.md](strategy/CONTEXT.md).

Orchestration: [GitHub Actions](../.github/workflows/publish-instagram.yml) with Europe/Paris timezone guards.

See also [PRD.md](PRD.md) content calendar and [ARCHITECTURE.md](ARCHITECTURE.md) pipeline overview.

## What gets published

| Workflow job | When (automatic) | Content | Instagram output |
|--------------|------------------|---------|------------------|
| **carousel** | Tuesday 14:00 Paris | Weekend digest (Fri–Sun events) | 1 feed carousel post |

Cover slide always shows **Monday–Sunday** of the current Paris calendar week (e.g. `22–28 JUIN`), even though event slides are picked from the weekend only.
| **stories** | Daily 12:00 Paris | All events on **that calendar day** in Paris | 1 story per event (0 if none) |
| **thursday-preview** | Wednesday ~20:00 Paris | Thursday lens render only | 0 Instagram posts — R2 preview URLs in Actions log |
| **thursday** | Manual only (`workflow_dispatch`) | Thursday lens feed post | 1 feed post (carousel or single image) — **founder must trigger after review** |
| **thursday-gallery** | Manual only (`workflow_dispatch`) | All 6 Thursday variants (dry-run) | 0 Instagram posts — artifact ZIP for inspection |

Important distinctions:

- **Carousel** = “Où danser ce week-end?” — top 4 events from the **upcoming Fri–Sun** window (`fetchWeekendEvents`, Paris bounds).
- **Stories** = **today only**, not the whole week. Tuesday stories cover Tuesday events, not Friday/Saturday parties.
- **Thursday preview** = Thu–Sun lens render only (`DRY_RUN=true`). Founder reviews R2 URLs before publish.
- **Thursday publish** = manual `workflow_dispatch` only — never scheduled with auto-publish.
- Scheduled carousel runs with `CAROUSEL_ONLY=true` (no extra preview stories bundled with the carousel job).

All date logic uses **Europe/Paris** in CI and locally ([`src/utils/paris-time.ts`](../src/utils/paris-time.ts), [`src/utils/dates.ts`](../src/utils/dates.ts)).

## Prerequisites

- Node.js 20+
- `npm install` and `npx playwright install chromium`
- Copy [`.env.example`](../.env.example) to `.env` at repo root
- Scripts run via [`scripts/run-tsx.mjs`](../scripts/run-tsx.mjs): `--use-system-ca` on Windows/macOS only; GitHub Actions (Linux) uses the default CA bundle

## Manual setup checklist

Complete these before setting `DRY_RUN=false` in GitHub Secrets.

### 1. Instagram / Meta

1. Convert Instagram to **Professional** (Business or Creator)
2. Link Instagram to a **Facebook Page** in [Meta Business Suite](https://business.facebook.com)
3. [Meta Developers](https://developers.facebook.com) → Create App → **Business**
4. Add product: **Instagram API with Instagram Login**
5. Connect Instagram account in app dashboard
6. Generate **long-lived access token** with scopes:
   - `instagram_basic`
   - `instagram_content_publish`
7. **`INSTAGRAM_USER_ID`**: Graph API Explorer → `GET /me?fields=id,username`
8. **`META_ACCESS_TOKEN`**: long-lived token (refresh before expiry)
9. If publish fails with permission errors, submit **App Review** for `instagram_content_publish` ([ROADMAP.md](strategy/ROADMAP.md))

### 2. Cloudflare R2

Meta fetches images by public URL — R2 is required.

1. Create R2 bucket
2. Create API token (Object Read & Write)
3. Enable **public read** (custom domain recommended for `R2_PUBLIC_URL`)
4. Verify a test JPEG is reachable without auth
5. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

### 3. LatinGo API + OpenAI

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — API read access
- `OPENAI_API_KEY` — carousel captions (required when `DRY_RUN=false` for carousel)

### 4. GitHub repository secrets

Settings → Secrets and variables → Actions:

| Secret | Required | Notes |
|--------|----------|-------|
| `ADMIN_EMAIL` | Yes | |
| `ADMIN_PASSWORD` | Yes | |
| `META_ACCESS_TOKEN` | Yes | Refresh before expiry |
| `INSTAGRAM_USER_ID` | Yes | |
| `R2_ACCOUNT_ID` | Yes | |
| `R2_ACCESS_KEY_ID` | Yes | |
| `R2_SECRET_ACCESS_KEY` | Yes | |
| `R2_BUCKET_NAME` | Yes | |
| `R2_PUBLIC_URL` | Yes | No trailing slash |
| `OPENAI_API_KEY` | Yes | Carousel captions only |
| `DRY_RUN` | Yes | Start with `true`, then `false` after validation |

Not needed for Instagram v1: `FB_PAGE_*`, Google Drive vars.

## Go live (manual activation)

Use this for a first real post **outside** the automatic schedule (e.g. Tuesday 15:00).

1. Confirm dry runs succeeded (R2 URLs in logs, visuals OK).
2. Set GitHub secret **`DRY_RUN`** to `false` (exact string).
3. **Actions → Publish Instagram → Run workflow**:
   - Choose **`carousel`** → posts weekend digest carousel to Instagram.
   - Choose **`stories`** → posts one story per event **today** (Paris). Run separately if needed.
4. Manual runs set `FORCE_PUBLISH` — **schedule guards are bypassed** (you do not need to wait for 14:00 or 12:00).
5. Check Instagram feed / stories after each run.
6. Re-running the same job the same day **posts again** (no deduplication).

### Typical Tuesday first launch

| Step | Workflow job | Result |
|------|--------------|--------|
| 1 | `carousel` | Weekend carousel on feed |
| 2 | `stories` (optional) | Stories for **today’s** events only |

## Local validation

```bash
# Dry run — render + R2; no Instagram (carousel skips caption when DRY_RUN=true)
DRY_RUN=true npm run publish:real

# Live carousel (local — includes preview stories unless CAROUSEL_ONLY=true)
DRY_RUN=false npm run publish:real

# Daily stories — all events today (Paris)
DRY_RUN=true npm run publish:stories-today
DRY_RUN=false npm run publish:stories-today

# API-only diagnostic — which events would be selected (no Playwright)
npm run test:stories-today
SEARCH="Soleil" npm run test:stories-today

# Same entry points as GitHub Actions (with force override)
FORCE_PUBLISH=carousel DRY_RUN=true npm run publish:carousel-if-scheduled
FORCE_PUBLISH=stories DRY_RUN=true npm run publish:stories-if-scheduled
```

Open printed R2 URLs in a browser before going live.

## npm scripts

| Script | Purpose |
|--------|---------|
| `publish:real` | Full carousel pipeline (+ stories unless `CAROUSEL_ONLY=true`) |
| `publish:stories-today` | One story per event today (Europe/Paris) |
| `publish:carousel-if-scheduled` | Tue 14:00 Paris → carousel only |
| `publish:stories-if-scheduled` | Daily 12:00 Paris → stories |
| `render:thursday-preview` | Render Thursday lens PNGs (local / CI preview) |
| `render:thursday-gallery` | Render all 6 Thursday variants + manifest (inspection) |
| `render:thursday-preview-if-scheduled` | Wed ~20:00 Paris → preview render only |
| `publish:thursday-if-approved` | Publish Thursday lens after founder review |
| `test:stories-today` | API-only audit of today's story event selection (no render) |

## GitHub Actions schedule

Workflow runs at **10:00, 11:00, 12:00, 13:00 UTC** daily. Scripts check **Europe/Paris** before executing:

| UTC cron | Paris (CEST summer) | Paris (CET winter) | Runs when guard passes |
|----------|---------------------|--------------------|-------------------------|
| 10:00 | 12:00 | 11:00 | Stories (summer) |
| 11:00 | 13:00 | 12:00 | Stories (winter) |
| 12:00 | 14:00 | 13:00 | Carousel (Tue summer) |
| 13:00 | 15:00 | 14:00 | Carousel (Tue winter) |

| Job | Paris time | Guard |
|-----|------------|-------|
| Carousel | Tuesday 14:00 | `shouldRunCarousel()` |
| Stories | Daily 12:00 | `shouldRunStories()` |
| Thursday preview | Wednesday ~20:00 | `shouldRunThursdayPreview()` |

Extra cron fires exit 0 with a skip message when Paris hour does not match — this is expected.

Manual trigger: **Actions → Publish Instagram → Run workflow** with job `carousel`, `stories`, `thursday-preview`, `thursday`, or `thursday-gallery`.

## Thursday lens (preview + manual publish)

Thursday feed posts are **never auto-published**. The founder must review rendered templates before any publish.

| Step | When | Command / workflow | Instagram |
|------|------|-------------------|-----------|
| 1. Preview render | Wed ~20:00 Paris (scheduled) | `render:thursday-preview-if-scheduled` with `DRY_RUN=true` | None — PNGs uploaded to R2 |
| 2. Founder review | Wed evening / Thu morning | Open R2 URLs printed in GitHub Actions summary | — |
| 3. Publish | Thu (manual) | Actions → Publish Instagram → `job=thursday` | 1 feed post |

**Rules:**

- Scheduled cron for Thursday **only renders preview** — always `DRY_RUN=true`, no Instagram API call.
- **Publish requires manual `workflow_dispatch`** with `job=thursday`. No secret flip, no silent auto-publish.
- Re-validate locally when template code changes: `npm run render:thursday-preview`
- Full editorial spec: [strategy/THURSDAY-LENS.md](strategy/THURSDAY-LENS.md)

```bash
# Local preview (no Instagram)
DRY_RUN=true npm run render:thursday-preview

# Publish after founder review (local)
DRY_RUN=false npm run publish:thursday-if-approved

# Same entry points as GitHub Actions
FORCE_PUBLISH=thursday-preview DRY_RUN=true npm run render:thursday-preview-if-scheduled
FORCE_PUBLISH=thursday DRY_RUN=false npm run publish:thursday-if-approved
```

**Contrast:** Tuesday carousel and daily stories may run fully autonomous once validated. Thursday always keeps human approval until explicitly changed in [DECISIONS.md](strategy/DECISIONS.md).

## Thursday gallery (all variants — dry-run artifact)

Renders **all 6 template variants** from live API data for founder inspection. No Instagram, no R2.

| Step | Action |
|------|--------|
| 1. Trigger | **Actions → Publish Instagram → Run workflow** → job **`thursday-gallery`** |
| 2. Wait | Workflow renders PNGs for dance-spotlight, autres-danses, area-focus, cross-border, weekly-stats, dance-duel |
| 3. Download | Run page → **Artifacts** → `thursday-gallery-{run_id}` (ZIP, 14-day retention) |
| 4. Inspect | Open variant folders + `manifest.json` / `SUMMARY.md` for captions and thin-data warnings |

```bash
# Local equivalent (live API, no upload)
$env:DRY_RUN="true"; $env:THURSDAY_LOCAL_ONLY="true"
npm run render:thursday-gallery
# → output/thursday-gallery/
```

Gallery is **manual-only** — never scheduled.

## CI / Linux notes

GitHub Actions runs on `ubuntu-latest` (UTC). Known fixes applied:

| Issue | Fix |
|-------|-----|
| `node: bad option: --use-system-ca` | [`scripts/run-tsx.mjs`](../scripts/run-tsx.mjs) — flag only on Windows/macOS |
| `Could not resolve Paris local time` (midnight hour `24`) | [`paris-time.ts`](../src/utils/paris-time.ts) — ICU hour normalization |
| Weekend / cover / caption dates used UTC | `getParisWeekendBounds()`, `dates.ts`, captions use `Europe/Paris` |

If `api.latingo.fr` TLS fails on Ubuntu (unlikely), add a `NODE_EXTRA_CA_CERTS` secret pointing to a PEM file.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Workflow exits 0 but nothing posted | `DRY_RUN=true` in secrets, or scheduled run skipped (see next row) |
| Green scheduled run, no stories on Instagram | Logs show `Skipping stories — Paris time is …` — cron missed 12:00 Paris (CEST needs 10 UTC slot) |
| Carousel step skipped on manual run | Wrong workflow input — pick `carousel`, not `stories` |
| OpenAI 403 in local dev | Corporate proxy — captions still work on GitHub Actions |
| Duplicate posts | Re-ran workflow or both manual + scheduled same day |
| Stories for wrong day | Stories always use **today Paris** — not weekend events |
| `9007` / "media is not ready for publishing" | Instagram still processing container — fixed by polling `status_code` until `FINISHED` in `instagram.ts` |
| Story fails with "Media download has failed" / code 9004 | R2 URL contained non-ASCII chars (e.g. accented city) — keys use event UUID only |
| Missing story for an event shown in app | Run `npm run test:stories-today`; check `isoDateMismatch` flag — wrong `start_datetime` UTC vs Paris; ISO fallback may include it on next publish |

## Facebook

Instagram Graph API publish does **not** cross-post to a linked Facebook Page. Facebook integration (`FB_PAGE_*` env vars) is deferred for v1.

## Token refresh

Document Meta token expiry when generated. Refresh `META_ACCESS_TOKEN` in `.env` and GitHub Secrets before expiry.
