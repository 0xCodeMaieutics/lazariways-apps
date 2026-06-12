import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import "@workspace/ui/globals.css"
import "./globals.css"

import { Navbar } from "./components/navbar"

const manrope = Manrope({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "ვაკანსიები გერმანიაში — personalgeorgien",
    template: "%s | personalgeorgien",
  },
  description:
    "ვაკანსიები გერმანიაში ქართველი სპეციალისტებისთვის. personalgeorgien გთავაზობთ სამუშაო ადგილებს გერმანიის წამყვან კომპანიებსა და კურორტებში.",
  openGraph: {
    type: "website",
    locale: "ka_GE",
    title: "ვაკანსიები გერმანიაში — personalgeorgien",
    description:
      "ვაკანსიები გერმანიაში ქართველი სპეციალისტებისთვის. personalgeorgien გთავაზობთ სამუშაო ადგილებს გერმანიის წამყვან კომპანიებსა და კურორტებში.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ka" className="h-full antialiased">
      <body className={`${manrope.className} flex min-h-full flex-col`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
