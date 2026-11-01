import { Skeleton } from "@lazariways/ui/components/skeleton"

import { AdminNav } from "@/components/admin-nav"

export default function ApplicationsLoading() {
  return (
    <>
      <AdminNav />
      <main
        aria-busy
        className="mx-auto w-full max-w-lg px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:max-w-6xl md:px-6 md:pb-6"
      >
        <header className="mb-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Skeleton className="h-8 lg:flex-1" />
            <Skeleton className="h-8 w-full lg:w-64" />
            <Skeleton className="h-8 w-full lg:w-80" />
          </div>
        </header>

        <Skeleton className="mb-3 h-5 w-32" />
        <div className="divide-y divide-border md:grid md:grid-cols-3 md:gap-3 md:divide-y-0 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-3 md:flex-col md:items-stretch md:rounded-xl md:border md:border-border md:p-3"
            >
              <Skeleton className="aspect-[4/5] w-12 shrink-0 md:w-full md:rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
