/**
 * French date formatting utilities.
 * All media content is rendered in French, in Europe/Paris time.
 */
import { PARIS_TZ, getParisWeekdayIndex } from './paris-time';

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function parisParts(date: Date, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS_TZ, ...options }).formatToParts(date);
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((p) => p.type === type)?.value ?? '';
}

/**
 * "Samedi 30 mai"
 */
export function formatDateFrench(date: Date): string {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return capitalize(formatted);
}

/**
 * "20h30"
 */
export function formatTimeFrench(date: Date): string {
  const parts = parisParts(date, { hour: 'numeric', minute: '2-digit', hour12: false });
  const h = parseInt(part(parts, 'hour'), 10);
  const m = parseInt(part(parts, 'minute'), 10);
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`;
}

/**
 * "20h30 → 23h00"
 */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTimeFrench(start)} → ${formatTimeFrench(end)}`;
}

/**
 * "Vendredi 29 → Dimanche 31 mai"
 */
export function formatDateRange(start: Date, end: Date): string {
  const startDay = capitalize(DAYS[getParisWeekdayIndex(start)]);
  const endDay = capitalize(DAYS[getParisWeekdayIndex(end)]);
  const startNum = parseInt(part(parisParts(start, { day: 'numeric' }), 'day'), 10);
  const endNum = parseInt(part(parisParts(end, { day: 'numeric' }), 'day'), 10);
  const endMonth = part(parisParts(end, { month: 'long' }), 'month');
  const startMonth = part(parisParts(start, { month: 'long' }), 'month');

  if (startMonth === endMonth) {
    return `${startDay} ${startNum} → ${endDay} ${endNum} ${endMonth}`;
  }
  return `${startDay} ${startNum} ${startMonth} → ${endDay} ${endNum} ${endMonth}`;
}

/**
 * Returns the short day name: "Ven.", "Sam.", "Dim."
 */
export function shortDay(date: Date): string {
  const shorts = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  return shorts[getParisWeekdayIndex(date)];
}

/**
 * Returns the full day name capitalized: "Samedi"
 */
export function fullDay(date: Date): string {
  return capitalize(DAYS[getParisWeekdayIndex(date)]);
}

/** Cover slide: day number + month name in uppercase (Paris) */
export function getParisCoverParts(date: Date): { day: number; monthNameUpper: string } {
  const parts = parisParts(date, { day: 'numeric', month: 'long' });
  return {
    day: parseInt(part(parts, 'day'), 10),
    monthNameUpper: part(parts, 'month').toUpperCase(),
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
