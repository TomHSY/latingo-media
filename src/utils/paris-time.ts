const PARIS_TZ = 'Europe/Paris';

const dateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PARIS_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  hourCycle: 'h23',
});

/** YYYY-MM-DD in Europe/Paris */
export function getParisDateLabel(reference = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: PARIS_TZ }).format(reference);
}

export interface ParisDateTime {
  weekday: string;
  hour: number;
  dateLabel: string;
}

export function getParisDateTime(reference = new Date()): ParisDateTime {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PARIS_TZ,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reference);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  return {
    weekday: get('weekday'),
    hour: parseInt(get('hour'), 10),
    dateLabel: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

interface ParisLocalParts {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
  s: number;
}

function getParisLocalParts(instant: Date): ParisLocalParts {
  const parts = dateTimeFormatter.formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  let hour = parseInt(get('hour'), 10);
  // Some ICU builds (Linux CI) use 24 for midnight instead of 0
  if (hour === 24) hour = 0;

  return {
    y: parseInt(get('year'), 10),
    m: parseInt(get('month'), 10),
    d: parseInt(get('day'), 10),
    h: hour,
    mi: parseInt(get('minute'), 10),
    s: parseInt(get('second'), 10),
  };
}

function matchesParisLocal(instant: Date, y: number, m: number, d: number, h: number, mi: number, s: number): boolean {
  const p = getParisLocalParts(instant);
  return p.y === y && p.m === m && p.d === d && p.h === h && p.mi === mi && p.s === s;
}

function findUtcForParisLocal(y: number, m: number, d: number, h: number, mi: number, s: number): Date {
  // Search window: Paris midnight can fall on UTC from previous day 22:00 (CEST) to same day 01:00 (CET)
  const searchStart = Date.UTC(y, m - 1, d, 0, 0, 0) - 4 * 3600000;
  const searchEnd = Date.UTC(y, m - 1, d, 23, 59, 59) + 4 * 3600000;

  for (let t = searchStart; t <= searchEnd; t += 1000) {
    if (matchesParisLocal(new Date(t), y, m, d, h, mi, s)) {
      return new Date(t);
    }
  }

  throw new Error(`Could not resolve Paris local time: ${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
}

/** UTC ISO bounds for a calendar day in Europe/Paris */
export function getParisDayBounds(reference = new Date()): { from: string; to: string; label: string } {
  const label = getParisDateLabel(reference);
  const [y, m, d] = label.split('-').map(Number);
  const from = findUtcForParisLocal(y, m, d, 0, 0, 0);

  // End of Paris calendar day = 1ms before next Paris midnight
  const probe = new Date(from.getTime() + 36 * 3600000);
  const nextLabel = getParisDateLabel(probe);
  const [ny, nm, nd] = nextLabel.split('-').map(Number);
  const nextMidnight = findUtcForParisLocal(ny, nm, nd, 0, 0, 0);
  const to = new Date(nextMidnight.getTime() - 1);

  return { from: from.toISOString(), to: to.toISOString(), label };
}
