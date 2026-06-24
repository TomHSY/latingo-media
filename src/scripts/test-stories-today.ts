/**
 * API-only diagnostic for daily story event selection (no Playwright).
 * Run with: npm run test:stories-today
 * Optional: SEARCH="Soleil" npm run test:stories-today
 */
import 'dotenv/config';
import {
  fetchTodayStoryEvents,
  logStoryEventAudit,
  searchEventsByTitle,
} from '../utils/story-events';

function printAuditRow(
  label: string,
  a: {
    event: { id: string; title: string; city?: string | null; start_datetime: string };
    parisDate: string;
    parisTime: string;
    inStrictQuery: boolean;
    isoDateMismatch: boolean;
    included: boolean;
    includeReason: string;
  },
  inStrict: boolean
): void {
  const paddedOnly = !inStrict && a.included;
  const flags: string[] = [];
  if (paddedOnly) flags.push('paddedOnly');
  if (a.isoDateMismatch) flags.push('isoDateMismatch');
  if (a.parisDate === label && !inStrict) flags.push('apiBoundsBug?');
  if (a.includeReason === 'iso_fallback') flags.push('iso-fallback');
  const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';

  console.log(
    `  ${a.included ? '✓' : '✗'} ${a.event.title} (${a.event.city ?? '?'})`
  );
  console.log(
    `    id: ${a.event.id} | start: ${a.event.start_datetime} | Paris: ${a.parisDate} ${a.parisTime}${flagStr}`
  );
}

async function main() {
  const searchPattern = process.env.SEARCH
    ? new RegExp(process.env.SEARCH, 'i')
    : /soleil|antilles/i;

  const result = await fetchTodayStoryEvents({ includeIsoDateFallback: true });

  console.log('📅 Story event diagnostic (Europe/Paris)\n');
  console.log(`  Today: ${result.label}`);
  console.log(`  Strict bounds:  ${result.from} → ${result.to}`);
  console.log(`  Padded bounds:  ${result.paddedFrom} → ${result.paddedTo}\n`);

  const strictIds = new Set(result.strictEvents.map((e) => e.id));
  const paddedOnlyCount = result.paddedEvents.filter((e) => !strictIds.has(e.id)).length;

  console.log(`── All padded-query events (${result.paddedEvents.length}) ──\n`);
  for (const e of result.paddedEvents) {
    const a = result.audit.find((x) => x.event.id === e.id) ??
      result.excluded.find((x) => x.event.id === e.id);
    if (a) printAuditRow(result.label, a, strictIds.has(e.id));
  }

  console.log(`\n── Selected for stories (${result.events.length}) ──\n`);
  if (result.audit.length === 0) {
    console.log('  (none)\n');
  } else {
    result.audit.forEach((a) => logStoryEventAudit(a));
    console.log('');
  }

  if (result.excluded.length > 0) {
    console.log(`── Excluded from padded query (${result.excluded.length}) ──\n`);
    result.excluded.forEach((a) => {
      console.log(`  ✗ ${a.event.title} — Paris ${a.parisDate} ${a.parisTime}`);
    });
    console.log('');
  }

  const weekMatches = await searchEventsByTitle(searchPattern);
  console.log('── Summary ──\n');
  console.log(
    `  Strict: ${result.strictEvents.length} | Padded-only extra: ${paddedOnlyCount} | Selected: ${result.events.length}`
  );

  if (weekMatches.length === 0) {
    console.log(`  Search /${searchPattern.source}/: NOT FOUND in ±3 day scan\n`);
  } else {
    console.log(`  Search /${searchPattern.source}/:`);
    for (const m of weekMatches) {
      const inStrict = strictIds.has(m.event.id);
      const inSelected = result.events.some((e) => e.id === m.event.id);
      const where = inSelected
        ? 'selected'
        : inStrict
          ? 'strict'
          : result.paddedEvents.some((e) => e.id === m.event.id)
            ? 'padded'
            : 'week-only';
      console.log(
        `    FOUND in ${where} — ${m.event.title} | Paris ${m.parisDate} ${m.parisTime} | ${m.event.start_datetime}`
      );
    }
    console.log('');
  }
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
