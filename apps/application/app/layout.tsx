import "@workspace/ui/globals.css"
import { Providers } from "./providers"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={"font-sans antialiased"}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
