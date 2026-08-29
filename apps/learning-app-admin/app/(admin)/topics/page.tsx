import prisma from '@workspace/database/client'
import { TopicsList } from './page.client'

export default async function AdminTopics() {
    const topics = await prisma.topic.findMany({
        orderBy: {
            order: 'asc',
        },
    })
    return <TopicsList topics={topics} />
}
