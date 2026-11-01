import { redirect } from "next/navigation"
import React from "react"

import { getSession } from "@/lib/auth.server"
import { cn } from "@/lib/utils"

export default async function AuthLayout({ children }: React.PropsWithChildren) {
  const session = await getSession()

  if (session === null) {
    redirect("/login")
  }

  return <main className={cn("mx-auto h-screen w-full")}>{children}</main>
}
