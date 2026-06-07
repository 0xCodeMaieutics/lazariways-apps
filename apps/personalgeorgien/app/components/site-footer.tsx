import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-4 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-foreground">
            <span className="text-primary">personal</span>
            <span className="text-black">georgien</span>
          </span>
        </p>

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
