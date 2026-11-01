import { prisma } from "@lazariways/database/client"
import { getSignedUrlForDownload } from "@lazariways/file-upload/s3-client"
import { Button } from "@lazariways/ui/components/button"
import { BookOpenCheck, ChevronLeft } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { env } from "@/env"
import { auth } from "@/lib/auth.server"

import { Exam } from "./page.client"

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{
    weekId: string
    examId: string
  }>
}) {
  const { examId } = await params

  const user = await auth.api.getSession({
    headers: await headers(),
  })

  if (user === null) return redirect("/login")

  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
    include: {
      userExamAggregation: {
        where: {
          userId: user.user.id,
          examId: examId,
        },
      },
      exercises: {
        where: {
          examId,
        },
        orderBy: {
          order: "asc",
        },
        include: {
          matchingPairs: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  if (exam === null) notFound()

  const exercises = exam?.exercises

  if (exercises === null) {
    notFound()
  }

  if (exercises.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
          <BookOpenCheck className="size-10 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight">
          ამ გამოცდისთვის სავარჯიშოები ჯერ არ არის დამატებული.
        </h2>

        <Button asChild variant={"link"} className="mt-8 flex items-center gap-2">
          <Link href={`/topics/${exam.topicId}/exams`}>
            <ChevronLeft className="animate-bounce-right" />
            <span>გამოცდებზე დაბრუნება</span>
          </Link>
        </Button>
      </div>
    )
  }

  const exercisesWithAudioUrls = await Promise.all(
    exercises.map(async (exercise) => ({
      ...exercise,
      audioUrl: exercise.audioUrl
        ? await getSignedUrlForDownload({
            bucket: env.S3_BUCKET_NAME,
            fileKey: exercise.audioUrl,
          })
        : exercise.audioUrl,
    }))
  )

  return <Exam userCompletions={exam.userExamAggregation} exam={exam} exercises={exercisesWithAudioUrls} />
}
