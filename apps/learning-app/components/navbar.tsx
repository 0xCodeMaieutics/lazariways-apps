"use client"

import Image from "next/image"
import * as React from "react"
import { Moon, Sun, Monitor, User } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

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
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        aria-label="Toggle theme"
      >
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
    <nav className="fixed top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={"/topics"} className="relative block size-8 dark:hidden">
          <Image src={"/lazari-ways-logo.svg"} alt="Lazary Ways Logo" fill />
        </Link>
        <Link href={"/topics"} className="relative hidden size-8 dark:block">
          <Image src={"/logo.svg"} alt="Lazary Ways Logo" fill />
        </Link>
        {/* <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div> */}
        <div className="flex">
          <Link href="/profile">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary">
              <User className="size-4" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
