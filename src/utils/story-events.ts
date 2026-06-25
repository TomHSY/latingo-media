import { fetchEvents } from '../api/client';
import type { MediaEvent } from '../types';
import { formatTimeFrench } from './dates';
import { getParisDateLabel, getParisDayBounds, parseEventStartDatetime } from './paris-time';

const PADDED_MS = 12 * 3600000;

export interface StoryEventAudit {
  event: MediaEvent;
  parisDate: string;
  parisTime: string;
  inStrictQuery: boolean;
  inPaddedQuery: boolean;
  isoDateMismatch: boolean;
  included: boolean;
  includeReason: 'paris_day' | 'iso_fallback' | 'excluded';
}

function isoDatePrefix(iso: string): string {
  return iso.slice(0, 10);
}

function buildAudit(
  event: MediaEvent,
  label: string,
  strictIds: Set<string>,
  includeIsoDateFallback: boolean
): StoryEventAudit {
  const start = parseEventStartDatetime(event.start_datetime);
  const parisDate = getParisDateLabel(start);
  const parisTime = formatTimeFrench(start);
  const inStrictQuery = strictIds.has(event.id);
  const isoDateMismatch = isoDatePrefix(event.start_datetime) === label && parisDate !== label;

  if (parisDate === label) {
    return {
      event,
      parisDate,
      parisTime,
      inStrictQuery,
      inPaddedQuery: true,
      isoDateMismatch,
      included: true,
      includeReason: 'paris_day',
    };
  }

  if (includeIsoDateFallback && isoDateMismatch) {
    return {
      event,
      parisDate,
      parisTime,
      inStrictQuery,
      inPaddedQuery: true,
      isoDateMismatch,
      included: true,
      includeReason: 'iso_fallback',
    };
  }

  return {
    event,
    parisDate,
    parisTime,
    inStrictQuery,
    inPaddedQuery: true,
    isoDateMismatch,
    included: false,
    includeReason: 'excluded',
  };
}

export function logStoryEventAudit(audit: StoryEventAudit): void {
  const { event, parisDate, parisTime, inStrictQuery, isoDateMismatch, includeReason } = audit;
  const flags: string[] = [];
  if (!inStrictQuery) flags.push('not-in-strict');
  if (isoDateMismatch) flags.push('isoDateMismatch');
  if (includeReason === 'iso_fallback') flags.push('iso-fallback');
  const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
  console.log(
    `    • ${event.title} (${event.city ?? '?'}) — ${parisDate} ${parisTime} — ${event.start_datetime}${flagStr}`
  );
  console.log(`      id: ${event.id}`);
}

export async function fetchTodayStoryEvents(options?: {
  includeIsoDateFallback?: boolean;
  reference?: Date;
}): Promise<{
  label: string;
  from: string;
  to: string;
  paddedFrom: string;
  paddedTo: string;
  strictEvents: MediaEvent[];
  paddedEvents: MediaEvent[];
  events: MediaEvent[];
  audit: StoryEventAudit[];
  excluded: StoryEventAudit[];
}> {
  const reference = options?.reference ?? new Date();
  const includeIsoDateFallback = options?.includeIsoDateFallback ?? false;
  const { from, to, label } = getParisDayBounds(reference);

  const paddedFrom = new Date(new Date(from).getTime() - PADDED_MS).toISOString();
  const paddedTo = new Date(new Date(to).getTime() + PADDED_MS).toISOString();

  const [strictEvents, paddedEvents] = await Promise.all([
    fetchEvents({ date_from: from, date_to: to, sort_by: 'date_asc' }),
    fetchEvents({ date_from: paddedFrom, date_to: paddedTo, sort_by: 'date_asc' }),
  ]);

  const strictIds = new Set(strictEvents.map((e) => e.id));
  const auditAll = paddedEvents.map((e) => buildAudit(e, label, strictIds, includeIsoDateFallback));

  const audit = auditAll.filter((a) => a.included);
  const excluded = auditAll.filter((a) => !a.included);

  const events = audit
    .map((a) => a.event)
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());

  return {
    label,
    from,
    to,
    paddedFrom,
    paddedTo,
    strictEvents,
    paddedEvents,
    events,
    audit,
    excluded,
  };
}

/** Scan ±3 days for title matches (diagnostic). */
export async function searchEventsByTitle(
  pattern: RegExp,
  reference = new Date()
): Promise<{ event: MediaEvent; parisDate: string; parisTime: string }[]> {
  const { from, to } = getParisDayBounds(reference);
  const weekFrom = new Date(new Date(from).getTime() - 3 * 86400000).toISOString();
  const weekTo = new Date(new Date(to).getTime() + 3 * 86400000).toISOString();
  const events = await fetchEvents({ date_from: weekFrom, date_to: weekTo, sort_by: 'date_asc' });

  return events
    .filter((e) => pattern.test(e.title))
    .map((e) => {
      const start = parseEventStartDatetime(e.start_datetime);
      return {
        event: e,
        parisDate: getParisDateLabel(start),
        parisTime: formatTimeFrench(start),
      };
    });
}
