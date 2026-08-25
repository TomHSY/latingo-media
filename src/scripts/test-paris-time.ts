/**
 * Regression: naive API datetimes must render as Paris local time even when process TZ=UTC.
 * Run with: TZ=UTC npm run test:paris-time
 */
import { formatDateFrench, formatTimeFrench } from '../utils/dates';
import { parseEventStartDatetime } from '../utils/paris-time';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

interface Case {
  name: string;
  iso: string;
  date: string;
  time: string;
}

const cases: Case[] = [
  {
    name: 'Tardeo Zona Limite',
    iso: '2026-08-15T23:00:00',
    date: 'Samedi 15 août',
    time: '23h',
  },
  {
    name: 'Soirée Baskiz',
    iso: '2026-08-15T18:00:00',
    date: 'Samedi 15 août',
    time: '18h',
  },
  {
    name: 'Kulunka',
    iso: '2026-08-14T18:30:00',
    date: 'Vendredi 14 août',
    time: '18h30',
  },
  {
    name: 'Domingo Café Irun',
    iso: '2026-08-16T18:00:00',
    date: 'Dimanche 16 août',
    time: '18h',
  },
  {
    name: 'SBK Beach Anaïak',
    iso: '2026-08-16T19:30:00',
    date: 'Dimanche 16 août',
    time: '19h30',
  },
];

console.log(`test:paris-time (process TZ=${process.env.TZ ?? 'system default'})\n`);

for (const { name, iso, date, time } of cases) {
  const parsed = parseEventStartDatetime(iso);
  const gotDate = formatDateFrench(parsed);
  const gotTime = formatTimeFrench(parsed);
  assert(gotDate === date, `${name}: expected date "${date}", got "${gotDate}"`);
  assert(gotTime === time, `${name}: expected time "${time}", got "${gotTime}"`);
  console.log(`  ✓ ${name}`);
}

// Carousel and story paths must agree when both use parseEventStartDatetime.
const tardeoIso = '2026-08-15T23:00:00';
const carousel = parseEventStartDatetime(tardeoIso);
const story = parseEventStartDatetime(tardeoIso);
assert(
  formatDateFrench(carousel) === formatDateFrench(story),
  'carousel and story dates must match'
);
assert(
  formatTimeFrench(carousel) === formatTimeFrench(story),
  'carousel and story times must match'
);
console.log('  ✓ carousel/story parity');

// Under UTC, raw new Date(naive) is the old bug — guard against reintroducing it in templates.
if (process.env.TZ === 'UTC') {
  const naive = new Date(tardeoIso);
  assert(
    formatTimeFrench(naive) !== '23h',
    'sanity: naive new Date under UTC must not already equal correct Paris time'
  );
  assert(
    formatDateFrench(parseEventStartDatetime(tardeoIso)) === 'Samedi 15 août',
    'Tardeo must stay Saturday 23h Paris, not roll to Sunday 1h'
  );
  console.log('  ✓ UTC runner regression guard');
}

console.log('\nAll paris-time tests passed.');
