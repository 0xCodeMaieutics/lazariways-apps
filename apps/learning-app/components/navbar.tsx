"use client"

import { Button } from "@lazariways/ui/components/button"
import { Moon, Sun, Monitor, User } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

const subscribe = () => () => {}

export function ThemeToggle() {
  const { theme = "dark", setTheme } = useTheme()
  // Avoid hydration mismatch: false on the server, true after hydration
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9" aria-label="Toggle theme">
        <Monitor className="size-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      onClick={() =>
        setTheme(
          {
            dark: "system",
            light: "dark",
            system: "light",
          }[theme] ?? "dark"
        )
      }
      aria-label={
        {
          dark: "Switch to system mode",
          light: "Switch to dark mode",
          system: "Switch to light mode",
        }[theme] ?? "Switch to dark mode"
      }
    >
      {{
        dark: <Moon className="size-4" />,
        light: <Sun className="size-4" />,
        system: <Monitor className="size-4" />,
      }[theme] ?? <Moon className="size-4" />}
    </Button>
  )
}

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/90 shadow-xs backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={"/topics"} className="block">
          <Image
            src="/logo.svg"
            alt="Lazari Ways"
            width={254}
            height={60}
            className="h-8 w-auto"
            loading="eager"
          />
        </Link>
        {/* <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div> */}
        <div className="flex">
          <Link
            href="/profile"
            aria-label="პროფილი"
            className="flex size-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105">
              <User className="size-4" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
