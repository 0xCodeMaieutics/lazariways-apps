import { SetPasswordClient } from "./page.client"

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return <SetPasswordClient token={token ?? null} />
}
