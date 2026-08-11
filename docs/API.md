# LatinGo API — Media Engine Consumer Contract

**Source of truth in main repo:** [latingo-app](https://github.com/goepa/latingo-app) — `backend/app/schemas.py` (`EventOut`), `backend/app/routers/events.py` (`list_events`).

When the main repo changes the events API, update this file and `src/types.ts`.

## Base URL

- Production: `https://api.latingo.fr`
- Local dev: `http://localhost:19005`

## Auth

Media engine uses a dedicated service account (`ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`).

```
POST /auth/login
Content-Type: application/json

{ "email": "...", "password": "..." }

→ 200 { "access_token": "...", "refresh_token": "..." }
```

- Use `Authorization: Bearer {access_token}` on subsequent requests.
- Access token: 60 min. Refresh: 30 days via `POST /auth/refresh` with `{ "refresh_token" }`.
- For batch renders, login once per run; refresh if a request returns 401.

**Node.js TLS:** npm scripts use `tsx --use-system-ca` so Node trusts the production cert.

## Events (read-only)

```
GET /events?date_from={ISO8601}&date_to={ISO8601}&sort_by=date_asc
Authorization: Bearer {token}
```

| Param | Type | Notes |
|-------|------|-------|
| `date_from` | datetime | Filter `start_datetime >= date_from` |
| `date_to` | datetime | Filter `start_datetime <= date_to` |
| `city` | string | Partial match on city name |
| `dance_types` | string | Comma-separated slugs, e.g. `salsa,bachata` |
| `sort_by` | string | `date_asc` (default), `date_desc`, `newest`, `popularity` |
| `include_past` | bool | Default false — past events hidden unless set |

**Not needed for media engine:** geo filters, RSVP, cancel/reinstate, alerts, admin routes.

## EventOut response shape

```json
{
  "id": "uuid-string",
  "title": "Soirée Salsa",
  "description": "...",
  "start_datetime": "2026-06-27T20:00:00Z",
  "end_datetime": "2026-06-28T02:00:00Z",
  "latitude": 43.493,
  "longitude": -1.474,
  "address": "12 rue ...",
  "city": "Bayonne",
  "dance_types": [
    { "id": "uuid", "slug": "salsa", "label_fr": "Salsa", "is_active": true }
  ],
  "website_url": "https://...",
  "ticket_url": "https://...",
  "image_url": "https://pub-....r2.dev/events/{uuid}.jpg",
  "source_url": "https://facebook.com/events/...",
  "rsvp_count": 12,
  "view_count": 340,
  "is_popular": false,
  "created_at": "2026-06-01T10:00:00Z",
  "status": "active",
  "cancelled_at": null,
  "cancellation_reason": null
}
```

When cancelled:

```json
{
  "status": "cancelled",
  "cancelled_at": "2026-06-25T14:30:00Z",
  "cancellation_reason": "Reporté"
}
```

## Event cancellation

Shipped in main app (June 2026). Organizers/admins soft-cancel events; they stay in the DB but are marked cancelled.

**API behavior:**

- `GET /events` **includes** cancelled events — there is **no** `status=` filter.
- Cancelled events are **deprioritized**: active events first, cancelled at the **end** of the list.
- `GET /events/{id}` returns cancelled events normally (with status fields).

**Media engine rules:**

1. **Carousels / weekly digest:** exclude cancelled events before RSVP sort and city-diversity selection. Closing slide count uses active events only.
2. **Stories:** include cancelled events with an "ANNULÉE" visual mark (and `cancellation_reason` when present). Users need to know when a soirée is off.
3. **Future:** dedicated "Soirée annulée" story template for previously featured events — see [strategy/ROADMAP.md](strategy/ROADMAP.md).

Recurring events:

- API currently does not expose recurring flags/series metadata.
- Weekly carousel therefore uses a best-effort recurring down-rank heuristic (title/source/time patterns) instead of strict exclusion.
- Strict recurring exclusion requires upstream API model changes in `latingo-app`.

**Endpoints you do NOT call:** `POST /events/{id}/cancel`, `POST /events/{id}/reinstate`, `DELETE /events/{id}`.

## TypeScript types

In `src/types.ts`:

```typescript
export interface MediaEvent {
  // ...existing fields...
  status?: 'active' | 'cancelled';  // defaults to active when absent
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
}
```

Helpers in `src/api/client.ts`:

```typescript
fetchWeekendEvents()        // Fri–Sun window in Europe/Paris → date_from / date_to
activeEventsOnly(events)    // for carousel selection
cancelledEventsOnly(events) // for cancelled story renders
```

Apply `activeEventsOnly()` in carousel scripts **before** sorting by RSVP / city diversity. Do **not** filter inside `fetchEvents` — story scripts need all events.

## Images

- Prefer `image_url` from API (Cloudflare R2).
- Fallback R2 pattern: `https://pub-0a74468ba5af4a029f562126cdb5944f.r2.dev/events/{eventId}.jpg`
- Mobile app uses a Cloudflare Worker proxy for Facebook CDN; media engine can use R2 URLs directly.
