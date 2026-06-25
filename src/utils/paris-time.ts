const PARIS_TZ = 'Europe/Paris';

export { PARIS_TZ };

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

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

/**
 * Parse a naive ISO datetime string (no Z or offset) as Paris local time.
 * e.g. "2026-06-24T22:00:00" → 22:00 Paris regardless of system timezone.
 */
export function parseAsParisLocal(isoString: string): Date {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) throw new Error(`Invalid datetime format: ${isoString}`);
  const [, y, m, d, h, mi, s] = match.map(Number);
  return findUtcForParisLocal(y, m, d, h, mi, s);
}

/** Parse API start_datetime — naive strings are Paris local; Z/offset strings are absolute UTC. */
export function parseEventStartDatetime(isoString: string): Date {
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(isoString.trim())) {
    return new Date(isoString);
  }
  return parseAsParisLocal(isoString);
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

/** 0 = Sunday … 6 = Saturday in Europe/Paris */
export function getParisWeekdayIndex(reference = new Date()): number {
  return WEEKDAY_INDEX[getParisDateTime(reference).weekday] ?? 0;
}

function addParisCalendarDays(label: string, deltaDays: number): string {
  const [y, m, d] = label.split('-').map(Number);
  const anchor = findUtcForParisLocal(y, m, d, 12, 0, 0);
  return getParisDateLabel(new Date(anchor.getTime() + deltaDays * 86400000));
}

/** Friday 00:00 → Sunday 23:59:59.999 Europe/Paris as UTC ISO strings */
export function getParisWeekendBounds(reference = new Date()): { from: string; to: string } {
  const todayLabel = getParisDateLabel(reference);
  const day = getParisWeekdayIndex(reference);

  let fridayLabel: string;
  if (day <= 4) {
    fridayLabel = addParisCalendarDays(todayLabel, 5 - day);
  } else if (day === 5) {
    fridayLabel = todayLabel;
  } else if (day === 6) {
    fridayLabel = addParisCalendarDays(todayLabel, -1);
  } else {
    fridayLabel = addParisCalendarDays(todayLabel, -2);
  }

  const sundayLabel = addParisCalendarDays(fridayLabel, 2);
  const [fy, fm, fd] = fridayLabel.split('-').map(Number);
  const [sy, sm, sd] = sundayLabel.split('-').map(Number);

  const from = findUtcForParisLocal(fy, fm, fd, 0, 0, 0);
  const sundayNoon = findUtcForParisLocal(sy, sm, sd, 12, 0, 0);
  const { to } = getParisDayBounds(sundayNoon);

  return { from: from.toISOString(), to: to };
}

export interface ParisCalendarWeekCover {
  startDay: number;
  endDay: number;
  monthNameUpper: string;
  /** Noon Paris on Monday / Sunday — for captions */
  monday: Date;
  sunday: Date;
}

/**
 * Cover slide range: Monday–Sunday of the calendar week containing reference (Paris).
 * Event selection may still use Fri–Sun only; the cover shows the full week (e.g. 22–28).
 */
export function getParisCalendarWeekCover(reference = new Date()): ParisCalendarWeekCover {
  const todayLabel = getParisDateLabel(reference);
  const day = getParisWeekdayIndex(reference);
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const mondayLabel = addParisCalendarDays(todayLabel, -daysSinceMonday);
  const sundayLabel = addParisCalendarDays(mondayLabel, 6);

  const [my, mm, md] = mondayLabel.split('-').map(Number);
  const [sy, sm, sd] = sundayLabel.split('-').map(Number);

  const monday = findUtcForParisLocal(my, mm, md, 12, 0, 0);
  const sunday = findUtcForParisLocal(sy, sm, sd, 12, 0, 0);

  const monthNameUpper = new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS_TZ,
    month: 'long',
  })
    .format(sunday)
    .toUpperCase();

  return {
    startDay: md,
    endDay: sd,
    monthNameUpper,
    monday,
    sunday,
  };
}
