"use client"

import { Button } from "@lazariways/ui/components/button"
import { TriangleAlert } from "lucide-react"
import { useEffect } from "react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlert className="size-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Something went wrong!</h2>
      <Button
        className="mt-8"
        size="lg"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  )
}
