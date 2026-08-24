import { cn } from '@/lib/utils'
import { ClassValue } from 'clsx'
import { PropsWithChildren } from 'react'

export function Banner({
    children,
    className
}: PropsWithChildren<{ className?: ClassValue }>) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border border-violet-200 bg-linear-to-r from-violet-50 via-green-50 to-teal-50 px-5 py-5 dark:border-violet-800/40 dark:from-violet-950/40 dark:via-green-950/30 dark:to-teal-950/40',
                className
            )}
        >
            {children}
        </div>
    )
}
