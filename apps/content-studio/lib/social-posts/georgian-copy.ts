import type { EmploymentDuration, GermanLevel, WagePeriod } from "./vacancy-details"

const NO_BREAK_SPACE = "\u00A0"

const WAGE_PERIOD_LABELS: Record<WagePeriod, string> = {
  HOUR: "საათში",
  MONTH: "თვეში",
}

export const JOB_TITLE_LABEL = "ვაკანსია:"
export const WAGE_LABEL = "ანაზღაურება:"
export const APPLY_CALL_TO_ACTION = "განაცხადის შესავსებად გადადით:"

export function formatEmploymentDuration(duration: EmploymentDuration): string {
  if (duration === "PERMANENT") {
    return "მუდმივი დასაქმება გერმანიაში!"
  }

  return `${duration}-თვიანი დასაქმება გერმანიაში!`
}

export function formatWage(amount: number, period: WagePeriod): string {
  return `${formatEuroAmount(amount)} € / ${WAGE_PERIOD_LABELS[period]}`
}

export function formatGermanLevel(level: GermanLevel): string {
  if (level === "NONE") {
    return "გერმანული ენის ცოდნა აუცილებელი არ არის"
  }

  return `გერმანული ენის ცოდნა ${level} დონეზე აუცილებელია`
}

function formatEuroAmount(amount: number): string {
  const [integerPart, fractionPart] = amount.toFixed(Number.isInteger(amount) ? 0 : 2).split(".")
  const groupedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, NO_BREAK_SPACE)

  return fractionPart === undefined ? groupedIntegerPart : `${groupedIntegerPart},${fractionPart}`
}
