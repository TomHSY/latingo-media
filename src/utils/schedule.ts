import { getParisDateTime } from './paris-time';

/** Tuesday 16:00–20:00 Europe/Paris — weekly carousel (target 18:00; window tolerates delays) */
export function shouldRunCarousel(reference = new Date()): boolean {
  const { weekday, hour } = getParisDateTime(reference);
  return weekday === 'Tue' && hour >= 16 && hour <= 20;
}

/** Stories window: weekdays 16:00–19:00 (target 17:00), weekend 10:00–14:00 (target 12:00) */
export function shouldRunStories(reference = new Date()): boolean {
  const { weekday, hour } = getParisDateTime(reference);
  const weekend = weekday === 'Sat' || weekday === 'Sun';
  return weekend ? hour >= 10 && hour <= 14 : hour >= 16 && hour <= 19;
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
