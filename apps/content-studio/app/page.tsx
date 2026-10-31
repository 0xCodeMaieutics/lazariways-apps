import Image from "next/image"
import Link from "next/link"

import { requireContentSessionForPage } from "@/lib/auth"
import { VACANCY_TEMPLATES } from "@/lib/social-posts/vacancy-templates"

export default async function Home() {
  await requireContentSessionForPage("/")

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="flex flex-col items-center gap-3">
        <Image src="/logo-icon.svg" alt="" width={64} height={64} className="size-16" priority />
        <span className="text-sm font-semibold tracking-tight text-muted-foreground">Lazari Ways</span>
      </div>
      <h1 className="mt-1 text-center text-2xl font-semibold tracking-tight">Content Studio</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">აირჩიეთ ვაკანსიის შაბლონი</p>
      <ul className="mt-8 space-y-3">
        {VACANCY_TEMPLATES.map((template) => (
          <li key={template.id}>
            <Link
              href={`/social-posts/${template.id}`}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-muted"
            >
              <span className="text-2xl" aria-hidden>
                {template.icon}
              </span>
              <span className="font-medium">{template.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
