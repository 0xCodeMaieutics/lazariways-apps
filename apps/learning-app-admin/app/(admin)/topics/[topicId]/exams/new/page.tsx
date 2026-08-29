import prisma from '@workspace/database/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { ExamForm } from '@/app/(admin)/_components/forms/exam-form'

export default async function NewExamPage({
    params,
}: {
    params: Promise<{ topicId: string }>
}) {
    const { topicId } = await params

    const [program, lastExam] = await Promise.all([
        prisma.learningAppTopic.findUnique({
            where: { id: topicId },
        }),
        prisma.learningAppExam.findFirst({
            where: { topicId },
            orderBy: { order: 'desc' },
            select: { order: true },
        }),
    ])

    if (!program) {
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
                lastOrder={(lastExam?.order ?? -1) + 1}
            />
        </div>
    )
}
