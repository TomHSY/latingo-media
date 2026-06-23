# Remaining code changes (Phase 2.5)

Documentation migration is complete. These TypeScript changes are documented in [API.md](API.md) but not yet applied in `src/`.

## 1. `src/types.ts`

Add to `MediaEvent`:

```typescript
status?: 'active' | 'cancelled';
cancelled_at?: string | null;
cancellation_reason?: string | null;
```

## 2. `src/api/client.ts`

```typescript
export function activeEventsOnly(events: MediaEvent[]): MediaEvent[] {
  return events.filter((e) => (e.status ?? 'active') !== 'cancelled');
}

export function cancelledEventsOnly(events: MediaEvent[]): MediaEvent[] {
  return events.filter((e) => e.status === 'cancelled');
}
```

## 3. Carousel scripts — filter before selection

Import `activeEventsOnly` and apply after fetch in:

- `src/scripts/render-real.ts`
- `src/scripts/render-week.ts`
- `src/scripts/publish-real.ts`
- `src/scripts/test-render.ts` (use `activeEventsOnly(MOCK_EVENTS)`)

Use active count for closing slide `remaining`.

## 4. `src/scripts/render-real.ts` — cancelled stories

After active carousel stories, render one story per cancelled weekend event to `output/real/stories/cancelled-{id}.png`.

## 5. `src/templates/ce-soir/index.ts`

When `event.status === 'cancelled'`:

- Show "ANNULÉE" instead of "CE SOIR"
- Dim backdrop (`brightness(0.2)`, higher overlay opacity)
- Show `cancellation_reason` when present
- Strikethrough on title

## 6. `src/mock/events.ts`

Add `status: 'active'` to existing events. Add one cancelled event with high `rsvp_count` to verify carousel exclusion.

## 7. `src/scripts/test-api.ts`

Log `status`, `cancelled_at`, and summary counts (active vs cancelled).

## 8. `prompt.txt`

Replace with pointer to `AGENTS.md` + `docs/` (blocked in plan mode — apply manually or switch to agent mode).
