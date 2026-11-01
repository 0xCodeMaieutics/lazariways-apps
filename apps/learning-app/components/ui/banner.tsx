import type { ClassValue } from "clsx"
import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"

export function Banner({ children, className }: PropsWithChildren<{ className?: ClassValue }>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-violet-200 bg-linear-to-r from-violet-50 via-green-50 to-teal-50 px-5 py-5 shadow-xs",
        className
      )}
    >
      {children}
    </div>
  )
}
