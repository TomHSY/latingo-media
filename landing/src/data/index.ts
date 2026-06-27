import eventsData from './events.json'
import fallbackData from './events.fallback.json'
import type { LandingEventsData } from '../types/events'

function hasEvents(data: LandingEventsData): boolean {
  return data.stats.totalEvents > 0 && data.upcoming.length > 0
}

export const events: LandingEventsData = hasEvents(eventsData as LandingEventsData)
  ? (eventsData as LandingEventsData)
  : (fallbackData as LandingEventsData)
