import prisma from '@workspace/database/client'
import { notFound } from 'next/navigation'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ExamExercisesTable } from './page.client'

export default async function ExamDetailPage({
    params,
}: {
    params: Promise<{
        topicId: string
        examId: string
    }>
}) {
    const { topicId, examId } = await params

    const exam = await prisma.learningAppExam.findFirst({
        where: {
            id: examId,
            topicId,
        },
        include: {
            exercises: {
                orderBy: { order: 'asc' },
            },
        },
    })

    if (!exam) {
        notFound()
    }

    if (exam.exercises.length === 0) {
        return (
            <div className="px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">{exam.title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {exam.description}
                    </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                    <p className="text-muted-foreground text-lg">
                        No exercises in this exam yet.
                    </p>
                    <p className="text-muted-foreground max-w-md text-sm">
                        Create an exercise to add learning content for this
                        exam.
                    </p>
                    <Button asChild>
                        <Link
                            href={`/topics/${topicId}/exams/${examId}/exercises/new`}
                            className="flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            Create exercise
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{exam.title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {exam.description}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link
                            href={`/topics/${topicId}/exams/${examId}/exercises/new`}
                            className="flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            Create exercise
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="rounded-lg border">
                <ExamExercisesTable
                    exercises={exam.exercises}
                    topicId={topicId}
                    examId={examId}
                />
            </div>
        </div>
    )
}
