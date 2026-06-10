import Link from "next/link"

import { GALLERY } from "../../lib/site"
import { NavLink } from "./nav-link"
import { WhatsappButton } from "./whatsapp-button"

export function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight"
          aria-label="personalgeorgien"
        >
          <span className="text-primary">personal</span>
          <span className="text-black">georgien</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <NavLink href="/galerie">{GALLERY.title}</NavLink>
          <WhatsappButton
            iconOnlyOnMobile
            className="size-10 p-0 sm:px-4 lg:h-12 lg:w-fit"
          />
        </div>
      </div>
    </header>
  )
}
