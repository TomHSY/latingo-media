import type { MediaEvent } from '../types';
import {
  type AreaSlug,
  FRENCH_AREAS,
  getAreaForEvent,
  getAreaDefinition,
  buildAreaFocusHeadline,
  buildAreaFocusSubheadline,
} from '../config/areas';
import { getDanceType } from '../tokens/dance-types';
import { dedupeByTitle } from './carousel-selection';
import { getParisIsoWeekLabel } from './paris-time';
import {
  type ThursdayState,
  freshnessFactor,
  getSlotTypeForCyclePosition,
  isOnCooldown,
  loadThursdayState,
} from './thursday-state';

export type ThursdaySlotType = 'dance' | 'area' | 'stats';

export type ThursdayVariant =
  | 'dance-spotlight'
  | 'autres-danses'
  | 'area-focus'
  | 'cross-border'
  | 'weekly-stats'
  | 'dance-duel';

export const CORE_DANCES = ['salsa', 'bachata', 'kizomba'] as const;
export const RARE_DANCES = ['zouk', 'semba', 'west-coast-swing', 'tango-argentin'] as const;

export const THURSDAY_EVENT_COUNT = 3;

const DANCE_COOLDOWN_WEEKS = 3;
const AREA_COOLDOWN_WEEKS = 2;
const MIN_DANCE_EVENTS = THURSDAY_EVENT_COUNT;
const MIN_AREA_EVENTS = 3;
const MIN_RARE_COMBINED = 3;
const MIN_CROSSBORDER_EUSKADI = 4;
const MIN_CROSSBORDER_BAB = 4;
const CROSSBORDER_BALANCE_RATIO = 0.6;
const MIN_DUEL_EACH = 5;
const MIN_STATS_TOTAL = 10;

export interface ThursdaySelectionMeta {
  featuredDance?: string;
  featuredArea?: AreaSlug;
  headline: string;
  subheadline?: string;
  totalMatching: number;
  remaining: number;
  salsaCount?: number;
  bachataCount?: number;
  frenchCount?: number;
  euskadiCount?: number;
  stats?: {
    totalEvents: number;
    activeAreas: number;
    danceStyles: number;
    newEvents: number;
  };
  mostlySbk?: boolean;
}

export interface ThursdaySelection {
  slotType: ThursdaySlotType;
  variant: ThursdayVariant;
  events: MediaEvent[];
  meta: ThursdaySelectionMeta;
  skip: boolean;
  skipReason?: string;
  cyclePosition: number;
}

function eventHasDance(event: MediaEvent, slug: string): boolean {
  return (event.dance_types || []).some((d) => d.slug === slug);
}

function getDanceSlugs(event: MediaEvent): Set<string> {
  return new Set((event.dance_types || []).map((d) => d.slug));
}

export function sbkTierMultiplier(event: MediaEvent, featuredDance: string): number {
  const slugs = getDanceSlugs(event);
  if (!slugs.has(featuredDance)) return 0;

  const core = ['salsa', 'bachata', 'kizomba'];
  const isFullSBK = core.every((c) => slugs.has(c));
  if (isFullSBK) return 0.4;

  if (slugs.size === 1) return 1;

  const hasKizomba = slugs.has('kizomba');
  const hasBachata = slugs.has('bachata');
  const hasSalsa = slugs.has('salsa');

  if (featuredDance === 'salsa' && hasBachata && !hasKizomba && slugs.size === 2) return 0.75;
  if (featuredDance === 'bachata' && hasSalsa && !hasKizomba && slugs.size === 2) return 0.75;
  if (featuredDance === 'kizomba' && hasSalsa && hasBachata && slugs.size === 2) return 0.75;

  const hasNonCore = [...slugs].some((s) => !core.includes(s));
  if (hasNonCore) return 0.5;

  return 0.5;
}

function baseEventScore(event: MediaEvent): number {
  const rsvp = event.rsvp_count || 0;
  const views = event.view_count || 0;
  let score = rsvp + views * 0.15;
  if (event.is_popular) score += 30;
  return score;
}

