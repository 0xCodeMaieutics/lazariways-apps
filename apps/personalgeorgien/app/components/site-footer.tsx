import { SITE } from "@/lib/site"
import Link from "next/link"
import { WhatsappIcon } from "./whatsapp-icon"
import { cn } from "@workspace/ui/lib/utils"

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-4 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <div className="space-y-4">
          {" "}
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-foreground">
              <span className="text-primary">personal</span>
              <span className="text-black">georgien</span>
            </span>
          </p>
          <div className="flex flex-col gap-0.5">
            <a className="underline" href={"mailto:" + SITE.email}>
              {SITE.email}
            </a>
            <a className="underline" href={"tel:" + SITE.phone}>
              {SITE.phone}
            </a>
            <a
              className="flex items-center gap-x-1 underline"
              href={SITE.whatsappUrl}
            >
              <WhatsappIcon className={cn("size-4 fill-green-600")} />
              whatsapp
            </a>
          </div>
        </div>
        <nav className="flex gap-6" aria-label="Rechtliches">
          <Link href="/impressum" className="hover:text-foreground">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-foreground">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  )
}
