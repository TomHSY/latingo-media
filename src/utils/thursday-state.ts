/**
 * Rotation ledger for Thursday lens posts.
 * Updated only after successful publish.
 */
import fs from 'fs';
import path from 'path';

export interface ThursdayState {
  cyclePosition: number;
  lastFeaturedDances: string[];
  lastFeaturedAreas: string[];
  lastVariants: string[];
  lastTuesdayCarouselEventIds: string[];
  cooldowns: {
    dance: Record<string, string>;
    area: Record<string, string>;
  };
}

const DEFAULT_STATE: ThursdayState = {
  cyclePosition: 0,
  lastFeaturedDances: [],
  lastFeaturedAreas: [],
  lastVariants: [],
  lastTuesdayCarouselEventIds: [],
  cooldowns: { dance: {}, area: {} },
};

const STATE_PATH = path.resolve(__dirname, '..', '..', 'thursday-state.json');

export function getThursdayStatePath(): string {
  return STATE_PATH;
}

export function loadThursdayState(): ThursdayState {
  try {
    if (!fs.existsSync(STATE_PATH)) {
      return { ...DEFAULT_STATE, cooldowns: { dance: {}, area: {} } };
    }
    const raw = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8')) as Partial<ThursdayState>;
    return {
      ...DEFAULT_STATE,
      ...raw,
      cooldowns: {
        dance: raw.cooldowns?.dance ?? {},
        area: raw.cooldowns?.area ?? {},
      },
    };
  } catch {
    return { ...DEFAULT_STATE, cooldowns: { dance: {}, area: {} } };
  }
}

export function saveThursdayState(state: ThursdayState): void {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

export function advanceCyclePosition(current: number): number {
  return (current + 1) % 8;
}

export function getSlotTypeForCyclePosition(position: number): 'dance' | 'area' | 'stats' {
  const types: Array<'dance' | 'area' | 'stats'> = [
    'dance',
    'area',
    'dance',
    'stats',
    'area',
    'dance',
    'area',
    'stats',
  ];
  return types[position % 8] ?? 'dance';
}

/** Weeks between two ISO week labels (approximate, sufficient for cooldown). */
export function weeksSinceIsoWeek(fromWeek: string, toWeek: string): number {
  const parse = (w: string) => {
    const match = w.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 100 + parseInt(match[2], 10);
  };
  return parse(toWeek) - parse(fromWeek);
}

export function isOnCooldown(
  cooldowns: Record<string, string>,
  key: string,
  currentWeek: string,
  minWeeks: number
): boolean {
  const last = cooldowns[key];
  if (!last) return false;
  return weeksSinceIsoWeek(last, currentWeek) < minWeeks;
}

export function freshnessFactor(
  cooldowns: Record<string, string>,
  key: string,
  currentWeek: string,
  minCooldownWeeks: number
): number {
  if (isOnCooldown(cooldowns, key, currentWeek, minCooldownWeeks)) {
    return 0;
  }
  const last = cooldowns[key];
  if (!last) return 1;
  const elapsed = weeksSinceIsoWeek(last, currentWeek);
  return Math.min(Math.max(elapsed, 1) / 4, 1);
}
