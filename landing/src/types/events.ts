export interface LandingEvent {
  id: string
  title: string
  startDatetime: string
  city: string
  styles: string[]
  imageUrl: string | null
}

export interface LandingEventsData {
  stats: {
    totalEvents: number
    totalVenues: number
  }
  upcoming: LandingEvent[]
  fetchedAt: string
}
