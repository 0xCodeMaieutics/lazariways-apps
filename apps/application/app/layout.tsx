import type { Metadata } from 'next'
import '@workspace/ui/globals.css'
import { Providers } from './providers'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Lazari Ways - განაცხადის ფორმა',
    description:
        'შეავსეთ ონლაინ განაცხადი საერთაშორისო სამუშაოს განთავსებისა და დასაქმების მიზნით Lazari Ways-ის საშუალებით.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ka" className={`h-full antialiased`}>
            <body className="flex min-h-full flex-col">
                <header className="border-border/40 bg-background sticky top-0 z-50 flex shrink-0 items-center border-b px-4 py-3">
                    <Image
                        src="/logo.svg"
                        alt="Lazari Ways"
                        width={254}
                        height={60}
                        className="h-8 w-auto"
                        loading="eager"
                    />
                </header>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
