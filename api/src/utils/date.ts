import { env } from '../config/index.js'

export function formatDateUtc(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

/**
 * Returns today's date string (YYYY-MM-DD) in the configured timezone.
 * Uses Intl.DateTimeFormat to get the correct local date regardless of server UTC offset.
 */
export function getTodayLocal(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: env.TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

/** @deprecated prefer getTodayLocal() */
export function getTodayUtc(): string {
  return formatDateUtc(new Date())
}

export function getPreviousDateUtc(date: string): string {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return formatDateUtc(d)
}

export function getUtcDayOfWeek(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

export function listDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  const cursor = new Date(`${start}T12:00:00Z`)
  const limit = new Date(`${end}T12:00:00Z`)

  while (cursor.getTime() <= limit.getTime()) {
    dates.push(formatDateUtc(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates
}
