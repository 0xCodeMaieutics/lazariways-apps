import type { Metadata, Viewport } from "next"

import "@lazariways/ui/globals.css"
import "./animations.css"
import { Providers } from "./providers"
import { ThemeProvider } from "./theme-provider"

export const metadata: Metadata = {
  title: "LazariLingo",
  description: "LazariLingo helps you to learn German really easliy and joyful",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={"antialiased"}>
        <Providers>
          <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
