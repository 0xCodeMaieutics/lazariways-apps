import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeft } from "lucide-react"
import { CreateTopicForm } from "./page.client"
import prisma from "@workspace/database/client"

export default async function NewTopicPage() {
  const [lastTopic, parentTopics] = await Promise.all([
    prisma.topic.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    }),
    prisma.topic.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ])

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
      <CreateTopicForm
        parentTopics={parentTopics}
        defaultValues={{ order: (lastTopic?.order ?? -1) + 1 }}
      />
    </div>
  )
}
