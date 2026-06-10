"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"

export function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium hover:text-primary",
        isActive ? "text-primary" : "text-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  )
}
