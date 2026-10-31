import { Skeleton } from "@workspace/ui/components/skeleton"

export function DetailPageSkeleton() {
  return (
    <main aria-busy className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="mx-auto h-40 w-32 rounded-lg" />
      </header>
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </main>
  )
}
