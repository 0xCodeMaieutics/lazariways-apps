export function instagramProfileUrl(handle: string | undefined): string | null {
  const trimmed = handle?.trim() ?? ""
  if (trimmed === "") {
    return null
  }

  const username = trimmed.replace(/^@/, "")
  return `https://instagram.com/${username}`
}
