import { LoginForm } from "./page.client"

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Content Studio — შესვლა</h1>
        <p className="text-sm text-muted-foreground">
          მოითხოვეთ დამადასტურებელი კოდი Telegram-ის ჯგუფში და შეიყვანეთ ქვემოთ.
        </p>
      </div>
      <LoginForm callbackUrl={callbackUrl ?? "/"} />
    </main>
  )
}
