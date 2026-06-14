import type { ReactNode } from "react"

interface ReadOnlyFieldProps {
  label: string
  children: ReactNode
}

export function ReadOnlyField({ label, children }: ReadOnlyFieldProps) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-base break-words">{children}</dd>
    </div>
  )
}
