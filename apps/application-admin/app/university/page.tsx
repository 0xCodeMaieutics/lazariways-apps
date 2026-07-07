import { requireAdminSessionForPage } from "@/lib/auth"
import { UniversityCreateForm } from "./page.client"

export default async function UniversityPage() {
  await requireAdminSessionForPage("/university")

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">University</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new university record.
        </p>
      </header>

      <UniversityCreateForm />
    </main>
  )
}
