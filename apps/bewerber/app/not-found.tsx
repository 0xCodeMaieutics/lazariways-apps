import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bewerbung nicht gefunden",
}

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Bewerbung nicht gefunden
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Diese Bewerbung ist nicht verfügbar. Bitte prüfen Sie den Link oder
        wenden Sie sich an Lazari Ways.
      </p>
      <p className="mt-6 text-base">
        <p>Gehen Sie zur der Webseite.</p>
        <a
          href="https://personalgeorgien.de"
          className="text-primary underline-offset-4 hover:underline"
        >
          personalgeorgien.de
        </a>
      </p>
    </main>
  )
}
