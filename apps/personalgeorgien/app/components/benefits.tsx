import { BENEFITS } from "../../lib/site"

export function Benefits() {
  return (
    <section
      id="vorteile"
      className="border-t border-border bg-muted/30 px-6 py-16 lg:px-16 lg:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ihre Vorteile
        </h2>

        <ul className="mt-10 grid gap-8 sm:grid-cols-2">
          {BENEFITS.map((benefit, index) => (
            <li key={benefit.title} className="flex gap-4">
              <span
                className="text-3xl leading-none font-semibold text-primary"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
