import { getParisDateTime } from './paris-time';

/** Tuesday 14:00 Europe/Paris — weekly carousel */
export function shouldRunCarousel(reference = new Date()): boolean {
  const { weekday, hour } = getParisDateTime(reference);
  return weekday === 'Tue' && hour === 14;
}

/** Daily 12:00 Europe/Paris — event stories */
export function shouldRunStories(reference = new Date()): boolean {
  const { hour } = getParisDateTime(reference);
  return hour === 12;
}
