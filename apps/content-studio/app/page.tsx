import { requireContentSessionForPage } from "@/lib/auth"
import { VACANCY_TEMPLATES } from "@/lib/social-posts/vacancy-templates"

export default async function Home() {
  await requireContentSessionForPage("/")

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-center text-2xl font-semibold tracking-tight">Content Studio</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">ვაკანსიის შაბლონები</p>
      <ul className="mt-8 space-y-3">
        {VACANCY_TEMPLATES.map((template) => (
          <li key={template.id}>
            <a
              href={`/api/social-posts/story?template=${template.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-muted"
            >
              <span className="text-2xl">{template.icon}</span>
              <span className="font-medium">{template.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
