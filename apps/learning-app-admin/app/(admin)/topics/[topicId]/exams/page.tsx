import { AdminExams } from './page.client'
import prisma from '@workspace/database/client'

export default async function AdminExamsPage({
    params: paramsPromise,
}: {
    params: Promise<{
        topicId: string
    }>
}) {
    const params = await paramsPromise

    const exams = await prisma.exam.findMany({
        where: {
            topicId: params.topicId,
        },
        orderBy: {
            order: 'asc',
        },
    })

    return <AdminExams exams={exams} />
}
