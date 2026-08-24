import type { Metadata } from 'next'
import '@workspace/ui/globals.css'
import './animations.css'
import { ThemeProvider } from './theme-provider'
import { Providers } from './providers'

export const metadata: Metadata = {
    title: 'LazariLingo',
    description:
        'LazariLingo helps you to learn German really easliy and joyful',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={'dark antialiased'}>
                <Providers>
                    <ThemeProvider attribute="class">{children}</ThemeProvider>
                </Providers>
            </body>
        </html>
    )
}
