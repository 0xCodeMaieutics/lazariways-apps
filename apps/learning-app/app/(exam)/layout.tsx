import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth.server'
import { cn } from '@/lib/utils'

export default async function AuthLayout({
    children,
}: React.PropsWithChildren) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session === null) {
        redirect('/login')
    }

    return <main className={cn('mx-auto h-screen w-full')}>{children}</main>
}
