export function isTopicUnlockedForUser({
  isAlwaysUnlocked,
  topicId,
  unlockedTopicIds,
}: {
  isAlwaysUnlocked: boolean
  topicId: string
  unlockedTopicIds: ReadonlySet<string>
}) {
  return isAlwaysUnlocked || unlockedTopicIds.has(topicId)
}