function filterExcluded(events: MediaEvent[], excludeIds: Set<string>): MediaEvent[] {
  return events.filter((e) => !excludeIds.has(e.id));
}

function countByDance(events: MediaEvent[], slug: string): number {
  return events.filter((e) => eventHasDance(e, slug)).length;
}

function countRareCombined(events: MediaEvent[]): number {
  return events.filter((e) => RARE_DANCES.some((d) => eventHasDance(e, d))).length;
}

function countByArea(events: MediaEvent[], area: AreaSlug): number {
  return events.filter((e) => getAreaForEvent(e) === area).length;
}

function countFrenchAreas(events: MediaEvent[]): number {
  return events.filter((e) => {
    const area = getAreaForEvent(e);
    return area !== null && FRENCH_AREAS.includes(area);
  }).length;
}

function isCrossBorderBalanced(babCount: number, euskadiCount: number): boolean {
  if (babCount < MIN_CROSSBORDER_BAB || euskadiCount < MIN_CROSSBORDER_EUSKADI) {
    return false;
  }
  const max = Math.max(babCount, euskadiCount);
  const min = Math.min(babCount, euskadiCount);
  return min / max >= CROSSBORDER_BALANCE_RATIO;
}

function crossBorderMeta(babCount: number, euskadiCount: number): ThursdaySelectionMeta {
  return {
    headline: 'Pays Basque : France / Espagne',
    subheadline: 'Tu danses de quel côté ce week-end ?',
    totalMatching: babCount + euskadiCount,
    remaining: 0,
    frenchCount: babCount,
    euskadiCount,
  };
}

