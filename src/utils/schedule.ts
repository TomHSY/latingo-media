import { getParisDateTime } from './paris-time';

/** Tuesday 12:00–18:00 Europe/Paris — weekly carousel (window tolerates GitHub cron delays) */
export function shouldRunCarousel(reference = new Date()): boolean {
  const { weekday, hour } = getParisDateTime(reference);
  return weekday === 'Tue' && hour >= 12 && hour <= 18;
}

/** Daily 10:00–18:00 Europe/Paris — event stories (window tolerates GitHub cron delays) */
export function shouldRunStories(reference = new Date()): boolean {
  const { hour } = getParisDateTime(reference);
  return hour >= 10 && hour <= 18;
}

/** Wednesday 18:00–22:00 Europe/Paris — Thursday lens preview render only */
export function shouldRunThursdayPreview(reference = new Date()): boolean {
  const { weekday, hour } = getParisDateTime(reference);
  return weekday === 'Wed' && hour >= 18 && hour <= 22;
}

/** Thursday 10:00–18:00 Europe/Paris — manual publish window guard (optional local check) */
export function shouldRunThursdayPublish(reference = new Date()): boolean {
  const { weekday, hour } = getParisDateTime(reference);
  return weekday === 'Thu' && hour >= 10 && hour <= 18;
}
