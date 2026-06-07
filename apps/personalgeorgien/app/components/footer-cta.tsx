import { SITE } from "../../lib/site"
import { ContactButtons } from "./contact-buttons"

export function FooterCta() {
  return (
    <section className="bg-primary px-6 py-16 text-primary-foreground lg:px-16 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          {SITE.title}
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/80 sm:text-xl">
          {SITE.slogan}
        </p>
        <ContactButtons className="mt-8 justify-center" variant="on-primary" />
      </div>
    </section>
  )
}
