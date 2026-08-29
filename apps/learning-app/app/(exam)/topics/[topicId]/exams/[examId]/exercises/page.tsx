import { Exam } from './page.client'
import { auth } from '@/lib/auth.server'
import { prisma } from '@workspace/database/client'
import { getSignedUrlForDownload } from '@workspace/file-upload/s3-client'
import { env } from '@/env'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpenCheck, ChevronLeft } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { headers } from 'next/headers'

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

    if (user === null) return redirect('/login')

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
                    order: 'asc',
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
                <div className="bg-muted mb-6 flex size-20 items-center justify-center rounded-full">
                    <BookOpenCheck className="text-muted-foreground size-10" />
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                    ამ გამოცდისთვის სავარჯიშოები ჯერ არ არის დამატებული.
                </h2>

                <Button
                    asChild
                    variant={'link'}
                    className="mt-8 flex items-center gap-2"
                >
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

    return (
        <Exam
            userCompletions={exam.userExamAggregation}
            exam={exam}
            exercises={exercisesWithAudioUrls}
        />
    )
}
