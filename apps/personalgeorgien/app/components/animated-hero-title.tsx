"use client"

import { useEffect, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { HERO_TITLE } from "../../lib/site"

export function AnimatedHeroTitle({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % HERO_TITLE.adjectives.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <h1 className={className}>
      <span className="lg:block">
        {HERO_TITLE.prefix}{" "}
        <span className="inline-grid text-primary">
          {HERO_TITLE.adjectives.map((adjective, adjectiveIndex) => (
            <span
              key={adjective}
              className={cn(
                "col-start-1 row-start-1 transition-all duration-500 ease-in-out",
                adjectiveIndex === index
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              )}
            >
              {adjective}
            </span>
          ))}
        </span>
      </span>{" "}
      <span className="lg:block">{HERO_TITLE.suffix}</span>
    </h1>
  )
}
