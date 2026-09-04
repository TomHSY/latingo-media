# LatinGo Instagram cron worker

Reliable schedule trigger for GitHub Actions Instagram pipelines. Replaces GitHub's best-effort `schedule` cron.

## What it triggers (Europe/Paris)

| Event type | When | GitHub workflow |
|------------|------|-----------------|
| `stories-daily` | Mon–Fri **17:00**, Sat–Sun **12:00** | Publish Stories Daily |
| `instagram-carousel` | Tuesday **18:00** | Publish Instagram (carousel step) |

Thursday lens is **archived** from cron (manual via Actions when you resume).

## One-time setup

### 1. GitHub fine-grained PAT

GitHub → Settings → Developer settings → Fine-grained tokens:

- Repository: `latingo-media`
- Permissions: **Actions** → Read and write, **Metadata** → Read

### 2. GitHub repository secret

Repo → Settings → Secrets → Actions → add:

| Secret | Value |
|--------|-------|
| `DISPATCH_SECRET` | Random string (e.g. `openssl rand -hex 32`) — same value goes in Worker |

### 3. Deploy worker

```bash
cd workers/instagram-cron
npm install
npx wrangler login
npx wrangler secret put GITHUB_TOKEN    # paste PAT
npx wrangler secret put DISPATCH_SECRET # same as GitHub secret
npm run deploy
```

### 4. Verify

```bash
curl https://latingo-instagram-cron.<your-subdomain>.workers.dev/
# → JSON with current Paris time and jobs_due_now

# Manual trigger (e.g. test stories workflow):
curl -X POST https://latingo-instagram-cron.<subdomain>.workers.dev/trigger \
  -H "Authorization: Bearer YOUR_DISPATCH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"stories-daily"}'
```

Check **Actions** tab — a run should start within seconds.

## Local dev

```bash
npm run dev
# POST http://localhost:8787/trigger with secrets in .dev.vars (see .dev.vars.example)
```

Create `.dev.vars` (gitignored):

```
GITHUB_TOKEN=ghp_...
DISPATCH_SECRET=...
GITHUB_REPO=TomHSY/latingo-media
```
