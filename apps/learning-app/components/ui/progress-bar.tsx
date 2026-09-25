import { cn } from "@/lib/utils"

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
    <div className={cn("h-3 overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
