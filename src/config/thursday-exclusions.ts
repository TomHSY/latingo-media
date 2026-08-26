import type { MediaEvent } from '../types';

/** Event UUIDs manually excluded from Thursday lens selection. */
export const THURSDAY_EXCLUDED_EVENT_IDS: readonly string[] = [];

/** Case-insensitive city substrings for founder-curated skips. */
export const THURSDAY_EXCLUDED_CITY_SUBSTRINGS: readonly string[] = ['eysines'];

/** Case-insensitive title substrings for founder-curated skips. */
export const THURSDAY_EXCLUDED_TITLE_SUBSTRINGS: readonly string[] = [
  'stage sunny danse',
];

export function buildThursdayExcludeIds(
  events: MediaEvent[],
  extraIds: string[] = []
): string[] {
  const ids = new Set(extraIds);
  for (const id of THURSDAY_EXCLUDED_EVENT_IDS) {
    ids.add(id);
  }
  for (const event of events) {
    const title = event.title.toLowerCase();
    if (THURSDAY_EXCLUDED_TITLE_SUBSTRINGS.some((s) => title.includes(s))) {
      ids.add(event.id);
    }
    const city = (event.city || '').toLowerCase();
    if (THURSDAY_EXCLUDED_CITY_SUBSTRINGS.some((s) => city.includes(s))) {
      ids.add(event.id);
    }
  }
  return [...ids];
}
