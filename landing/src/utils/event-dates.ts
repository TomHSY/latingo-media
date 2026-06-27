const PARIS_TZ = 'Europe/Paris'

function getParisDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: PARIS_TZ }).format(date)
}

function formatParisTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function formatParisWeekday(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS_TZ,
    weekday: 'short',
  }).format(date)
}

function formatParisDayMonth(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS_TZ,
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function formatEventWhen(isoString: string, reference = new Date()): string {
  const date = new Date(isoString)
  const today = getParisDateLabel(reference)
  const eventDay = getParisDateLabel(date)

  const todayMs = new Date(`${today}T12:00:00`).getTime()
  const eventMs = new Date(`${eventDay}T12:00:00`).getTime()
  const diffDays = Math.round((eventMs - todayMs) / 86400000)

  const time = formatParisTime(date)

  if (diffDays === 0) return `Ce soir · ${time}`
  if (diffDays === 1) return `Demain · ${time}`
  if (diffDays > 1 && diffDays <= 6) {
    return `${formatParisWeekday(date)} ${formatParisDayMonth(date)} · ${time}`
  }

  return `${formatParisWeekday(date)} ${formatParisDayMonth(date)} · ${time}`
}
