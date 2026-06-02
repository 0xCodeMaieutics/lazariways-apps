"use client"
import { ThemeProvider } from "@/components/theme-provider"
import { PropsWithChildren } from "react"

export function Providers({ children }: PropsWithChildren) {
  return <ThemeProvider>{children}</ThemeProvider>
}
