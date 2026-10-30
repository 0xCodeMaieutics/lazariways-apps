"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface RefreshButtonProps {
  label?: string
}

export function RefreshButton({ label = "Refresh" }: RefreshButtonProps) {
  const router = useRouter()
  const [isRefreshing, startRefreshTransition] = useTransition()

  function refresh() {
    startRefreshTransition(() => {
      router.refresh()
    })
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
      <RefreshCw className={cn(isRefreshing && "animate-spin")} />
      {isRefreshing ? `${label}…` : label}
    </Button>
  )
}
