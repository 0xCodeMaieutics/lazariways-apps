import type { Metadata } from "next"
import "@workspace/ui/globals.css"

export const metadata: Metadata = {
  title: "Lazari Ways - Arbeitskräfte",
  description: "",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={"h-full antialiased"}>
      <body>{children}</body>
    </html>
  )
}
