import prisma from '@workspace/database/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { ExerciseForm } from '@/app/(admin)/_components/forms/exercise-form'

export default async function EditExercisePage({
    params,
}: {
    params: Promise<{
        programId: string
        examId: string
        exerciseId: string
    }>
}) {
    const { programId, examId, exerciseId } = await params

    const exercise = await prisma.exercise.findFirst({
        where: {
            id: exerciseId,
            examId,
            exam: {
                topicId: programId,
            },
        },
    })

    if (!exercise) {
        notFound()
    }

    const defaultValues = {
        type: exercise.type,
        prompt: exercise.prompt ?? '',
        text: exercise.text ?? '',
        order: exercise.order,
        audioUrl: exercise.audioUrl ?? '',
        slowAudioUrl: exercise.slowAudioUrl ?? '',
        optionsText: exercise.options.join('\n'),
        correctOptionIndexText: exercise.correctOptionIndex.join(', '),
        allowsMultipleCorrectOptions:
            exercise.allowsMultipleCorrectOptions ?? false,
        correctInputsText: exercise.correctInputs.join('\n'),
    }

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
                exerciseId={exerciseId}
                defaultValues={defaultValues}
            />
        </div>
    )
}
