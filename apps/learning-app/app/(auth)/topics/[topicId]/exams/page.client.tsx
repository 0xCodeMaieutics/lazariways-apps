'use client'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Circle,
    CircleCheck,
    Clock,
    Flame,
    Lock,
    Target,
} from 'lucide-react'
import type {
    Exam,
    Topic,
    UserExamAggregation,
    UserUnlockedExam,
} from '@workspace/database/browser'
import Link from 'next/link'
import { Banner } from '@/components/ui/banner'
import { useCountdown } from '@/utils/useCountdown'
import { useExamLogic } from '@/utils/use-exam-logic'
import { useParams } from 'next/navigation'

function ExamCardTimer({
    hasPassed,
    countdownTarget,
}: {
    hasPassed: boolean
    countdownTarget: Date | null
}) {
    const { hours, minutes, seconds, isComplete } =
        useCountdown(countdownTarget)

    if (!hasPassed && isComplete && countdownTarget !== null) {
        return (
            <span className="text-xxs text-emerald-400">
                ჩაბარება შესაძლებელია
            </span>
        )
    }

    return (
        !hasPassed &&
        !isComplete &&
        countdownTarget !== null && (
            <span className="text-xxs flex items-center gap-0.5 text-amber-600 tabular-nums dark:text-amber-400">
                <Clock className="size-3" />
                {String(hours).padStart(2, '0')}:
                {String(minutes).padStart(2, '0')}:
                {String(seconds).padStart(2, '0')}
            </span>
        )
    )
}

function ExamCard({
    exam,
}: {
    exam: Exam & {
        _count: {
            exercises: number
        }
        userExamAggregation: UserExamAggregation[]
        userUnlockedExams: Pick<UserUnlockedExam, 'examId'>[]
    }
}) {
    const { topicId } = useParams()
    const userExamAggregation =
        exam.userExamAggregation.find(
            (userExam) => userExam.examId === exam.id
        ) ?? null

    const { countdownTarget, examPassedCount, hasExamPassed } = useExamLogic({
        exam,
        userExamAggregation,
    })

    const progressPercent =
        examPassedCount < exam.minimumPassedCount
            ? Math.round((examPassedCount / exam.minimumPassedCount) * 100)
            : 100

    const isCardUnlocked = exam.userUnlockedExams.some(
        (unlockedExam) => unlockedExam.examId === exam.id
    )

    return (
        <Link
            href={`/topics/${topicId}/exams/${exam.id}/exercises`}
            className={cn(isCardUnlocked === false && 'pointer-events-none')}
        >
            <Card
                className={cn(
                    'group relative gap-0 overflow-hidden py-0 transition-all',
                    {
                        'border-emerald-200 bg-linear-to-r from-emerald-50 via-green-50 to-teal-50 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/40':
                            hasExamPassed,
                        'opacity-50': isCardUnlocked === false,
                    }
                )}
            >
                <CardContent className="space-y-3 px-4 py-4 pl-5">
                    <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                {hasExamPassed && isCardUnlocked ? (
                                    <CircleCheck className="size-4 text-emerald-400" />
                                ) : !hasExamPassed && isCardUnlocked ? (
                                    <Circle className="size-4" />
                                ) : (
                                    <Lock className="size-4" />
                                )}

                                <span
                                    className={cn(
                                        'transition-color text-sm leading-tight font-semibold',
                                        {
                                            'text-emerald-200': hasExamPassed,
                                        }
                                    )}
                                >
                                    {exam.title}
                                </span>
                            </div>
                        </div>
                        {isCardUnlocked === true && hasExamPassed === false && (
                            <ChevronRight className="text-muted-foreground animate-bounce-left size-4" />
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {exam.estimatedTimeInMinutes !== null && (
                            <span className="text-muted-foreground text-xxs flex items-center gap-0.5">
                                <Clock
                                    className={cn('stroke-primary size-3', {
                                        'stroke-emerald-600': hasExamPassed,
                                    })}
                                />
                                {exam.estimatedTimeInMinutes} წთ
                            </span>
                        )}
                        <span className="text-muted-foreground text-xxs flex items-center gap-0.5">
                            <Target
                                className={cn('stroke-primary size-3', {
                                    'stroke-emerald-600': hasExamPassed,
                                })}
                            />
                            {progressPercent}%
                        </span>
                        <ExamCardTimer
                            hasPassed={hasExamPassed}
                            countdownTarget={countdownTarget}
                        />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function ExamsEmpty() {
    return (
        <div className="flex flex-col items-center px-4 py-16 text-center">
            <div className="bg-muted flex size-16 items-center justify-center rounded-full">
                <BookOpen className="text-muted-foreground/60 size-8" />
            </div>
            <h2 className="mt-5 text-lg font-semibold">
                ჯერ გამოცდები არ არის
            </h2>
            <p className="text-muted-foreground mt-1.5 max-w-[260px] text-sm">
                ამ თემისთვის გამოცდები ჯერ არ არის დამატებული.
            </p>
        </div>
    )
}

export function Exams({
    exams,
    topic,
}: {
    exams: (Exam & {
        _count: {
            exercises: number
        }
        userExamAggregation: UserExamAggregation[]
        userUnlockedExams: Pick<UserUnlockedExam, 'examId'>[]
    })[]
    topic: Pick<Topic, 'type' | 'name'>
}) {
    const isAllExamsPassed =
        exams.length > 0 &&
        exams.every((exam) => {
            const completion =
                exam.userExamAggregation.find((c) => c.examId === exam.id) ??
                null
            return (
                completion !== null &&
                completion.passedCount >= exam.minimumPassedCount
            )
        })

    return (
        <div className="flex flex-col gap-2 px-4 py-2 pb-6">
            <div className="flex">
                <Button
                    asChild
                    variant={'link'}
                    className="flex items-center gap-1"
                >
                    <Link href={'/topics'}>
                        <ChevronLeft className="animate-bounce-right" />
                        <span className="text-xs">უკან წასვლა</span>
                    </Link>
                </Button>
            </div>
            <div className="flex flex-col gap-8">
                {isAllExamsPassed && (
                    <Banner className="flex flex-col items-start gap-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
                                <Flame className="size-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                                    გილოცავთ,{' '}
                                    {
                                        {
                                            STARTER: 'სტარტერის',
                                            BAECKEREI: topic.name,
                                            FREIZEIT_PARK: topic.name,
                                        }[topic.type]
                                    }{' '}
                                    ყველა ვარჯიშები წარმატებით ჩააბარეთ
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="link"
                            className="shrink-0 border-violet-300 text-violet-700 dark:text-violet-300"
                            asChild
                        >
                            <Link href="/profile">
                                <ChevronLeft className="animate-bounce-left size-4" />
                                გადადით პროფილზე
                            </Link>
                        </Button>
                    </Banner>
                )}
                {exams.length === 0 ? (
                    <ExamsEmpty />
                ) : (
                    <div className="flex flex-col gap-3">
                        {exams.map((exam) => (
                            <ExamCard key={exam.id} exam={exam} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
