const ADMIN_TIME_ZONE = "Europe/Berlin"

interface AdminDateParts {
  year: number
  month: number
  day: number
}

interface SubmittedAtGroup<T> {
  key: string
  label: string
  items: T[]
}

function getAdminDateParts(date: Date): AdminDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })

  const parts = formatter.formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  }
}

function getAdminUtcOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value)
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))

  return asUtc - (date.getTime() - date.getMilliseconds())
}

// Germany observes DST, so the offset must be resolved per date.
function getAdminMidnightUtc(year: number, month: number, day: number): number {
  const localMidnightAsUtc = Date.UTC(year, month - 1, day)
  const firstGuess = localMidnightAsUtc - getAdminUtcOffsetMs(new Date(localMidnightAsUtc))
  return localMidnightAsUtc - getAdminUtcOffsetMs(new Date(firstGuess))
}

function getDaysAgoInAdminTimeZone(date: Date, now: Date): number {
  const dateKey = getSubmittedAtGroupKey(date)
  const nowKey = getSubmittedAtGroupKey(now)
  const [dateYear, dateMonth, dateDay] = dateKey.split("-").map(Number)
  const [nowYear, nowMonth, nowDay] = nowKey.split("-").map(Number)
  const utcDate = Date.UTC(dateYear, dateMonth - 1, dateDay)
  const utcNow = Date.UTC(nowYear, nowMonth - 1, nowDay)

  return Math.round((utcNow - utcDate) / (24 * 60 * 60 * 1000))
}

export function getSubmittedAtGroupKey(date: Date): string {
  const { year, month, day } = getAdminDateParts(date)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function getSubmittedAtGroupRange(key: string): { start: Date; end: Date } {
  const [year, month, day] = key.split("-").map(Number)

  return {
    start: new Date(getAdminMidnightUtc(year, month, day)),
    end: new Date(getAdminMidnightUtc(year, month, day + 1)),
  }
}

export function formatSubmittedAtTime(date: Date): string {
  return new Intl.DateTimeFormat("ka-GE", {
    timeZone: ADMIN_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date)
}

export function formatSubmittedAtGroupLabel(date: Date, now: Date = new Date()): string {
  const daysAgo = getDaysAgoInAdminTimeZone(date, now)

  if (daysAgo === 0) {
    return "დღეს"
  }

  if (daysAgo === 1) {
    return "გუშინ"
  }

  const weekday = new Intl.DateTimeFormat("ka-GE", {
    timeZone: ADMIN_TIME_ZONE,
    weekday: "long",
  }).format(date)

  const { year } = getAdminDateParts(date)
  const nowYear = getAdminDateParts(now).year
  const includeYear = year !== nowYear

  const dayMonth = new Intl.DateTimeFormat("ka-GE", {
    timeZone: ADMIN_TIME_ZONE,
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date)

  return `${weekday}, ${dayMonth}`
}

export function groupBySubmittedAt<T>(
  items: T[],
  getSubmittedAt: (item: T) => Date,
  now: Date = new Date()
): SubmittedAtGroup<T>[] {
  const groups: SubmittedAtGroup<T>[] = []
  let currentKey: string | null = null

  for (const item of items) {
    const submittedAt = getSubmittedAt(item)
    const key = getSubmittedAtGroupKey(submittedAt)

    if (key !== currentKey) {
      groups.push({
        key,
        label: formatSubmittedAtGroupLabel(submittedAt, now),
        items: [item],
      })
      currentKey = key
    } else {
      groups[groups.length - 1].items.push(item)
    }
  }

  return groups
}
