"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@lazariways/ui/components/breadcrumb"
import { Separator } from "@lazariways/ui/components/separator"
import { SidebarTrigger } from "@lazariways/ui/components/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

function isNanoidLike(segment: string): boolean {
  return /^[A-Za-z0-9_-]{10,}$/.test(segment)
}

function buildBreadcrumbs(pathname: string): { href: string; label: string; isLast: boolean }[] {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return [{ href: "/topics", label: "Topics", isLast: true }]
  }

  if (segments[0] === "users") {
    return [{ href: "/users", label: "Users", isLast: true }]
  }

  const items: { href: string; label: string; isLast: boolean }[] = []
  const topicIdx = segments.indexOf("topics")
  const examsIdx = segments.indexOf("exams")
  const exercisesIdx = segments.indexOf("exercises")

  const topicId = topicIdx >= 0 && topicIdx + 1 < segments.length ? segments[topicIdx + 1] : null
  const examId = examsIdx >= 0 && isNanoidLike(segments[examsIdx + 1] ?? "") ? segments[examsIdx + 1] : null

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
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
      <Separator orientation="vertical" className="data-vertical:h-5 data-vertical:self-center" />
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
    </header>
  )
}
