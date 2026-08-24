'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { TRPCProvider, createTrpcClient } from '@/lib/trpc/react'
import { Toaster } from '@workspace/ui/components/sonner'

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
