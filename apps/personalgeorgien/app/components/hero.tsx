import { SITE } from "../../lib/site"
import { AnimatedHeroTitle } from "./animated-hero-title"
import { ContactButtons } from "./contact-buttons"
import { HeroVideo } from "./hero-video"
import { ScrollDownIndicator } from "./scroll-down-indicator"

export function Hero() {
  return (
    <section className="relative flex flex-col lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <div className="flex flex-col justify-center px-6 py-16 lg:h-full lg:w-[50%] lg:px-12 lg:py-10 xl:px-16">
        <AnimatedHeroTitle className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-4xl xl:text-5xl" />
        <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
          {SITE.slogan}
        </p>
        <ContactButtons className="mt-6 lg:mt-8" iconOnlyOnMobile />
      </div>

      <div className="w-full lg:h-full lg:min-h-0 lg:w-[50%]">
        <HeroVideo />
      </div>

      <ScrollDownIndicator />
    </section>
  )
}
