import type { VacancyDetails } from "./vacancy-details"

export interface VacancyTemplate {
  id: string
  name: string
  jobTitle: string
  icon: string
  defaultDetails: VacancyDetails
}

export const VACANCY_TEMPLATES: readonly VacancyTemplate[] = [
  {
    id: "bakery-sales",
    name: "საცხობი – გამყიდველი",
    jobTitle: "საცხობში გამყიდველის პოზიცია",
    icon: "🥨",
    defaultDetails: {
      employmentDuration: 8,
      wageAmount: 14,
      wagePeriod: "HOUR",
      germanLevel: "A2",
      highlight: "",
    },
  },
  {
    id: "restaurant-chef",
    name: "რესტორანი – მზარეული",
    jobTitle: "რესტორანში მზარეულის პოზიცია",
    icon: "👨‍🍳",
    defaultDetails: {
      employmentDuration: 8,
      wageAmount: 16,
      wagePeriod: "HOUR",
      germanLevel: "A2",
      highlight: "",
    },
  },
  {
    id: "restaurant-waiter",
    name: "რესტორანი – ოფიციანტი",
    jobTitle: "რესტორანში ოფიციანტის პოზიცია",
    icon: "🍽️",
    defaultDetails: {
      employmentDuration: 8,
      wageAmount: 14,
      wagePeriod: "HOUR",
      germanLevel: "A2",
      highlight: "",
    },
  },
  {
    id: "hotel-masseuse",
    name: "სასტუმრო – მასაჟისტი",
    jobTitle: "სასტუმროში მასაჟისტის პოზიცია",
    icon: "💆",
    defaultDetails: {
      employmentDuration: 8,
      wageAmount: 15,
      wagePeriod: "HOUR",
      germanLevel: "A2",
      highlight: "",
    },
  },
]

export function findVacancyTemplate(id: string): VacancyTemplate | undefined {
  return VACANCY_TEMPLATES.find((template) => template.id === id)
}
