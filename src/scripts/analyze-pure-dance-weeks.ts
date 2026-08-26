/**
 * Scan past Thu–Sun windows: count pure core-dance events per week.
 * Run with: node scripts/run-tsx.mjs src/scripts/analyze-pure-dance-weeks.ts
 */
import 'dotenv/config';
import { writeFileSync } from 'fs';
import { activeEventsOnly, fetchEvents } from '../api/client';
import type { MediaEvent } from '../types';
import { getParisDateLabel } from '../utils/paris-time';

const CORE_DANCES = ['salsa', 'bachata', 'kizomba'] as const;
const RARE_DANCES = ['zouk', 'semba', 'west-coast-swing', 'tango-argentin'] as const;
const MIN_PURE_CARDS = 3;

function addDaysLabel(label: string, delta: number): string {
  const [y, m, d] = label.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

function weekdayIndex(label: string): number {
  const [y, m, d] = label.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function getDanceSlugs(event: MediaEvent): Set<string> {
  return new Set((event.dance_types || []).map((t) => t.slug));
}

function isPureCoreEvent(event: MediaEvent, slug: string): boolean {
  const slugs = getDanceSlugs(event);
  return slugs.size === 1 && slugs.has(slug);
}

/** API naive datetimes are Paris wall-clock — date prefix is the Paris calendar day. */
function thursdayWindowKey(event: MediaEvent): string | null {
  const label = event.start_datetime.slice(0, 10);
  const day = weekdayIndex(label);
  if (day === 0) return addDaysLabel(label, -3);
  if (day >= 4) return addDaysLabel(label, 4 - day);
  return null;
}

async function main() {
  console.log('🔗 Fetching events (Apr–Sep 2026, include_past)...\n');
  const raw = await fetchEvents({
    date_from: '2026-04-01T00:00:00.000Z',
    date_to: '2026-09-30T23:59:59.000Z',
    sort_by: 'date_asc',
    include_past: true,
  });

  const events = activeEventsOnly(raw);
  console.log(`  ${raw.length} fetched → ${events.length} active events\n`);

  const byWindow = new Map<string, MediaEvent[]>();
  for (const event of events) {
    const key = thursdayWindowKey(event);
    if (!key) continue;
    const list = byWindow.get(key) ?? [];
    list.push(event);
    byWindow.set(key, list);
  }

  const sortedKeys = [...byWindow.keys()].sort();
  const today = getParisDateLabel(new Date());

  const lines: string[] = [
    'Pure core-dance events per Thu–Sun window (single-tag salsa/bachata/kizomba only)',
    '',
    'Thu–Sun window │ salsa │ bachata │ kizomba │ best      │ ≥3? │ note',
    '─'.repeat(78),
  ];

  let weeksWithAnyCore3 = 0;
  let weeksBelow = 0;

  for (const thu of sortedKeys) {
    const pool = byWindow.get(thu)!;
    const counts = Object.fromEntries(
      CORE_DANCES.map((d) => [d, pool.filter((e) => isPureCoreEvent(e, d)).length])
    ) as Record<(typeof CORE_DANCES)[number], number>;

    const best = Math.max(...CORE_DANCES.map((d) => counts[d]));
    const bestDance = CORE_DANCES.find((d) => counts[d] === best)!;
    const meetsMin = best >= MIN_PURE_CARDS;
    if (meetsMin) weeksWithAnyCore3++;
    else weeksBelow++;

    const sun = addDaysLabel(thu, 3);
    const marker = thu <= today && sun >= today ? ' ← this week' : thu > today ? ' (upcoming)' : '';

    const rarePure = pool.filter((e) => {
      const slugs = getDanceSlugs(e);
      return slugs.size === 1 && RARE_DANCES.some((d) => slugs.has(d));
    }).length;

    let note = meetsMin ? `spotlight: ${bestDance}` : '→ autres/skip';
    if (!meetsMin && rarePure >= MIN_PURE_CARDS) {
      note = `→ autres (${rarePure} rare pure)`;
    }

    lines.push(
      `${thu}–${sun.slice(5).padEnd(5)} │ ${String(counts.salsa).padStart(5)} │ ${String(counts.bachata).padStart(7)} │ ${String(counts.kizomba).padStart(7)} │ ${`${bestDance}(${best})`.padStart(9)} │ ${(meetsMin ? 'yes' : 'no').padStart(3)} │ ${note}${marker}`
    );
  }

  lines.push('');
  lines.push('Summary');
  lines.push(`  Data range: Apr–Sep 2026 (${events.length} active events)`);
  lines.push(`  Thu–Sun windows: ${sortedKeys.length}`);
  lines.push(`  Weeks with ≥${MIN_PURE_CARDS} pure core: ${weeksWithAnyCore3} (${Math.round((weeksWithAnyCore3 / sortedKeys.length) * 100)}%)`);
  lines.push(`  Weeks below minimum: ${weeksBelow}`);

  const report = lines.join('\n');
  console.log(report);
  writeFileSync('tmp/pure-dance-weeks.txt', report + '\n');
}

main().catch((err) => {
  console.error('❌ Analysis failed:', err);
  process.exit(1);
});
