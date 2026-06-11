import { redirect } from "next/navigation"

interface HomePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const { page } = await searchParams
  const query = page !== undefined ? `?page=${page}` : ""
  redirect(`/applications${query}`)
}
