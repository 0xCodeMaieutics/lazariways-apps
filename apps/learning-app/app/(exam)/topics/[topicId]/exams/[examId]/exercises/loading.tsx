import { Skeleton } from "@lazariways/ui/components/skeleton"

export default function ExercisesLoading() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-1 flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex h-9 items-center gap-3">
          <Skeleton className="h-3 flex-1 rounded-full" />
          <Skeleton className="size-9" />
        </div>
        <Skeleton className="h-8 w-2/3" />
        <div className="flex flex-col gap-3 pt-8">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
