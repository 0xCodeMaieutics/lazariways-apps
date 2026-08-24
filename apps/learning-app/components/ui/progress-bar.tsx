import { cn } from '@/lib/utils'

export function ProgressBar({
    value,
    max,
    className,
}: {
    value: number
    max: number
    className?: string
}) {
    const percentage = max > 0 ? (value / max) * 100 : 0

    return (
        <div
            className={cn(
                'bg-muted h-3 overflow-hidden rounded-full',
                className
            )}
        >
            <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
            />
        </div>
    )
}
