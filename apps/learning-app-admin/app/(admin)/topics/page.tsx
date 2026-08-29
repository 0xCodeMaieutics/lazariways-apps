import prisma from '@workspace/database/client'
import { TopicsList } from './page.client'

export default async function AdminTopics() {
    const topics = await prisma.learningAppTopic.findMany({
        orderBy: {
            order: 'asc',
        },
    })
    return <TopicsList topics={topics} />
}
