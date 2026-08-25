import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_BASE = 'https://api.latingo.fr'
const OUTPUT = join(__dirname, '../src/data/events.json')

interface ApiDanceType {
  slug: string
  label_fr: string
}

interface ApiEvent {
  id: string
  title: string
  start_datetime: string
  city?: string | null
  latitude?: number | null
  longitude?: number | null
  image_url?: string | null
  dance_types?: ApiDanceType[]
  status?: 'active' | 'cancelled'
}

function loadEnvFromRepoRoot() {
  try {
    const envPath = join(__dirname, '../../.env')
    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env optional
  }
}

async function getToken(): Promise<string | null> {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return null

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

async function fetchEvents(dateFrom: string, dateTo: string): Promise<ApiEvent[]> {
  const params = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
    sort_by: 'date_asc',
  })

  const token = await getToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}/events?${params}`, { headers })

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  return Array.isArray(data) ? data : data.events ?? data.items ?? []
}

function venueKey(event: ApiEvent): string {
  if (event.latitude != null && event.longitude != null) {
    return `${event.latitude.toFixed(4)},${event.longitude.toFixed(4)}`
  }
  return (event.city ?? 'unknown').toLowerCase()
}

function pickPreviewEvents(events: ApiEvent[], limit = 4): ApiEvent[] {
  const now = Date.now()
  const weekMs = 7 * 86400000
  const future = events.filter((e) => new Date(e.start_datetime).getTime() >= now)
  const thisWeek = future.filter((e) => {
    const start = new Date(e.start_datetime).getTime()
    return start <= now + weekMs
  })
  const pool = thisWeek.length > 0 ? thisWeek : future
  const withImages = pool.filter((e) => e.image_url)
  const withoutImages = pool.filter((e) => !e.image_url)
  return [...withImages, ...withoutImages].slice(0, limit)
}

async function main() {
  loadEnvFromRepoRoot()

  const now = new Date()
  const dateFrom = now.toISOString()
  const dateTo = new Date(now.getTime() + 30 * 86400000).toISOString()

  const allEvents = await fetchEvents(dateFrom, dateTo)
  const activeEvents = allEvents.filter((e) => e.status !== 'cancelled')
  const futureEvents = activeEvents.filter(
    (e) => new Date(e.start_datetime).getTime() >= Date.now(),
  )

  const venues = new Set(futureEvents.map(venueKey))
  const upcoming = pickPreviewEvents(futureEvents)

  const payload = {
    stats: {
      totalEvents: futureEvents.length,
      totalVenues: venues.size,
    },
    upcoming: upcoming.map((event) => ({
      id: event.id,
      title: event.title,
      startDatetime: event.start_datetime,
      city: event.city ?? '',
      styles: (event.dance_types ?? []).map((d) => d.label_fr),
      imageUrl: event.image_url ?? null,
    })),
    fetchedAt: new Date().toISOString(),
  }

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  console.log(
    `Wrote ${payload.upcoming.length} preview events (${payload.stats.totalEvents} total, ${payload.stats.totalVenues} venues)`,
  )
}

main().catch((err) => {
  console.warn('fetch-events skipped:', err.message)
  try {
    readFileSync(OUTPUT, 'utf8')
    console.warn('Using existing events.json')
    process.exit(0)
  } catch {
    console.error('No events.json available')
    process.exit(1)
  }
})
