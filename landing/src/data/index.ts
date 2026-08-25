import eventsData from './events.json'
import fallbackData from './events.fallback.json'
import type { LandingEvent, LandingEventsData } from '../types/events'

const PREVIEW_WINDOW_DAYS = 7

function hasEvents(data: LandingEventsData): boolean {
  return data.stats.totalEvents > 0 && data.upcoming.length > 0
}

function isFutureEvent(event: LandingEvent, reference = new Date()): boolean {
  return new Date(event.startDatetime).getTime() >= reference.getTime()
}

function isWithinPreviewWindow(event: LandingEvent, reference = new Date()): boolean {
  const start = new Date(event.startDatetime).getTime()
  const end = reference.getTime() + PREVIEW_WINDOW_DAYS * 86400000
  return start >= reference.getTime() && start <= end
}

function pickPreviewEvents(allUpcoming: LandingEvent[], reference = new Date()): LandingEvent[] {
  const future = allUpcoming.filter((event) => isFutureEvent(event, reference))
  const thisWeek = future.filter((event) => isWithinPreviewWindow(event, reference))
  const pool = thisWeek.length > 0 ? thisWeek : future
  return pool.slice(0, 4)
}

const rawEvents: LandingEventsData = hasEvents(eventsData as LandingEventsData)
  ? (eventsData as LandingEventsData)
  : (fallbackData as LandingEventsData)

const now = new Date()
const upcoming = pickPreviewEvents(rawEvents.upcoming, now)

export const events: LandingEventsData = {
  ...rawEvents,
  upcoming,
}

export const eventsAreStale =
  rawEvents.upcoming.length > 0 && upcoming.length === 0