function selectTopEvents(
  pool: MediaEvent[],
  count: number,
  scoreFn: (event: MediaEvent) => number
): MediaEvent[] {
  return [...pool]
    .map((event) => ({ event, score: scoreFn(event) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((c) => c.event);
}

function isPureSpotlightEvent(event: MediaEvent, featuredDance: string): boolean {
  const slugs = getDanceSlugs(event);
  return slugs.size === 1 && slugs.has(featuredDance);
}

function selectDanceSpotlightEvents(
  pool: MediaEvent[],
  featuredDance: string,
  count: number
): MediaEvent[] {
  const eligible = pool.filter((e) => isPureSpotlightEvent(e, featuredDance));
  return selectTopEvents(eligible, count, baseEventScore);
}

function coreDanceCount(event: MediaEvent): number {
  return CORE_DANCES.filter((d) => eventHasDance(event, d)).length;
}

function buildAutresDansesSubheadline(pool: MediaEvent[]): string {
  const labels = RARE_DANCES.filter((slug) => countByDance(pool, slug) > 0).map(
    (slug) => getDanceType(slug).label_fr
  );
  if (labels.length === 0) {
    return 'Zouk · Tango argentin · West Coast Swing · Semba';
  }
  return labels.join(' · ');
}

function selectAutresDansesEvents(pool: MediaEvent[], count: number): MediaEvent[] {
  const eligible = pool.filter((e) => RARE_DANCES.some((d) => eventHasDance(e, d)));
  // Prefer events that aren't full SBK parties with a rare tag on the side.
  const focused = eligible.filter((e) => coreDanceCount(e) <= 1);
  const source = focused.length >= count ? focused : eligible.filter((e) => coreDanceCount(e) < 3);
  const usedRare = new Set<string>();
  const picked: MediaEvent[] = [];

  const byScore = [...source].sort((a, b) => baseEventScore(b) - baseEventScore(a));

  for (const event of byScore) {
    if (picked.length >= count) break;
    const rareSlug = RARE_DANCES.find((d) => eventHasDance(event, d));
    if (!rareSlug) continue;
    if (usedRare.has(rareSlug) && picked.length < count - 1) continue;
    usedRare.add(rareSlug);
    picked.push(event);
  }

  if (picked.length < count) {
    for (const event of byScore) {
      if (picked.length >= count) break;
      if (!picked.some((p) => p.id === event.id)) {
        picked.push(event);
      }
    }
  }

  return picked.slice(0, count);
}

function selectAreaEvents(pool: MediaEvent[], area: AreaSlug, count: number): MediaEvent[] {
  const eligible = pool.filter((e) => getAreaForEvent(e) === area);
  return selectTopEvents(eligible, count, baseEventScore);
}

function countPureByDance(events: MediaEvent[], slug: string): number {
  return events.filter((e) => isPureSpotlightEvent(e, slug)).length;
}

function rankCoreDancesForSpotlight(
  pool: MediaEvent[],
  state: ThursdayState,
  currentWeek: string,
  ignoreCooldown = false
): Array<{ dance: string; pureCount: number; score: number }> {
  const ranked: Array<{ dance: string; pureCount: number; score: number }> = [];

  for (const dance of CORE_DANCES) {
    const pureCount = countPureByDance(pool, dance);
    if (pureCount < MIN_DANCE_EVENTS) continue;

    let fresh = 1;
    if (!ignoreCooldown) {
      fresh = freshnessFactor(state.cooldowns.dance, dance, currentWeek, DANCE_COOLDOWN_WEEKS);
      if (fresh === 0) continue;
    }

    ranked.push({ dance, pureCount, score: pureCount * fresh });
  }

  ranked.sort(
    (a, b) => b.score - a.score || b.pureCount - a.pureCount || a.dance.localeCompare(b.dance)
  );
  return ranked;
}

interface CoreSpotlightResult {
  featuredDance: string;
  selected: MediaEvent[];
  pureMatching: number;
}

function resolveCoreSpotlight(
  pool: MediaEvent[],
  state: ThursdayState,
  currentWeek: string,
  ignoreCooldown = false
): CoreSpotlightResult | null {
  const ranked = rankCoreDancesForSpotlight(pool, state, currentWeek, ignoreCooldown);

  for (const { dance, pureCount } of ranked) {
    const selected = selectDanceSpotlightEvents(pool, dance, THURSDAY_EVENT_COUNT);
    if (selected.length >= MIN_DANCE_EVENTS) {
      return { featuredDance: dance, selected, pureMatching: pureCount };
    }
  }

  return null;
}

interface AutresDansesResult {
  selected: MediaEvent[];
  totalMatching: number;
}

function tryAutresDansesFallback(pool: MediaEvent[]): AutresDansesResult | null {
  const matching = pool.filter((e) => RARE_DANCES.some((d) => eventHasDance(e, d)));
  const selected = selectAutresDansesEvents(pool, THURSDAY_EVENT_COUNT);
  if (selected.length < MIN_DANCE_EVENTS) {
    return null;
  }
  return { selected, totalMatching: matching.length };
}

function buildCoreSpotlightSelection(
  core: CoreSpotlightResult,
  slotType: ThursdaySlotType,
  cyclePosition: number
): ThursdaySelection {
  return {
    slotType,
    variant: 'dance-spotlight',
    events: core.selected,
    skip: false,
    cyclePosition,
    meta: {
      featuredDance: core.featuredDance,
      headline: buildDanceHeadline(core.featuredDance, core.pureMatching, false),
      totalMatching: core.pureMatching,
      remaining: Math.max(core.pureMatching - core.selected.length, 0),
      mostlySbk: false,
    },
  };
}

function buildAutresDansesSelection(
  autres: AutresDansesResult,
  pool: MediaEvent[],
  slotType: ThursdaySlotType,
  cyclePosition: number
): ThursdaySelection {
  return {
    slotType,
    variant: 'autres-danses',
    events: autres.selected,
    skip: false,
    cyclePosition,
    meta: {
      featuredDance: 'autres-danses',
      headline: buildDanceHeadline('autres-danses', autres.selected.length, false),
      subheadline: buildAutresDansesSubheadline(pool),
      totalMatching: autres.totalMatching,
      remaining: Math.max(autres.totalMatching - autres.selected.length, 0),
    },
  };
}

function buildAreaSpotlightSelection(
  featuredArea: AreaSlug,
  selected: MediaEvent[],
  pool: MediaEvent[],
  slotType: ThursdaySlotType,
  cyclePosition: number
): ThursdaySelection {
  const matching = pool.filter((e) => getAreaForEvent(e) === featuredArea);
  return {
    slotType,
    variant: 'area-focus',
    events: selected,
    skip: false,
    cyclePosition,
    meta: {
      featuredArea,
      headline: buildAreaFocusHeadline(featuredArea),
      subheadline: buildAreaFocusSubheadline(pool, featuredArea),
      totalMatching: matching.length,
      remaining: Math.max(matching.length - selected.length, 0),
    },
  };
}

function pickFeaturedArea(
  pool: MediaEvent[],
  state: ThursdayState,
  currentWeek: string
): AreaSlug | null {
  let best: { area: AreaSlug; score: number } | null = null;
  const areaSlugs: AreaSlug[] = ['bab', 'landes', 'bearn', 'euskadi'];

  for (const area of areaSlugs) {
    const count = countByArea(pool, area);
    if (count < MIN_AREA_EVENTS) continue;
    const fresh = freshnessFactor(state.cooldowns.area, area, currentWeek, AREA_COOLDOWN_WEEKS);
    if (fresh === 0) continue;
    const score = count * fresh;
    if (!best || score > best.score) {
      best = { area, score };
    }
  }

  return best?.area ?? null;
}

function danceDisplayName(slug: string): string {
  const names: Record<string, string> = {
    salsa: 'salsa',
    bachata: 'bachata',
    kizomba: 'kizomba',
    'autres-danses': 'autres danses',
  };
  return names[slug] ?? slug;
}

function buildDanceHeadline(featuredDance: string, count: number, mostlySbk: boolean): string {
  if (featuredDance === 'autres-danses') {
    return 'Et si tu sortais des sentiers battus ?';
  }
  if (mostlySbk) {
    return `${count} soirée${count > 1 ? 's' : ''} ${danceDisplayName(featuredDance)} et SBK ce week-end`;
  }
  return `${count} soirée${count > 1 ? 's' : ''} ${danceDisplayName(featuredDance)} ce week-end`;
}

function computeStats(pool: MediaEvent[], weekStart: Date): ThursdaySelectionMeta['stats'] {
  const areas = new Set<AreaSlug>();
  const dances = new Set<string>();
  let newEvents = 0;
  const weekStartMs = weekStart.getTime();

  for (const event of pool) {
    const area = getAreaForEvent(event);
    if (area) areas.add(area);
    for (const d of event.dance_types || []) {
      dances.add(d.slug);
    }
    if (event.created_at) {
      const created = Date.parse(event.created_at);
      if (!Number.isNaN(created) && created >= weekStartMs) {
        newEvents += 1;
      }
    }
  }

  return {
    totalEvents: pool.length,
    activeAreas: areas.size,
    danceStyles: dances.size,
    newEvents,
  };
}

export interface SelectThursdayOptions {
  events: MediaEvent[];
  excludeEventIds?: string[];
  state?: ThursdayState;
  reference?: Date;
}

export function selectThursdayLens(options: SelectThursdayOptions): ThursdaySelection {
  const reference = options.reference ?? new Date();
  const state = options.state ?? loadThursdayState();
  const currentWeek = getParisIsoWeekLabel(reference);
  const cyclePosition = state.cyclePosition;
  const slotType = getSlotTypeForCyclePosition(cyclePosition);

  const excludeIds = new Set(options.excludeEventIds ?? state.lastTuesdayCarouselEventIds);
  const { deduped } = dedupeByTitle(options.events);
  const pool = filterExcluded(deduped, excludeIds);

  const skip = (variant: ThursdayVariant, reason: string): ThursdaySelection => ({
    slotType,
    variant,
    events: [],
    meta: { headline: '', totalMatching: 0, remaining: 0 },
    skip: true,
    skipReason: reason,
    cyclePosition,
  });

  if (slotType === 'dance') {
    const core = resolveCoreSpotlight(pool, state, currentWeek);
    if (core) {
      return buildCoreSpotlightSelection(core, slotType, cyclePosition);
    }

    const autres = tryAutresDansesFallback(pool);
    if (autres) {
      return buildAutresDansesSelection(autres, pool, slotType, cyclePosition);
    }

    return skip(
      'dance-spotlight',
      `No core dance with enough pure events (min ${THURSDAY_EVENT_COUNT}) and no autres-danses fallback`
    );
  }

  if (slotType === 'area') {
    const euskadiCount = countByArea(pool, 'euskadi');
    const babCount = countByArea(pool, 'bab');
    const crossBorderEligible =
      isCrossBorderBalanced(babCount, euskadiCount) &&
      !isOnCooldown(state.cooldowns.area, 'cross-border', currentWeek, AREA_COOLDOWN_WEEKS);

    if (crossBorderEligible) {
      return {
        slotType,
        variant: 'cross-border',
        events: [],
        skip: false,
        cyclePosition,
        meta: crossBorderMeta(babCount, euskadiCount),
      };
    }

    const featuredArea = pickFeaturedArea(pool, state, currentWeek);
    if (!featuredArea) {
      if (isCrossBorderBalanced(babCount, euskadiCount)) {
        return {
          slotType,
          variant: 'cross-border',
          events: [],
          skip: false,
          cyclePosition,
          meta: crossBorderMeta(babCount, euskadiCount),
        };
      }
      return skip('area-focus', 'No area meets threshold or cooldown');
    }

    const selected = selectAreaEvents(pool, featuredArea, THURSDAY_EVENT_COUNT);
    if (selected.length < MIN_AREA_EVENTS) {
      return skip(
        'area-focus',
        `Only ${selected.length} event(s) in ${getAreaDefinition(featuredArea).displayName} (min ${MIN_AREA_EVENTS})`
      );
    }

    return buildAreaSpotlightSelection(featuredArea, selected, pool, slotType, cyclePosition);
  }

  // stats slot
  const salsaCount = countByDance(pool, 'salsa');
  const bachataCount = countByDance(pool, 'bachata');
  const duelEligible = salsaCount >= MIN_DUEL_EACH && bachataCount >= MIN_DUEL_EACH;

  if (pool.length < MIN_STATS_TOTAL) {
    return skip('weekly-stats', `Total events ${pool.length} below minimum ${MIN_STATS_TOTAL}`);
  }

  if (duelEligible) {
    return {
      slotType,
      variant: 'dance-duel',
      events: [],
      skip: false,
      cyclePosition,
      meta: {
        headline: 'Salsa vs Bachata ce week-end',
        subheadline: 'De quel côté danses-tu ?',
        totalMatching: pool.length,
        remaining: 0,
        salsaCount,
        bachataCount,
      },
    };
  }

  const weekStart = new Date(reference);
  weekStart.setDate(weekStart.getDate() - 7);
  const stats = computeStats(pool, weekStart);

  return {
    slotType,
    variant: 'weekly-stats',
    events: [],
    skip: false,
    cyclePosition,
    meta: {
      headline: 'Cette semaine sur LatinGo',
      subheadline: 'Thu–Dim',
      totalMatching: pool.length,
      remaining: 0,
      stats,
    },
  };
}

export function recordThursdayPublish(
  state: ThursdayState,
  selection: ThursdaySelection,
  tuesdayCarouselIds: string[],
  reference = new Date()
): ThursdayState {
  const currentWeek = getParisIsoWeekLabel(reference);
  const next: ThursdayState = {
    ...state,
    cyclePosition: (state.cyclePosition + 1) % 8,
    lastTuesdayCarouselEventIds: tuesdayCarouselIds,
    lastVariants: [...state.lastVariants.slice(-7), selection.variant],
    cooldowns: {
      dance: { ...state.cooldowns.dance },
      area: { ...state.cooldowns.area },
    },
  };

  if (selection.meta.featuredDance) {
    next.cooldowns.dance[selection.meta.featuredDance] = currentWeek;
    next.lastFeaturedDances = [...state.lastFeaturedDances.slice(-5), selection.meta.featuredDance];
  }

  if (selection.variant === 'cross-border') {
    next.cooldowns.area['cross-border'] = currentWeek;
    next.lastFeaturedAreas = [...state.lastFeaturedAreas.slice(-5), 'cross-border'];
  } else if (selection.meta.featuredArea) {
    next.cooldowns.area[selection.meta.featuredArea] = currentWeek;
    next.lastFeaturedAreas = [...state.lastFeaturedAreas.slice(-5), selection.meta.featuredArea];
  }

  return next;
}

export function validateThursdaySelection(
  selection: ThursdaySelection,
  excludeIds: Set<string>
): string[] {
  const errors: string[] = [];
  if (selection.skip) {
    errors.push(selection.skipReason ?? 'Selection marked as skip');
    return errors;
  }

  if (selection.variant === 'dance-spotlight' || selection.variant === 'autres-danses' || selection.variant === 'area-focus') {
    if (selection.events.length < 1) {
      errors.push('No event cards rendered');
    }
    for (const event of selection.events) {
      if (excludeIds.has(event.id)) {
        errors.push(`Event ${event.id} overlaps with Tuesday carousel`);
      }
    }
    if (selection.meta.remaining <= 0 && selection.meta.totalMatching > selection.events.length) {
      errors.push('Closing "+X autres" count should be > 0');
    }
  }

  return errors;
}

export interface ThursdayGalleryEntry {
  variant: ThursdayVariant;
  selection: ThursdaySelection;
  note?: string;
  skipped: boolean;
}

export interface BuildGalleryOptions {
  events: MediaEvent[];
  excludeEventIds?: string[];
  reference?: Date;
}

function pickGalleryFeaturedArea(pool: MediaEvent[]): AreaSlug | null {
  let best: { area: AreaSlug; count: number } | null = null;
  const areaSlugs: AreaSlug[] = ['bab', 'landes', 'bearn', 'euskadi'];
  for (const area of areaSlugs) {
    const count = countByArea(pool, area);
    if (count < 1) continue;
    if (!best || count > best.count) {
      best = { area, count };
    }
  }
  return best?.area ?? null;
}

function emptyGallerySelection(variant: ThursdayVariant, slotType: ThursdaySlotType): ThursdaySelection {
  return {
    slotType,
    variant,
    events: [],
    skip: true,
    meta: { headline: '', totalMatching: 0, remaining: 0 },
    cyclePosition: -1,
  };
}

/** Force-build all 6 Thursday variants for template gallery (ignores cooldowns and min thresholds). */
export function buildThursdayGallerySelections(options: BuildGalleryOptions): ThursdayGalleryEntry[] {
  const reference = options.reference ?? new Date();
  const excludeIds = new Set(options.excludeEventIds ?? []);
  const { deduped } = dedupeByTitle(options.events);
  const pool = filterExcluded(deduped, excludeIds);
  const weekStart = new Date(reference);
  weekStart.setDate(weekStart.getDate() - 7);

  const salsaCount = countByDance(pool, 'salsa');
  const bachataCount = countByDance(pool, 'bachata');
  const euskadiCount = countByArea(pool, 'euskadi');
  const babCount = countByArea(pool, 'bab');
  const rareCount = countRareCombined(pool);

  const entries: ThursdayGalleryEntry[] = [];

  const coreSpotlight = resolveCoreSpotlight(pool, loadThursdayState(), getParisIsoWeekLabel(reference), true);
  if (coreSpotlight) {
    entries.push({
      variant: 'dance-spotlight',
      skipped: false,
      note:
        coreSpotlight.selected.length < THURSDAY_EVENT_COUNT
          ? `Only ${coreSpotlight.selected.length} pure event card(s) rendered (ideal ${THURSDAY_EVENT_COUNT})`
          : undefined,
      selection: buildCoreSpotlightSelection(coreSpotlight, 'dance', -1),
    });
  } else {
    entries.push({
      variant: 'dance-spotlight',
      skipped: true,
      note: `No core dance with ≥${MIN_DANCE_EVENTS} pure events in Thu–Sun window`,
      selection: emptyGallerySelection('dance-spotlight', 'dance'),
    });
  }

  const rareMatching = pool.filter((e) => RARE_DANCES.some((d) => eventHasDance(e, d)));
  const autresSelected = selectAutresDansesEvents(pool, THURSDAY_EVENT_COUNT);
  entries.push({
    variant: 'autres-danses',
    skipped: autresSelected.length < 1,
    note:
      rareCount < MIN_RARE_COMBINED
        ? `Only ${rareCount} rare-dance event(s) (production min ${MIN_RARE_COMBINED})`
        : autresSelected.length < THURSDAY_EVENT_COUNT
          ? `Only ${autresSelected.length} event card(s) rendered`
          : undefined,
    selection: {
      slotType: 'dance',
      variant: 'autres-danses',
      events: autresSelected,
      skip: autresSelected.length < 1,
      cyclePosition: -1,
      meta: {
        featuredDance: 'autres-danses',
        headline: buildDanceHeadline('autres-danses', rareMatching.length, false),
        subheadline: buildAutresDansesSubheadline(pool),
        totalMatching: rareMatching.length,
        remaining: Math.max(rareMatching.length - autresSelected.length, 0),
      },
    },
  });

  const featuredArea = pickGalleryFeaturedArea(pool);
  if (featuredArea) {
    const matching = pool.filter((e) => getAreaForEvent(e) === featuredArea);
    const selected = selectAreaEvents(pool, featuredArea, THURSDAY_EVENT_COUNT);
    const areaName = getAreaDefinition(featuredArea).displayName;
    entries.push({
      variant: 'area-focus',
      skipped: selected.length < MIN_AREA_EVENTS,
      note:
        matching.length < MIN_AREA_EVENTS
          ? `Only ${matching.length} event(s) in ${areaName} (production min ${MIN_AREA_EVENTS})`
          : selected.length < THURSDAY_EVENT_COUNT
            ? `Only ${selected.length} event card(s) rendered`
            : undefined,
      selection: {
        ...buildAreaSpotlightSelection(featuredArea, selected, pool, 'area', -1),
        skip: selected.length < MIN_AREA_EVENTS,
      },
    });
  } else {
    entries.push({
      variant: 'area-focus',
      skipped: true,
      note: 'No mapped area events in Thu–Sun window',
      selection: emptyGallerySelection('area-focus', 'area'),
    });
  }

  entries.push({
    variant: 'cross-border',
    skipped: !isCrossBorderBalanced(babCount, euskadiCount),
    note: !isCrossBorderBalanced(babCount, euskadiCount)
      ? `Pays Basque BAB=${babCount} Euskadi=${euskadiCount} (min ${MIN_CROSSBORDER_BAB}/${MIN_CROSSBORDER_EUSKADI}, ratio ≥ ${CROSSBORDER_BALANCE_RATIO})`
      : undefined,
    selection: {
      slotType: 'area',
      variant: 'cross-border',
      events: [],
      skip: !isCrossBorderBalanced(babCount, euskadiCount),
      cyclePosition: -1,
      meta: crossBorderMeta(babCount, euskadiCount),
    },
  });

  const stats = computeStats(pool, weekStart);
  entries.push({
    variant: 'weekly-stats',
    skipped: false,
    note:
      pool.length < MIN_STATS_TOTAL
        ? `Only ${pool.length} total events (production min ${MIN_STATS_TOTAL})`
        : undefined,
    selection: {
      slotType: 'stats',
      variant: 'weekly-stats',
      events: [],
      skip: false,
      cyclePosition: -1,
      meta: {
        headline: 'Cette semaine sur LatinGo',
        subheadline: 'Thu–Dim',
        totalMatching: pool.length,
        remaining: 0,
        stats,
      },
    },
  });

  entries.push({
    variant: 'dance-duel',
    skipped: false,
    note:
      salsaCount < MIN_DUEL_EACH || bachataCount < MIN_DUEL_EACH
        ? `Salsa=${salsaCount} Bachata=${bachataCount} (production min ${MIN_DUEL_EACH} each)`
        : undefined,
    selection: {
      slotType: 'stats',
      variant: 'dance-duel',
      events: [],
      skip: false,
      cyclePosition: -1,
      meta: {
        headline: 'Salsa vs Bachata ce week-end',
        subheadline: 'De quel côté danses-tu ?',
        totalMatching: pool.length,
        remaining: 0,
        salsaCount,
        bachataCount,
      },
    },
  });

  return entries;
}
