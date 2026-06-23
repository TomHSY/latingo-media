# Deployment — Instagram automation

Automated publishing: **weekly carousel** (Tuesday 14:00 Europe/Paris) and **daily stories** (every day 12:00 Europe/Paris, one story per event that day).

Orchestration: [GitHub Actions](../.github/workflows/publish-instagram.yml) with Europe/Paris timezone guards.

See also [PRD.md](PRD.md) content calendar and [ARCHITECTURE.md](ARCHITECTURE.md) pipeline overview.

## Prerequisites

- Node.js 20+
- `npm install` and `npx playwright install chromium`
- Copy [`.env.example`](../.env.example) to `.env` at repo root

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
- `OPENAI_API_KEY` — carousel captions

### 4. GitHub repository secrets

Settings → Secrets and variables → Actions. Mirror all `.env` vars:

| Secret | Required |
|--------|----------|
| `ADMIN_EMAIL` | Yes |
| `ADMIN_PASSWORD` | Yes |
| `META_ACCESS_TOKEN` | Yes |
| `INSTAGRAM_USER_ID` | Yes |
| `R2_ACCOUNT_ID` | Yes |
| `R2_ACCESS_KEY_ID` | Yes |
| `R2_SECRET_ACCESS_KEY` | Yes |
| `R2_BUCKET_NAME` | Yes |
| `R2_PUBLIC_URL` | Yes |
| `OPENAI_API_KEY` | Yes |
| `DRY_RUN` | Yes — start with `true`, then `false` after validation |

## Local validation

```bash
# Dry run — render, R2 upload, caption; no Instagram post
DRY_RUN=true npm run publish:real

# One live carousel (weekend digest)
DRY_RUN=false npm run publish:real

# Daily stories — all events today (Paris)
DRY_RUN=true npm run publish:stories-today
DRY_RUN=false npm run publish:stories-today

# Test schedule guards with force override
FORCE_PUBLISH=carousel DRY_RUN=true npm run publish:carousel-if-scheduled
FORCE_PUBLISH=stories DRY_RUN=true npm run publish:stories-if-scheduled
```

Open printed R2 URLs in a browser before going live. Confirm Instagram feed matches rendered PNGs.

## npm scripts

| Script | Purpose |
|--------|---------|
| `publish:real` | Full carousel pipeline (+ optional stories unless `CAROUSEL_ONLY=true`) |
| `publish:stories-today` | One story per event today (Europe/Paris) |
| `publish:carousel-if-scheduled` | Tue 14:00 Paris → carousel only |
| `publish:stories-if-scheduled` | Daily 12:00 Paris → stories |

## GitHub Actions schedule

Workflow runs at **11:00, 12:00, 13:00 UTC** daily. Scripts check **Europe/Paris** before executing:

| Job | Paris time | Guard |
|-----|------------|-------|
| Carousel | Tuesday 14:00 | `shouldRunCarousel()` |
| Stories | Daily 12:00 | `shouldRunStories()` |

Manual trigger: **Actions → Publish Instagram → Run workflow** with job `carousel` or `stories` (sets `FORCE_PUBLISH`).

## Facebook

Instagram Graph API publish does **not** cross-post to a linked Facebook Page. Facebook integration (`FB_PAGE_*` env vars) is deferred for v1.

## Token refresh

Document Meta token expiry date when generated. Refresh `META_ACCESS_TOKEN` in `.env` and GitHub Secrets before expiry.
