import { requireContentSessionForPage } from "@/lib/auth"

export default async function Home() {
  await requireContentSessionForPage("/")

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Content Studio</h1>
      <p className="mt-2 text-sm text-muted-foreground">სოციალური პოსტების შაბლონები მალე დაემატება.</p>
    </main>
  )
}
