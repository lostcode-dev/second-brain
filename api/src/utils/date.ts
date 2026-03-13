export function formatDateUtc(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

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
