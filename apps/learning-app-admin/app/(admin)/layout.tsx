import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth.server'

import { AdminNav } from './_components/admin-nav'

export default async function AdminLayout({
    children,
}: React.PropsWithChildren) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/login')
    }

    if (session.user.role !== 'ADMIN') {
        redirect('/')
    }

    return (
        <div className="min-h-screen flex flex-col">
            <AdminNav />
            <main className="flex-1">{children}</main>
        </div>
    )
}
