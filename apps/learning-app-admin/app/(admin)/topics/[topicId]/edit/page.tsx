import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeft } from "lucide-react"
import prisma from "@workspace/database/client"
import { EditTopicForm } from "./page.client"

async function TopicsEditPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = await params

  const topics = await prisma.topic.findMany({
    orderBy: {
      order: "asc",
    },
  })
  const currentTopic = topics.find((topic) => topic.id === topicId) ?? null

  if (currentTopic === null) return <>Topic not found</>

  const otherTopics = topics.filter((topic) => topic.id !== topicId)

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/topics" className="flex items-center gap-2">
            <ChevronLeft className="size-4" />
            Back to topics
          </Link>
        </Button>
      </div>
      <EditTopicForm topics={otherTopics} currentTopic={currentTopic} />
    </div>
  )
}

export default TopicsEditPage
