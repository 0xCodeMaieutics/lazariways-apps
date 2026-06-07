import { Manrope } from "next/font/google"
import "@workspace/ui/globals.css"
import "./globals.css"
import { createPageMetadata } from "../lib/seo"

const manrope = Manrope({
  subsets: ["latin"],
})

export const metadata = createPageMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="antialiased">
      <body className={manrope.className}>{children}</body>
    </html>
  )
}
