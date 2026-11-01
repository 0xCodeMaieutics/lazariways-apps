"use client"

import type { TopicType } from "@lazariways/database/browser"
import { Card, CardContent } from "@lazariways/ui/components/card"
import {
  BookOpen,
  ChefHat,
  ChevronRight,
  ConciergeBell,
  Croissant,
  HandHeart,
  Lock,
  Rocket,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

const TOPIC_ICONS: Record<TopicType, LucideIcon> = {
  STARTER: Rocket,
  BAECKER: Croissant,
  KOCH: ChefHat,
  KELLNER: ConciergeBell,
  MASSEUR: HandHeart,
}

function TopicsEmpty() {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <BookOpen className="size-8 text-muted-foreground/60" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">თემები ჯერ არ არის</h2>
      <p className="mt-1.5 max-w-65 text-sm text-muted-foreground">ხელმისაწვდომი თემები მალე გამოჩნდება.</p>
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
    isUnlocked: boolean
  }[]
}) {
  return (
    <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      {topics.length === 0 ? (
        <TopicsEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {topics.map((topic) => {
            const isAllExamsPassed = topic.totalExams > 0 && topic.completedExams >= topic.totalExams
            const isLocked = !topic.isUnlocked
            const TopicIcon = TOPIC_ICONS[topic.type]
            return (
              <Link
                key={topic.id}
                href={`/topics/${topic.id}/exams`}
                aria-disabled={isLocked}
                tabIndex={isLocked ? -1 : undefined}
                className={cn(
                  "block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isLocked && "pointer-events-none"
                )}
              >
                <Card
                  className={cn(
                    "group relative gap-0 overflow-hidden py-0 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                    isAllExamsPassed &&
                      "border-emerald-200 bg-linear-to-r from-emerald-50 via-green-50 to-teal-50 hover:border-emerald-300",
                    isLocked && "bg-muted/60 shadow-none"
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
                        "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
                        isAllExamsPassed && "bg-emerald-100 text-emerald-700",
                        isLocked && "bg-muted-foreground/15 text-muted-foreground"
                      )}
                    >
                      <TopicIcon className="size-4" />
                    </div>
                    <div className="min-w-0 pr-6">
                      <span className={cn("text-sm leading-tight font-semibold", isLocked && "text-muted-foreground")}>
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
