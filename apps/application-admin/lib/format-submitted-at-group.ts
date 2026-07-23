const TBILISI_TIME_ZONE = "Asia/Tbilisi"

interface TbilisiDateParts {
  year: number
  month: number
  day: number
}

interface SubmittedAtGroup<T> {
  key: string
  label: string
  items: T[]
}

function getTbilisiDateParts(date: Date): TbilisiDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TBILISI_TIME_ZONE,
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

function getDaysAgoInTbilisi(date: Date, now: Date): number {
  const dateKey = getSubmittedAtGroupKey(date)
  const nowKey = getSubmittedAtGroupKey(now)
  const [dateYear, dateMonth, dateDay] = dateKey.split("-").map(Number)
  const [nowYear, nowMonth, nowDay] = nowKey.split("-").map(Number)
  const utcDate = Date.UTC(dateYear, dateMonth - 1, dateDay)
  const utcNow = Date.UTC(nowYear, nowMonth - 1, nowDay)

  return Math.round((utcNow - utcDate) / (24 * 60 * 60 * 1000))
}

export function getSubmittedAtGroupKey(date: Date): string {
  const { year, month, day } = getTbilisiDateParts(date)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function formatSubmittedAtGroupLabel(
  date: Date,
  now: Date = new Date()
): string {
  const daysAgo = getDaysAgoInTbilisi(date, now)

  if (daysAgo === 0) {
    return "დღეს"
  }

  if (daysAgo === 1) {
    return "გუშინ"
  }

  const weekday = new Intl.DateTimeFormat("ka-GE", {
    timeZone: TBILISI_TIME_ZONE,
    weekday: "long",
  }).format(date)

  const { year } = getTbilisiDateParts(date)
  const nowYear = getTbilisiDateParts(now).year
  const includeYear = year !== nowYear

  const dayMonth = new Intl.DateTimeFormat("ka-GE", {
    timeZone: TBILISI_TIME_ZONE,
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
