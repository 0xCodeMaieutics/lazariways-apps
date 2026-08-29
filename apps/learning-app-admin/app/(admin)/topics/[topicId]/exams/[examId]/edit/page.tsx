import prisma from '@workspace/database/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { ExamForm } from '@/app/(admin)/_components/forms/exam-form'
import { formatSecondsAsHoursMinutes } from '@/utils/format-duration'

export default async function EditExamPage({
    params,
}: {
    params: Promise<{
        topicId: string
        examId: string
    }>
}) {
    const { topicId, examId } = await params

    const [exam, program] = await Promise.all([
        prisma.exam.findFirst({
            where: { id: examId },
        }),
        // TODO: this was program before so does not make sense
        prisma.topic.findUnique({
            where: { id: topicId },
        }),
    ])

    if (!exam || !program) {
        notFound()
    }

    return (
        <div className="px-6 py-8">
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm">
                    <Link
                        href={`/topics/${topicId}/exams`}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="size-4" />
                        Back to exams
                    </Link>
                </Button>
            </div>
            <ExamForm
                topicId={topicId}
                examId={examId}
                defaultValues={{
                    title: exam.title,
                    description: exam.description,
                    estimatedTimeInMinutes:
                        exam.estimatedTimeInMinutes ?? undefined,
                    minimumCorrectAnswerCount: exam.minimumCorrectAnswerCount,
                    minimumPassedCount: exam.minimumPassedCount,
                    passCooldown: formatSecondsAsHoursMinutes(
                        exam.waitUntilPassAllowedInSeconds
                    ),
                }}
            />
        </div>
    )
}
