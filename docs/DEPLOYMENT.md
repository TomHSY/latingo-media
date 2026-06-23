# Deployment — Instagram automation

Automated publishing: **weekly carousel** (Tuesday 14:00 Europe/Paris) and **daily stories** (every day 12:00 Europe/Paris, one story per event that day).

Orchestration: [GitHub Actions](../.github/workflows/publish-instagram.yml) with Europe/Paris timezone guards.

See also [PRD.md](PRD.md) content calendar and [ARCHITECTURE.md](ARCHITECTURE.md) pipeline overview.

## What gets published

| Workflow job | When (automatic) | Content | Instagram output |
|--------------|------------------|---------|------------------|
| **carousel** | Tuesday 14:00 Paris | Weekend digest (Fri–Sun events) | 1 feed carousel post |

Cover slide always shows **Monday–Sunday** of the current Paris calendar week (e.g. `22–28 JUIN`), even though event slides are picked from the weekend only.
| **stories** | Daily 12:00 Paris | All events on **that calendar day** in Paris | 1 story per event (0 if none) |

Important distinctions:

- **Carousel** = “Où danser ce week-end?” — top 4 events from the **upcoming Fri–Sun** window (`fetchWeekendEvents`, Paris bounds).
- **Stories** = **today only**, not the whole week. Tuesday stories cover Tuesday events, not Friday/Saturday parties.
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

## GitHub Actions schedule

Workflow runs at **11:00, 12:00, 13:00 UTC** daily. Scripts check **Europe/Paris** before executing:

| Job | Paris time | Guard |
|-----|------------|-------|
| Carousel | Tuesday 14:00 | `shouldRunCarousel()` |
| Stories | Daily 12:00 | `shouldRunStories()` |

Manual trigger: **Actions → Publish Instagram → Run workflow** with job `carousel` or `stories`.

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
| Workflow exits 0 but nothing posted | `DRY_RUN=true` in secrets |
| Carousel step skipped on manual run | Wrong workflow input — pick `carousel`, not `stories` |
| Stories skipped on schedule | Not 12:00 Paris at cron fire — use manual `stories` run |
| OpenAI 403 in local dev | Corporate proxy — captions still work on GitHub Actions |
| Duplicate posts | Re-ran workflow or both manual + scheduled same day |
| Stories for wrong day | Stories always use **today Paris** — not weekend events |
| `9007` / "media is not ready for publishing" | Instagram still processing container — fixed by polling `status_code` until `FINISHED` in `instagram.ts` |

## Facebook

Instagram Graph API publish does **not** cross-post to a linked Facebook Page. Facebook integration (`FB_PAGE_*` env vars) is deferred for v1.

## Token refresh

Document Meta token expiry when generated. Refresh `META_ACCESS_TOKEN` in `.env` and GitHub Secrets before expiry.
