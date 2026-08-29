import prisma from '@workspace/database/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { ExerciseForm } from '@/app/(admin)/_components/forms/exercise-form'

export default async function NewExercisePage({
    params,
}: {
    params: Promise<{
        programId: string
        weekId: string
        examId: string
    }>
}) {
    const { programId, weekId, examId } = await params

    const exam = await prisma.learningAppExam.findFirst({
        where: {
            id: examId,
            // TODO: the validity of this code needs to be changed
            topicId: programId,
        },
    })

    if (!exam) {
        notFound()
    }

    const nextOrder =
        (
            await prisma.learningAppExercise.findMany({
                where: { examId },
                select: { order: true },
                orderBy: { order: 'desc' },
                take: 1,
            })
        )[0]?.order ?? -1

    return (
        <div className="px-6 py-8">
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm">
                    <Link
                        href={`/topics/${programId}/exams/${examId}/exercises`}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="size-4" />
                        Back to exercises
                    </Link>
                </Button>
            </div>
            <ExerciseForm
                programId={programId}
                examId={examId}
                defaultValues={{ order: nextOrder + 1 }}
            />
        </div>
    )
}
