import { prisma } from "@lazariways/database/client"
import { SidebarInset, SidebarProvider } from "@lazariways/ui/components/sidebar"
import { TooltipProvider } from "@lazariways/ui/components/tooltip"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import React from "react"

import { auth } from "@/lib/auth.server"

import { AdminNav } from "./_components/admin-nav"
import { AdminSidebar } from "./_components/admin-sidebar"

export default async function AdminLayout({ children }: React.PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const [cookieStore, topics] = await Promise.all([
    cookies(),
    prisma.topic.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, enabled: true },
    }),
  ])

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={cookieStore.get("sidebar_state")?.value !== "false"}>
        <AdminSidebar topics={topics} user={{ name: session.user.name, email: session.user.email }} />
        <SidebarInset>
          <AdminNav />
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
