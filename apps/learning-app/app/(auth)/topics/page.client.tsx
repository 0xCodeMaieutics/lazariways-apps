"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  BookOpen,
  ChevronRight,
  Croissant,
  Lock,
  Puzzle,
  Rocket,
} from "lucide-react"
import Link from "next/link"
import { TopicType } from "@workspace/database/browser"

function TopicsEmpty() {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <BookOpen className="size-8 text-muted-foreground/60" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">თემები ჯერ არ არის</h2>
      <p className="mt-1.5 max-w-65 text-sm text-muted-foreground">
        ხელმისაწვდომი თემები მალე გამოჩნდება.
      </p>
    </div>
  )
}

export function TopicsHub({
  topics,
}: {
  topics: {
    id: string
    type: TopicType
    name: string
    totalExams: number
    completedExams: number
  }[]
}) {
  const starterTopic = topics.find(
    (topic) => topic.type === TopicType.STARTER
  )
  const starterAllDone =
    starterTopic === undefined
      ? false
      : starterTopic.totalExams > 0 &&
        starterTopic.completedExams >= starterTopic.totalExams
  return (
    <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      {topics.length === 0 ? (
        <TopicsEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {topics.map((topic) => {
            const isAllExamsPassed =
              topic.totalExams > 0 && topic.completedExams >= topic.totalExams
            const isLocked =
              topic.type !== TopicType.STARTER && !starterAllDone
            return (
              <Link
                key={topic.id}
                href={`/topics/${topic.id}/exams`}
                className={cn(
                  "block",
                  isLocked && "pointer-events-none opacity-40"
                )}
              >
                <Card
                  className={cn(
                    "group relative gap-0 overflow-hidden py-0 transition-all",
                    isAllExamsPassed &&
                      "border-emerald-200 bg-linear-to-r from-emerald-50 via-green-50 to-teal-50 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/40"
                  )}
                >
                  <CardContent className="relative flex flex-col gap-3 px-4 py-4 pl-5">
                    {isLocked ? (
                      <Lock className="absolute top-4 right-4 size-4 text-muted-foreground" />
                    ) : isAllExamsPassed === false ? (
                      <ChevronRight className="animate-bounce-left absolute top-4 right-4 size-4 text-muted-foreground" />
                    ) : null}
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary",
                        isAllExamsPassed &&
                          "bg-emerald-100 dark:bg-emerald-900/50"
                      )}
                    >
                      {
                        {
                          STARTER: (
                            <Rocket
                              className={cn(
                                "size-4",
                                isAllExamsPassed &&
                                  "text-emerald-600 dark:text-emerald-400"
                              )}
                            />
                          ),
                          BAECKEREI: (
                            <Croissant
                              className={cn(
                                "size-4",
                                isAllExamsPassed &&
                                  "text-emerald-600 dark:text-emerald-400"
                              )}
                            />
                          ),
                          FREIZEIT_PARK: (
                            <Puzzle
                              className={cn(
                                "size-4",
                                isAllExamsPassed &&
                                  "text-emerald-600 dark:text-emerald-400"
                              )}
                            />
                          ),
                        }[topic.type]
                      }
                    </div>
                    <div className="min-w-0 pr-6">
                      <span className="text-sm leading-tight font-semibold">
                        {topic.name}
                      </span>
                      <p className="text-xxs mt-1 text-muted-foreground">
                        {topic.completedExams}/{topic.totalExams}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
