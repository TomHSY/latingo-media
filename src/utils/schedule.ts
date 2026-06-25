import { getParisDateTime } from './paris-time';

/** Tuesday 14:00 Europe/Paris — weekly carousel */
export function shouldRunCarousel(reference = new Date()): boolean {
  const { weekday, hour } = getParisDateTime(reference);
  return weekday === 'Tue' && hour === 14;
}

/** Daily 10:00–18:00 Europe/Paris — event stories (window tolerates GitHub cron delays) */
export function shouldRunStories(reference = new Date()): boolean {
  const { hour } = getParisDateTime(reference);
  return hour >= 10 && hour <= 18;
}
