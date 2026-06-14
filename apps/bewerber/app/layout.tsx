import { Manrope } from "next/font/google"
import "@workspace/ui/globals.css"
import { Metadata } from "next"

const manrope = Manrope({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Bewerber - personalgeorgien",
}

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
