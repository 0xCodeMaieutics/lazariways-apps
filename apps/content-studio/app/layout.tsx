import { Toaster } from "@workspace/ui/components/sonner"
import type { Metadata } from "next"
import { Manrope, Noto_Sans_Georgian } from "next/font/google"

import "@workspace/ui/globals.css"

const manrope = Manrope({
  subsets: ["latin"],
})

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
})

export const metadata: Metadata = {
  title: "Lazari Ways - Content Studio",
  description: "Lazari Ways-ის სოციალური პოსტების შექმნა.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ka" className="h-full antialiased">
      <body
        className="flex min-h-full flex-col"
        style={{ fontFamily: `${manrope.style.fontFamily}, ${notoSansGeorgian.style.fontFamily}` }}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
