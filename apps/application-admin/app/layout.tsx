import type { Metadata } from "next"
import { Toaster } from "@workspace/ui/components/sonner"
import "@workspace/ui/globals.css"

export const metadata: Metadata = {
  title: "Lazari Ways - Admin",
  description: "Lazari Ways admin management console.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
