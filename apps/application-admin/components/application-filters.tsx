"use client"

import type { GermanLevel } from "@workspace/database/browser"
import { Input } from "@workspace/ui/components/input"
import { NativeSelect, NativeSelectOption } from "@workspace/ui/components/native-select"
import { cn } from "@workspace/ui/lib/utils"
import { Loader2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

import {
  buildApplicationsHref,
  GERMAN_LEVELS,
  UNIVERSITY_NOT_IN_LIST,
  type ApplicationFilters,
} from "@/lib/application-filters"

const SEARCH_DEBOUNCE_MS = 300

interface ApplicationFiltersBarProps {
  filters: ApplicationFilters
  universities: { id: string; name: string }[]
}

export function ApplicationFiltersBar({ filters, universities }: ApplicationFiltersBarProps) {
  const router = useRouter()
  const [isNavigating, startNavigation] = useTransition()
  const [query, setQuery] = useState(filters.query)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (document.activeElement !== searchInputRef.current) {
      setQuery(filters.query)
    }
  }, [filters.query])

  function navigate(nextFilters: ApplicationFilters) {
    startNavigation(() => {
      router.replace(buildApplicationsHref(nextFilters), { scroll: false })
    })
  }

  useEffect(() => {
    const trimmedQuery = query.trim()
    if (trimmedQuery === filters.query) {
      return
    }

    const timeout = setTimeout(() => {
      navigate({ ...filters, query: trimmedQuery })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function selectGermanLevel(germanLevel: GermanLevel | null) {
    navigate({ ...filters, query: query.trim(), germanLevel })
  }

  function selectUniversity(university: string) {
    navigate({ ...filters, query: query.trim(), university: university === "" ? null : university })
  }

  const levelOptions: { value: GermanLevel | null; label: string }[] = [
    { value: null, label: "ყველა" },
    ...GERMAN_LEVELS.map((level) => ({ value: level, label: level })),
  ]

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative lg:flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ძებნა სახელით, ელფოსტით, ტელეფონით…"
          aria-label="განაცხადების ძებნა"
          className="h-10 pr-9 pl-9 text-base md:text-sm"
        />
        {isNavigating ? (
          <Loader2
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-label="იტვირთება"
          />
        ) : null}
      </div>

      <NativeSelect
        value={filters.university ?? ""}
        onChange={(event) => selectUniversity(event.target.value)}
        aria-label="უნივერსიტეტი"
        className="w-full lg:w-64"
      >
        <NativeSelectOption value="">ყველა უნივერსიტეტი</NativeSelectOption>
        <NativeSelectOption value={UNIVERSITY_NOT_IN_LIST}>⚠ სიიდან არ არის არჩეული</NativeSelectOption>
        {universities.map((university) => (
          <NativeSelectOption key={university.id} value={university.id}>
            {university.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <fieldset className="-mx-4 flex min-w-0 items-center gap-1.5 overflow-x-auto border-0 px-4 sm:mx-0 sm:px-0">
        <legend className="sr-only">Deutsch</legend>
        <span aria-hidden className="shrink-0 pr-1 text-xs font-medium text-muted-foreground">
          Deutsch
        </span>
        {levelOptions.map((option) => {
          const isSelected = filters.germanLevel === option.value

          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectGermanLevel(option.value)}
              className={cn(
                "h-9 shrink-0 rounded-full border px-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:h-8",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </fieldset>
    </div>
  )
}
