/**
 * French date formatting utilities.
 * All media content is rendered in French.
 */

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/**
 * "Samedi 30 mai"
 */
export function formatDateFrench(date: Date): string {
  const day = DAYS[date.getDay()];
  const num = date.getDate();
  const month = MONTHS[date.getMonth()];
  return `${capitalize(day)} ${num} ${month}`;
}

/**
 * "20h30"
 */
export function formatTimeFrench(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
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
  const startDay = capitalize(DAYS[start.getDay()]);
  const endDay = capitalize(DAYS[end.getDay()]);
  const startNum = start.getDate();
  const endNum = end.getDate();
  const month = MONTHS[end.getMonth()];

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} ${startNum} → ${endDay} ${endNum} ${month}`;
  }
  const startMonth = MONTHS[start.getMonth()];
  return `${startDay} ${startNum} ${startMonth} → ${endDay} ${endNum} ${month}`;
}

/**
 * Returns the short day name: "Ven.", "Sam.", "Dim."
 */
export function shortDay(date: Date): string {
  const shorts = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  return shorts[date.getDay()];
}

/**
 * Returns the full day name capitalized: "Samedi"
 */
export function fullDay(date: Date): string {
  return capitalize(DAYS[date.getDay()]);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
