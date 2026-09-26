import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

import { GALLERY } from "../../lib/site"
import { NavLink } from "./nav-link"

export function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight sm:text-xl"
          aria-label="personalgeorgien"
        >
          <span className="text-primary">personal</span>
          <span className="text-black">georgien</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <NavLink href="/galerie">{GALLERY.title}</NavLink>
          <Button asChild size="lg" className="h-9 px-3 sm:h-10 sm:px-4">
            <a href="/#vertrieb">Sales kontaktieren</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
