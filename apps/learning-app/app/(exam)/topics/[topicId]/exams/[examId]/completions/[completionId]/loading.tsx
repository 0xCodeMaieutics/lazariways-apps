import { Skeleton } from "@lazariways/ui/components/skeleton"

export default function CompletionLoading() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 px-4">
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-6 h-11 w-full max-w-sm rounded-xl" />
    </div>
  )
}
