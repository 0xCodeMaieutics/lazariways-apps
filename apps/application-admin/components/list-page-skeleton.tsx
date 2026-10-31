import { Skeleton } from "@workspace/ui/components/skeleton"

export function ListPageSkeleton() {
  return (
    <main aria-busy className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </header>
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </main>
  )
}
