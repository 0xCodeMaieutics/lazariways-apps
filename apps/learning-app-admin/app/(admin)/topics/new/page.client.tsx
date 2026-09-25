"use client"

import { TopicForm } from "../../_components/forms/topic-form"

export function CreateTopicForm({
  parentTopics,
  defaultValues,
}: {
  parentTopics: { id: string; name: string }[]
  defaultValues?: { order: number }
}) {
  return <TopicForm parentTopics={parentTopics} defaultValues={defaultValues} />
}
