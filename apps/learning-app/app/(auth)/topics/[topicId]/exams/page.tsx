import { auth } from '@/lib/auth.server'
import { prisma } from '@workspace/database/client'
import { notFound, redirect } from 'next/navigation'
import { Exams } from './page.client'
import { headers } from 'next/headers'

export default async function TopicExamsPage({
    params,
}: {
    params: Promise<{ topicId: string }>
}) {
    const { topicId } = await params

    const user = await auth.api.getSession({
        headers: await headers(),
    })
    if (user === null) redirect('/login')

    const dbUser = await prisma.user.findUnique({
        where: {
            id: user.user.id,
        },
    })
    if (dbUser === null) redirect('/login')

    const topic = await prisma.topic.findFirst({
        where: {
            id: topicId,
            enabled: true,
        },
        select: { id: true, type: true, name: true },
    })
    if (topic === null) notFound()

    const exams = await prisma.exam.findMany({
        where: {
            topicId,
            enable: true,
        },
        include: {
            userExamAggregation: {
                where: {
                    userId: user.user.id,
                },
            },
            _count: {
                select: {
                    exercises: true,
                },
            },
            userUnlockedExams: {
                where: {
                    userId: dbUser.id,
                },
                select: {
                    examId: true,
                },
            },
        },
        orderBy: {
            order: 'asc',
        },
    })

    const { id, ...propsTopic } = topic

    return <Exams topic={propsTopic} exams={exams} />
}
