import { Benefits } from "./components/benefits"
import { FooterCta } from "./components/footer-cta"
import { Hero } from "./components/hero"
import { HowItWorks } from "./components/how-it-works"
import { PageShell } from "./components/page-shell"

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <Benefits />
      <HowItWorks />
      <FooterCta />
    </PageShell>
  )
}
