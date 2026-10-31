"use client"

import { cn } from "@workspace/ui/lib/utils"
import { FileText, GraduationCap, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: "/applications", label: "განაცხადები", icon: FileText },
  { href: "/university", label: "უნივერსიტეტები", icon: GraduationCap },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminNav() {
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 border-b border-border bg-background/95 backdrop-blur md:block">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-8 px-6">
          <Link
            href="/applications"
            className="flex items-center gap-2 rounded-md text-sm font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              LW
            </span>
            Lazari Ways
            <span className="font-normal text-muted-foreground">Admin</span>
          </Link>
          <nav aria-label="მთავარი ნავიგაცია" className="flex h-full items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <nav
        aria-label="მთავარი ნავიგაცია"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors focus-visible:bg-muted focus-visible:outline-none",
                    active ? "text-primary" : "text-muted-foreground active:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-14 items-center justify-center rounded-full transition-colors",
                      active && "bg-accent"
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                  </span>
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
