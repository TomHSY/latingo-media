import type { EventDanceType, MediaEvent } from '../types';
import { getParisDateLabel, parseEventStartDatetime } from './paris-time';

const RSVP_WEIGHT = 1;
const VIEW_WEIGHT = 0.15;
const POPULAR_BONUS = 30;
const RECURRING_PENALTY = 35;
const CITY_FRESHNESS_BONUS = 18;
const DAY_FRESHNESS_BONUS = 18;
const DANCE_DIVERSITY_BONUS = 12;

interface CandidateScore {
  event: MediaEvent;
  score: number;
  isLikelyRecurring: boolean;
}

function normalize(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase();
}

/** Collapse a title to a comparable key: strip accents, punctuation, dates, times, and spacing. */
function titleKey(title: string): string {
  return normalize(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b\d{1,2}[h:]\d{0,2}\b/g, '')
    .replace(/\b\d{1,2}\s*(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Prefer the row with more social proof, then the most recently created (likely the edited/cropped one). */
function preferRow(a: MediaEvent, b: MediaEvent): MediaEvent {
  const byRsvp = (b.rsvp_count || 0) - (a.rsvp_count || 0);
  if (byRsvp !== 0) return byRsvp < 0 ? a : b;
  const byViews = (b.view_count || 0) - (a.view_count || 0);
  if (byViews !== 0) return byViews < 0 ? a : b;
  const at = a.created_at ? Date.parse(a.created_at) : 0;
  const bt = b.created_at ? Date.parse(b.created_at) : 0;
  return bt > at ? b : a;
}

/** Remove duplicate rows for the same real event (same/similar title returned under different IDs). */
export function dedupeByTitle(events: MediaEvent[]): { deduped: MediaEvent[]; dropped: MediaEvent[] } {
  const bestByKey = new Map<string, MediaEvent>();
  const dropped: MediaEvent[] = [];

  for (const event of events) {
    const key = titleKey(event.title);
    if (!key) {
      bestByKey.set(`__id:${event.id}`, event);
      continue;
    }
    const existing = bestByKey.get(key);
    if (!existing) {
      bestByKey.set(key, event);
      continue;
    }
    const winner = preferRow(existing, event);
    const loser = winner === existing ? event : existing;
    bestByKey.set(key, winner);
    dropped.push(loser);
  }

  return { deduped: [...bestByKey.values()], dropped };
}

function hasRecurringKeyword(value: string): boolean {
  return /\b(hebdo|hebdomadaire|weekly|tous les|chaque|every|mensuel|mensuelle|monthly|edition|édition|viernes|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|afterwork|social|practica|practice)\b/i.test(value);
}

function buildRecurringSignature(event: MediaEvent): string {
  const title = normalize(event.title)
    .replace(/\b\d{1,2}[h:]\d{0,2}\b/g, '')
    .replace(/\b\d{1,2}\s*(janvier|fevrier|février|mars|avril|mai|juin|juillet|aout|août|septembre|octobre|novembre|decembre|décembre)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const city = normalize(event.city);
  const source = normalize(event.source_url);
  const hostKey = source ? source.split('/').filter(Boolean).slice(0, 3).join('/') : '';
  return [title, city, hostKey].join('|');
}

function isLikelyRecurring(event: MediaEvent): boolean {
  const title = normalize(event.title);
  const source = normalize(event.source_url);
  if (hasRecurringKeyword(title)) {
    return true;
  }
  if (source && /(events\/(weekly|series)|calendar|agenda)/i.test(source)) {
    return true;
  }
  if (/^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|viernes)\b/i.test(title)) {
    return true;
  }
  const signature = buildRecurringSignature(event);
  return signature.length > 0 && /\b(afterwork|social|practice|practica|mensuel|hebdo)\b/i.test(signature);
}

function sumDanceDiversityBonus(danceTypes: EventDanceType[], usedDanceSlugs: Set<string>): number {
  let bonus = 0;
  for (const danceType of danceTypes) {
    if (!usedDanceSlugs.has(danceType.slug)) {
      bonus += DANCE_DIVERSITY_BONUS;
    }
  }
  return bonus;
}

function getParisDay(isoString: string): string {
  return getParisDateLabel(parseEventStartDatetime(isoString));
}

function scoreCandidate(
  event: MediaEvent,
  usedCities: Set<string>,
  usedDays: Set<string>,
  usedDanceSlugs: Set<string>
): CandidateScore {
  const rsvp = event.rsvp_count || 0;
  const views = event.view_count || 0;
  const city = normalize(event.city);
  const day = getParisDay(event.start_datetime);
  const recurring = isLikelyRecurring(event);

  let score = rsvp * RSVP_WEIGHT + views * VIEW_WEIGHT;
  if (event.is_popular) {
    score += POPULAR_BONUS;
  }
  if (city && !usedCities.has(city)) {
    score += CITY_FRESHNESS_BONUS;
  }
  if (!usedDays.has(day)) {
    score += DAY_FRESHNESS_BONUS;
  }
  score += sumDanceDiversityBonus(event.dance_types || [], usedDanceSlugs);
  if (recurring) {
    score -= RECURRING_PENALTY;
  }

  return { event, score, isLikelyRecurring: recurring };
}

export interface SelectionResult {
  selected: MediaEvent[];
  ranked: MediaEvent[];
  recurringPenalizedCount: number;
  recurringCandidates: MediaEvent[];
  droppedDuplicates: { kept: string; dropped: string }[];
}

/**
 * Pick a spicy carousel set with diversity bonuses and recurring down-rank.
 */
export function selectSpicyEvents(events: MediaEvent[], count: number): SelectionResult {
  // Same real event can arrive as multiple rows (different IDs) with same/similar title — collapse them.
  const { deduped, dropped } = dedupeByTitle(events);
  const droppedDuplicates = dropped.map((d) => {
    const kept = deduped.find((k) => titleKey(k.title) === titleKey(d.title));
    return { kept: kept ? kept.id : '?', dropped: d.id };
  });

  const pool = [...deduped];
  const selected: MediaEvent[] = [];
  const usedCities = new Set<string>();
  const usedDays = new Set<string>();
  const usedDanceSlugs = new Set<string>();
  const recurringCandidates = deduped.filter((event) => isLikelyRecurring(event));

  while (selected.length < count && pool.length > 0) {
    const scoredPool = pool.map((event, idx) => ({ idx, ...scoreCandidate(event, usedCities, usedDays, usedDanceSlugs) }));
    const nonRecurringPool = scoredPool.filter((candidate) => !candidate.isLikelyRecurring);
    const candidatePool = nonRecurringPool.length > 0 ? nonRecurringPool : scoredPool;

    let bestCandidate = candidatePool[0];
    for (let i = 1; i < candidatePool.length; i++) {
      if (candidatePool[i].score > bestCandidate.score) {
        bestCandidate = candidatePool[i];
      }
    }

    const [picked] = pool.splice(bestCandidate.idx, 1);
    selected.push(picked);
    const city = normalize(picked.city);
    if (city) {
      usedCities.add(city);
    }
    usedDays.add(getParisDay(picked.start_datetime));
    for (const danceType of picked.dance_types || []) {
      usedDanceSlugs.add(danceType.slug);
    }
  }

  const recurringPenalizedCount = recurringCandidates.filter(
    (rc) => !selected.some((s) => s.id === rc.id)
  ).length;

  const ranked = [...deduped].sort((a, b) => {
    const as = scoreCandidate(a, new Set<string>(), new Set<string>(), new Set<string>()).score;
    const bs = scoreCandidate(b, new Set<string>(), new Set<string>(), new Set<string>()).score;
    return bs - as;
  });

  return { selected, ranked, recurringPenalizedCount, recurringCandidates, droppedDuplicates };
}
