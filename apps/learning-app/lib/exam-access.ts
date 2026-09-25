export function isExamUnlockedForUser({
  isAlwaysUnlocked,
  examId,
  unlockedExamIds,
}: {
  isAlwaysUnlocked: boolean
  examId: string
  unlockedExamIds: ReadonlySet<string>
}) {
  return isAlwaysUnlocked || unlockedExamIds.has(examId)
}
