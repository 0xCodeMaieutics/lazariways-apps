'use client'

import { cn } from '@/lib/utils'
import { useCountdown } from '@/utils/useCountdown'
import {
    ChevronLeft,
    FlameIcon,
    HeartCrack,
    TargetIcon,
    PartyPopper,
} from 'lucide-react'
import Link from 'next/link'
import { PropsWithChildren, ReactNode } from 'react'
import { ClassValue } from 'clsx'
import type {
    LearningAppExam,
    LearningAppUserExamAggregation,
    LearningAppUserExam,
} from '@workspace/database/browser'

export function ExamResult({
    completion,
    exam,
    aggregation,
}: {
    completion: Pick<LearningAppUserExam, 'correctCount' | 'hasPassed' | 'passCounted'>
    exam: Pick<
        LearningAppExam,
        | 'topicId'
        | 'minimumCorrectAnswerCount'
        | 'minimumPassedCount'
        | 'waitUntilPassAllowedInSeconds'
    > & { exerciseCount: number }
    aggregation: Pick<
        LearningAppUserExamAggregation,
        'lastPassedAt' | 'passedCount'
    > | null
}) {
    const { hasPassed, passCounted, correctCount } = completion
    const { exerciseCount } = exam
    const { passedCount = 0, lastPassedAt = null } = aggregation ?? {}
    const examFullyCompleted = passedCount >= exam.minimumPassedCount

    const lastPassedAtTime =
        lastPassedAt === null ? null : new Date(lastPassedAt).getTime()

    const countdownTarget =
        lastPassedAtTime === null
            ? null
            : new Date(
                  lastPassedAtTime + exam.waitUntilPassAllowedInSeconds * 1000
              )

    return (
        <div className="flex h-dvh flex-col items-center justify-center gap-12 px-4">
            <span className={cn('text-foreground text-2xl font-semibold')}>
                <span>
                    {hasPassed
                        ? 'სავარჯიშო წარმატებით ჩააბარეთ!'
                        : 'სავარჯიშო სამწუხაროდ ვერ ჩააბარეთ.'}
                </span>
                <span className="ml-3 inline-flex">
                    {hasPassed ? (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-400">
                            <PartyPopper className="size-5" />
                        </div>
                    ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-700">
                            <HeartCrack className="size-5 stroke-3" />
                        </div>
                    )}
                </span>
            </span>
            {hasPassed && !passCounted && (
                <span className="text-muted-foreground text-center text-sm">
                    ჩაბარება ჩაითვლება ტაიმერის ამოწურვის შემდეგ. სანამდის
                    შეგიძლიათ ივარჯიშოთ!
                </span>
            )}
            <div className="flex w-full gap-3.5">
                <ResultContainer
                    title="სწორად უპასუხე"
                    className={{
                        'bg-emerald-400': hasPassed,
                        'bg-red-600': !hasPassed,
                    }}
                >
                    <div
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-full',
                            {
                                'bg-emerald-400': hasPassed,
                                'bg-red-700': !hasPassed,
                            }
                        )}
                    >
                        <FlameIcon className={cn('fill-white')} />
                    </div>
                    <span className="text-xl font-bold">
                        {Math.round((correctCount / exerciseCount) * 100)}%
                    </span>
                </ResultContainer>
                {!hasPassed && (
                    <ResultContainer
                        title="ჩაბარების მოთხოვნა"
                        className="bg-primary"
                    >
                        <div className="bg-primary flex size-10 items-center justify-center rounded-full">
                            <TargetIcon className="size-6" />
                        </div>
                        <span className="text-xl font-bold">
                            {Math.round(
                                (exam.minimumCorrectAnswerCount /
                                    exerciseCount) *
                                    100
                            )}
                            %
                        </span>
                    </ResultContainer>
                )}
            </div>
            <ExamResultTimer
                countdownTarget={countdownTarget}
                showTimer={hasPassed && !examFullyCompleted}
            />
            <div className="flex w-full max-w-xs flex-col gap-y-2">
                <ContinueButton className="gap-x-1.5">
                    <Link
                        href={`/topics/${exam.topicId}/exams`}
                        className="flex h-full w-full items-center justify-center gap-2"
                    >
                        <ChevronLeft className="animate-bounce-right" />
                        <span>ვარჯიშებთან წასვლა</span>
                    </Link>
                </ContinueButton>
            </div>
        </div>
    )
}

function ResultContainer({
    title,
    children,
    className,
}: PropsWithChildren<{
    title: string
    className?: ClassValue
}>) {
    return (
        <div
            className={cn(
                'flex flex-1 flex-col gap-y-2.5 rounded-2xl p-0.5',
                className
            )}
        >
            <span className="text-background flex-1 text-center text-xs font-semibold">
                {title}
            </span>
            <div className="bg-background flex items-center justify-center gap-x-2 rounded-2xl p-2 py-5">
                {children}
            </div>
        </div>
    )
}

function ExamResultTimer({
    showTimer,
    countdownTarget,
}: {
    showTimer: boolean
    countdownTarget: Date | null
}) {
    const { hours, minutes, seconds, isComplete } = useCountdown(
        showTimer ? countdownTarget : null
    )

    if (showTimer && isComplete && countdownTarget !== null) {
        return (
            <span className="text-sm text-emerald-400">
                ჩაბარება შესაძლებელია
            </span>
        )
    }
    return (
        showTimer &&
        !isComplete && (
            <div className="text-muted-foreground flex flex-col items-center gap-1 text-sm">
                <span>შემდეგი ჩაბარება შესაძლებელია:</span>
                <span className="text-foreground text-lg font-bold tabular-nums">
                    {String(hours).padStart(2, '0')}:
                    {String(minutes).padStart(2, '0')}:
                    {String(seconds).padStart(2, '0')}
                </span>
            </div>
        )
    )
}

function ContinueButton({
    onClick,
    disabled = false,
    className,
    prefix,
    children,
}: PropsWithChildren<{
    onClick?: () => void
    disabled?: boolean
    className?: string
    prefix?: ReactNode
}>) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn('group h-12 w-full rounded-2xl bg-gray-600', {
                'opacity-50': disabled,
            })}
        >
            <span
                className={cn(
                    'bg-primary text-primary-foreground flex h-12 w-full -translate-y-1.5 items-center justify-center rounded-2xl text-sm font-bold outline-offset-4',
                    {
                        'group-active:-translate-y-0.5': !disabled,
                    },
                    className
                )}
            >
                {prefix}
                {children}
            </span>
        </button>
    )
}
