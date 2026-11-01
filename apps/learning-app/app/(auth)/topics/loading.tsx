import { Skeleton } from "@lazariways/ui/components/skeleton"

export default function TopicsLoading() {
  return (
    <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-xl border px-4 py-4 pl-5">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
