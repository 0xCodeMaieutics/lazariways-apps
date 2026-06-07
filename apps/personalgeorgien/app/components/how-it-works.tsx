import { STEPS } from "../../lib/site"

export function HowItWorks() {
  return (
    <section className="border-t border-border px-6 py-16 lg:px-16 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          So funktioniert es
        </h2>

        <ol className="mt-10 grid gap-8 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-4">
              <span
                className="text-3xl leading-none font-semibold text-primary"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
