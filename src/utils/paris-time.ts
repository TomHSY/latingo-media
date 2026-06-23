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

function findUtcForParisLocal(y: number, m: number, d: number, h: number, mi: number, s: number): Date {
  const target = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const base = Date.UTC(y, m - 1, d, h - 2, mi, s);
  for (let offset = -4 * 3600000; offset <= 4 * 3600000; offset += 60000) {
    const candidate = new Date(base + offset);
    const parts = dateTimeFormatter.formatToParts(candidate);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const local = `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
    if (local === target) return candidate;
  }

  throw new Error(`Could not resolve Paris local time: ${target}`);
}

/** UTC ISO bounds for a calendar day in Europe/Paris */
export function getParisDayBounds(reference = new Date()): { from: string; to: string; label: string } {
  const label = getParisDateLabel(reference);
  const [y, m, d] = label.split('-').map(Number);
  const from = findUtcForParisLocal(y, m, d, 0, 0, 0);
  const to = findUtcForParisLocal(y, m, d, 23, 59, 59);
  return { from: from.toISOString(), to: to.toISOString(), label };
}
