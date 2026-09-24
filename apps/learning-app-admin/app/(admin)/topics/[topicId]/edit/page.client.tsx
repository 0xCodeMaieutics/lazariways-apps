"use client"

import { Topic } from "@workspace/database/browser"
import { TopicForm } from "../../../_components/forms/topic-form"

export function EditTopicForm({
  topics,
  currentTopic,
}: {
  topics: Topic[]
  currentTopic: Topic
}) {
  return (
    <TopicForm
      topicId={currentTopic.id}
      parentTopics={topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
      }))}
      defaultValues={{
        name: currentTopic.name,
        type: currentTopic.type,
        order: currentTopic.order,
        enabled: currentTopic.enabled,
        isAlwaysUnlocked: currentTopic.isAlwaysUnlocked,
        unlockedByTopicId: currentTopic.unlockedId ?? "",
        minimumCompletedExamsToUnlock:
          currentTopic.minimumCompletedExamsToUnlock ?? "",
      }}
    />
  )
}
