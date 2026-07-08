import prisma from '@workspace/database/client'

import { ApplicationForm } from './page.client'

export default async function Home() {
    const universities = await prisma.university.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
    })

    return <ApplicationForm universities={universities} />
}
