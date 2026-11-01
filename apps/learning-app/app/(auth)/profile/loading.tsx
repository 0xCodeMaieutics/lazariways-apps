import { Separator } from "@lazariways/ui/components/separator"
import { Skeleton } from "@lazariways/ui/components/skeleton"

export default function ProfileLoading() {
  return (
    <div className="mx-auto flex flex-col gap-6 px-4 py-8">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="size-24 rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
