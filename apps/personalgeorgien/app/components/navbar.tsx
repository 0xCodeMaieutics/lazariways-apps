import Link from "next/link"

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

        <WhatsappButton />
      </div>
    </header>
  )
}
