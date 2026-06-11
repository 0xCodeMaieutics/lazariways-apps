import { LoginForm } from "./page.client"

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
        <p className="text-muted-foreground text-sm">
          Request a verification code in the Telegram group, then enter it
          below.
        </p>
      </div>
      <LoginForm callbackUrl={callbackUrl ?? "/applications"} />
    </main>
  )
}
