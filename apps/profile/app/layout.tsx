import type { Metadata } from "next"
import Image from "next/image"
import "@workspace/ui/globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Lazari Ways - პროფილის ფორმა",
  description:
    "შექმენით თქვენი პროფილი Lazari Ways-ის საშუალებით და გახდით ხილული დამსაქმებლებისთვის.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ka" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-50 flex shrink-0 items-center border-b border-border/40 bg-background px-4 py-3">
          <Image
            src="/logo.svg"
            alt="Lazari Ways"
            width={254}
            height={60}
            className="h-8 w-auto"
            loading="eager"
          />
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
