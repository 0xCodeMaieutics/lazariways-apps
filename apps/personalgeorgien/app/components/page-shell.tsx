import { Navbar } from "./navbar"
import { SiteFooter } from "./site-footer"

export function PageShell({
  children,
  mainClassName,
}: {
  children: React.ReactNode
  mainClassName?: string
}) {
  return (
    <>
      <Navbar />
      <main className={mainClassName}>{children}</main>
      <SiteFooter />
    </>
  )
}
