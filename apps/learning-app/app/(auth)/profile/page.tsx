import { auth } from '@/lib/auth.server'
import { prisma } from '@workspace/database/client'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ProfileClient } from './page.client'
import { getSignedUrlForDownload } from '@workspace/file-upload/s3-client'
import { env } from '@/env'

const XP_PER_ATTEMPT = 10
const XP_PER_PASS = 25

function getClassification(xp: number): 'bronze' | 'silver' | 'gold' {
    if (xp >= 500) return 'gold'
    if (xp >= 100) return 'silver'
    return 'bronze'
}

function calculateStreakDays(completionDates: Date[]): number {
    if (completionDates.length === 0) return 0

    const uniqueDays = [
        ...new Set(completionDates.map((d) => d.toISOString().split('T')[0])),
    ].sort()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const mostRecentDay = new Date(
        uniqueDays[uniqueDays.length - 1] + 'T00:00:00'
    )
    if (mostRecentDay < yesterday) return 0

    let streak = 1
    for (let i = uniqueDays.length - 2; i >= 0; i--) {
        const current = new Date(uniqueDays[i + 1] + 'T00:00:00')
        const prev = new Date(uniqueDays[i] + 'T00:00:00')
        const diffMs = current.getTime() - prev.getTime()
        if (Math.round(diffMs / 86400000) === 1) {
            streak++
        } else {
            break
        }
    }

    return streak
}

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (session === null) redirect('/login')

    const [dbUser, aggregations, completions] = await Promise.all([
        prisma.learningAppUser.findUnique({
            where: { id: session.user.id },
        }),
        prisma.learningAppUserExamAggregation.findMany({
            where: { userId: session.user.id },
        }),
        prisma.learningAppUserExam.findMany({
            where: { userId: session.user.id },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
        }),
    ])

    if (dbUser === null) redirect('/login')

    const totalAttempts = aggregations.reduce(
        (sum, a) => sum + a.attemptedCount,
        0
    )
    const totalPassed = aggregations.reduce((sum, a) => sum + a.passedCount, 0)
    const totalXP = totalAttempts * XP_PER_ATTEMPT + totalPassed * XP_PER_PASS
    const classification = getClassification(totalXP)
    const streakDays = calculateStreakDays(completions.map((c) => c.createdAt))

    const signedImageUrl = dbUser.image
        ? await getSignedUrlForDownload({
              bucket: env.S3_BUCKET_NAME,
              fileKey: dbUser.image,
          })
        : null

    return (
        <ProfileClient
            profile={{
                name: dbUser.name,
                email: dbUser.email,
                image: signedImageUrl,
                joinedAt: dbUser.createdAt.toISOString(),
                totalXP,
                classification,
                streakDays,
                totalExamsPassed: totalPassed,
                totalExamsAttempted: totalAttempts,
            }}
        />
    )
}
