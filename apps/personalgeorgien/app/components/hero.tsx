import { SITE } from "../../lib/site"
import { ContactButtons } from "./contact-buttons"
import { HeroVideo } from "./hero-video"
import { ScrollDownIndicator } from "./scroll-down-indicator"

export function Hero() {
  return (
    <section className="relative flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden lg:flex-row">
      <div className="flex shrink-0 flex-col justify-center px-6 py-8 lg:h-full lg:w-[60%] lg:px-12 lg:py-10 xl:px-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-4xl xl:text-5xl">
          {SITE.title}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
          {SITE.slogan}
        </p>
        <ContactButtons className="mt-6 lg:mt-8" />
      </div>

      <div className="min-h-0 w-full flex-1 lg:h-full lg:w-[40%] lg:flex-none">
        <HeroVideo />
      </div>

      <ScrollDownIndicator />
    </section>
  )
}
