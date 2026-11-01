"use client"

import { Toaster } from "@lazariways/ui/components/sonner"
import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { getQueryClient } from "@/lib/query-client"
import { TRPCProvider, createTrpcClient } from "@/lib/trpc/react"

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() => createTrpcClient())

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
        <Toaster />
      </TRPCProvider>
    </QueryClientProvider>
  )
}
