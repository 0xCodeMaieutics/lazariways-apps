"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@lazariways/ui/components/sidebar"
import { cn } from "@lazariways/ui/lib/utils"
import { BookOpen, Users, type LucideIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: "/topics", label: "Topics", icon: BookOpen },
  { href: "/users", label: "Users", icon: Users },
]

const ACTIVE_INDICATOR = "data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]"

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AdminSidebar({
  topics,
  user,
}: {
  topics: { id: string; name: string; enabled: boolean }[]
  user: { name: string; email: string }
}) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const closeMobile = () => setOpenMobile(false)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="LazariWays Admin">
              <Link href="/topics" onClick={closeMobile}>
                <Image
                  src="/logo-icon.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0"
                  priority
                />
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold tracking-tight">LazariWays</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Learning admin</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={active} tooltip={label} className={ACTIVE_INDICATOR}>
                    <Link href={href} onClick={closeMobile} aria-current={active ? "page" : undefined}>
                      <Icon aria-hidden />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {href === "/topics" && topics.length > 0 && (
                    <SidebarMenuSub>
                      {topics.map((topic) => {
                        const topicHref = `/topics/${topic.id}/exams`
                        const topicActive = pathname.startsWith(`/topics/${topic.id}/`)
                        return (
                          <SidebarMenuSubItem key={topic.id}>
                            <SidebarMenuSubButton asChild isActive={topicActive}>
                              <Link
                                href={topicHref}
                                onClick={closeMobile}
                                aria-current={topicActive ? "page" : undefined}
                              >
                                <span
                                  aria-hidden
                                  className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    topic.enabled ? "bg-sidebar-primary" : "bg-sidebar-foreground/30"
                                  )}
                                />
                                <span className="truncate">{topic.name}</span>
                                {!topic.enabled && <span className="sr-only">(hidden)</span>}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:p-0">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground"
          >
            {initials(user.name)}
          </span>
          <span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
