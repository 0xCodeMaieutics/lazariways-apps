import { auth } from '@/lib/auth.server'
import { prisma } from '@workspace/database/client'
import { redirect } from 'next/navigation'
import { TopicsHub } from './page.client'
import { headers } from 'next/headers'
import { LearningAppTopicType } from '@workspace/database/browser'

export default async function TopicsPage() {
    const user = await auth.api.getSession({
        headers: await headers(),
    })
    if (user === null) redirect('/login')

    const dbUser = await prisma.learningAppUser.findUnique({
        where: { id: user.user.id },
    })
    if (dbUser === null) redirect('/login')

    const topics = await prisma.learningAppTopic.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' },
        include: {
            exams: {
                select: {
                    topicId: true,
                    minimumPassedCount: true,
                    userExamAggregation: {
                        where: { userId: user.user.id },
                        select: { passedCount: true },
                    },
                },
            },
        },
    })

    const topicRows: {
        id: string
        type: LearningAppTopicType
        name: string
        totalExams: number
        completedExams: number
    }[] = []

    for (const topic of topics) {
        let totalExamsAmount = 0
        let completedExamsAmount = 0
        for (const exam of topic.exams) {
            totalExamsAmount += 1
            const agg = exam.userExamAggregation[0]
            if (
                agg !== undefined &&
                agg.passedCount >= exam.minimumPassedCount
            ) {
                completedExamsAmount += 1
            }
        }
        topicRows.push({
            id: topic.id,
            type: topic.type,
            name: topic.name,
            totalExams: totalExamsAmount,
            completedExams: completedExamsAmount,
        })
    }

    return <TopicsHub topics={topicRows} />
}
