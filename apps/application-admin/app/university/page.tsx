import { GraduationCap } from "lucide-react"

import { AdminNav } from "@/components/admin-nav"
import { requireAdminSessionForPage } from "@/lib/auth"

import { UniversityCreateForm } from "./page.client"

export default async function UniversityPage() {
  await requireAdminSessionForPage("/university")

  return (
    <>
      <AdminNav />
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-6 md:pt-10 md:pb-10">
        <header className="mb-6 flex items-start gap-3 md:mb-8">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">ახალი უნივერსიტეტი</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              შეავსეთ უნივერსიტეტის მონაცემები. სავალდებულოა მხოლოდ სახელი.
            </p>
          </div>
        </header>

        <UniversityCreateForm />
      </main>
    </>
  )
}
