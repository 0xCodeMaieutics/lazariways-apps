import { Skeleton } from "@lazariways/ui/components/skeleton"

export default function ExamsLoading() {
  return (
    <div className="flex flex-col gap-2 px-4 py-2 pb-6">
      <div className="flex h-9 items-center px-4">
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-xl border px-4 py-4 pl-5">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
