"use client"
import type { Exam, Topic, UserExamAggregation } from "@lazariways/database/browser"
import { Button } from "@lazariways/ui/components/button"
import { Card, CardContent } from "@lazariways/ui/components/card"
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
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Banner } from "@/components/ui/banner"
import { cn } from "@/lib/utils"
import { useExamLogic } from "@/utils/use-exam-logic"
import { useCountdown } from "@/utils/useCountdown"

function ExamCardTimer({ hasPassed, countdownTarget }: { hasPassed: boolean; countdownTarget: Date | null }) {
  const { hours, minutes, seconds, isComplete } = useCountdown(countdownTarget)

  if (!hasPassed && isComplete && countdownTarget !== null) {
    return <span className="text-xxs font-medium text-emerald-700">ჩაბარება შესაძლებელია</span>
  }

  return (
    !hasPassed &&
    !isComplete &&
    countdownTarget !== null && (
      <span className="text-xxs flex items-center gap-0.5 font-medium text-amber-700 tabular-nums">
        <Clock className="size-3" />
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    )
  )
}

type ExamListItem = Exam & {
  _count: {
    exercises: number
  }
  userExamAggregation: UserExamAggregation[]
  isUnlocked: boolean
}

function ExamCard({ exam }: { exam: ExamListItem }) {
  const { topicId } = useParams()
  const userExamAggregation = exam.userExamAggregation.find((userExam) => userExam.examId === exam.id) ?? null

  const { countdownTarget, examPassedCount, hasExamPassed } = useExamLogic({
    exam,
    userExamAggregation,
  })

  const progressPercent =
    examPassedCount < exam.minimumPassedCount
      ? Math.round((examPassedCount / exam.minimumPassedCount) * 100)
      : 100

  const isCardUnlocked = exam.isUnlocked

  return (
    <Link
      href={`/topics/${topicId}/exams/${exam.id}/exercises`}
      aria-disabled={isCardUnlocked === false}
      tabIndex={isCardUnlocked === false ? -1 : undefined}
      className={cn(
        "block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isCardUnlocked === false && "pointer-events-none"
      )}
    >
      <Card
        className={cn(
          "group relative gap-0 overflow-hidden py-0 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
          {
            "border-emerald-200 bg-linear-to-r from-emerald-50 via-green-50 to-teal-50 hover:border-emerald-300":
              hasExamPassed,
            "bg-muted/60 text-muted-foreground shadow-none": isCardUnlocked === false,
          }
        )}
      >
        <CardContent className="space-y-3 px-4 py-4 pl-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {hasExamPassed && isCardUnlocked ? (
                  <CircleCheck className="size-4 text-emerald-600" />
                ) : !hasExamPassed && isCardUnlocked ? (
                  <Circle className="size-4 text-primary" />
                ) : (
                  <Lock className="size-4 text-muted-foreground" />
                )}

                <span
                  className={cn("transition-color text-sm leading-tight font-semibold", {
                    "text-emerald-800": hasExamPassed,
                  })}
                >
                  {exam.title}
                </span>
              </div>
            </div>
            {isCardUnlocked === true && hasExamPassed === false && (
              <ChevronRight className="animate-bounce-left size-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {exam.estimatedTimeInMinutes !== null && (
              <span className="text-xxs flex items-center gap-0.5 text-muted-foreground">
                <Clock
                  className={cn("size-3 stroke-primary", {
                    "stroke-emerald-600": hasExamPassed,
                  })}
                />
                {exam.estimatedTimeInMinutes} წთ
              </span>
            )}
            <span className="text-xxs flex items-center gap-0.5 text-muted-foreground">
              <Target
                className={cn("size-3 stroke-primary", {
                  "stroke-emerald-600": hasExamPassed,
                })}
              />
              {progressPercent}%
            </span>
            <ExamCardTimer hasPassed={hasExamPassed} countdownTarget={countdownTarget} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ExamsEmpty() {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <BookOpen className="size-8 text-muted-foreground/60" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">ჯერ გამოცდები არ არის</h2>
      <p className="mt-1.5 max-w-[260px] text-sm text-muted-foreground">
        ამ თემისთვის გამოცდები ჯერ არ არის დამატებული.
      </p>
    </div>
  )
}

export function Exams({ exams, topic }: { exams: ExamListItem[]; topic: Pick<Topic, "type" | "name"> }) {
  const isAllExamsPassed =
    exams.length > 0 &&
    exams.every((exam) => {
      const completion = exam.userExamAggregation.find((c) => c.examId === exam.id) ?? null
      return completion !== null && completion.passedCount >= exam.minimumPassedCount
    })

  return (
    <div className="flex flex-col gap-2 px-4 py-2 pb-6">
      <div className="flex">
        <Button asChild variant={"link"} className="flex items-center gap-1">
          <Link href={"/topics"}>
            <ChevronLeft className="animate-bounce-right" />
            <span className="text-xs">უკან წასვლა</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-8">
        {isAllExamsPassed && (
          <Banner className="flex flex-col items-start gap-y-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100">
                <Flame className="size-5 text-violet-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-violet-900">
                  გილოცავთ,{" "}
                  {
                    {
                      STARTER: "სტარტერის",
                      BAECKER: topic.name,
                      KOCH: topic.name,
                      KELLNER: topic.name,
                      MASSEUR: topic.name,
                    }[topic.type]
                  }{" "}
                  ყველა ვარჯიშები წარმატებით ჩააბარეთ
                </p>
              </div>
            </div>
            <Button size="sm" variant="link" className="shrink-0 border-violet-300 text-violet-700" asChild>
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
