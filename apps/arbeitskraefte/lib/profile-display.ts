export function formatMaskedName(firstName: string, lastName: string): string {
  const initial = lastName.trim().charAt(0)
  if (initial === "") {
    return firstName
  }

  return `${firstName} ${initial}.`
}

export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const hasNotHadBirthdayThisYear =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate())

  if (hasNotHadBirthdayThisYear) {
    age -= 1
  }

  return age
}

export function formatAgeLabel(birthDate: Date): string {
  return `${calculateAge(birthDate)} Jahre`
}

export function formatLanguages(
  languages: { language: string; level: string }[]
): string {
  return languages
    .map((entry) => `${entry.language} (${entry.level})`)
    .join(", ")
}
