"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

function isNanoidLike(segment: string): boolean {
  return /^[A-Za-z0-9_-]{10,}$/.test(segment)
}

function buildBreadcrumbs(
  pathname: string
): { href: string; label: string; isLast: boolean }[] {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return [{ href: "/topics", label: "Topics", isLast: true }]
  }

  const items: { href: string; label: string; isLast: boolean }[] = []
  const topicIdx = segments.indexOf("topics")
  const examsIdx = segments.indexOf("exams")
  const exercisesIdx = segments.indexOf("exercises")

  const topicId =
    topicIdx >= 0 && topicIdx + 1 < segments.length
      ? segments[topicIdx + 1]
      : null
  const examId =
    examsIdx >= 0 && isNanoidLike(segments[examsIdx + 1] ?? "")
      ? segments[examsIdx + 1]
      : null

  items.push({ href: "/topics", label: "Topics", isLast: false })

  if (topicId && topicId !== "topics" && topicId !== "new") {
    items.push({
      href: `/topics/${topicId}/exams`,
      label: "Exams",
      isLast: examsIdx < 0 || !examId,
    })
  }

  if (topicId && examId && examsIdx >= 0 && exercisesIdx >= 0) {
    items.push({
      href: `/topics/${topicId}/exams/${examId}/exercises`,
      label: "Exercises",
      isLast: true,
    })
  }

  const lastItem = items.at(-1)
  if (lastItem) {
    lastItem.isLast = true
  }
  return items
}

export function AdminNav() {
  const pathname = usePathname()
  const breadcrumbs = buildBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center gap-4 px-6">
        <Link
          href="/topics"
          className="flex items-center gap-2 font-semibold text-foreground hover:text-foreground/80"
        >
          <LayoutDashboard className="size-5" />
          <span>Admin</span>
        </Link>
        <Separator orientation="vertical" className="h-6" />
        <nav className="flex items-center gap-4">
          <Link
            href="/topics"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.startsWith("/topics")
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Programs
          </Link>
        </nav>
      </div>
      <div className="border-t px-6 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, i) => (
              <React.Fragment key={item.href + i}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
