import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { Metadata } from "next"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import {
  Building2,
  CalendarRange,
  ConciergeBell,
  MapPin,
  UtensilsCrossed,
} from "lucide-react"

import { WhatsappButton } from "../components/whatsapp-button"

interface JobSection {
  title: string
  items: string[]
}

interface JobTag {
  label: string
  icon: LucideIcon
}

const jobTags: JobTag[] = [
  { label: "Gastronomy", icon: UtensilsCrossed },
  { label: "Service", icon: ConciergeBell },
  { label: "Seasonal work full & part time", icon: CalendarRange },
  { label: "Europa-Park Hotels", icon: Building2 },
  { label: "Rust", icon: MapPin },
]

function JobTagBadge({ label, icon: Icon }: JobTag) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-neutral-500" />
      {label}
    </span>
  )
}

interface JobFrontmatter {
  employer: string
  title: string
  positionId: string
}

interface ParsedJobContent {
  frontmatter: JobFrontmatter
  intro: string[]
  sections: JobSection[]
}

function parseFrontmatter(markdown: string): {
  frontmatter: JobFrontmatter
  body: string
} {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

  if (!match) {
    return {
      frontmatter: { employer: "", title: "", positionId: "" },
      body: markdown,
    }
  }

  const frontmatter: Record<string, string> = {}

  for (const line of match[1].split("\n")) {
    const separatorIndex = line.indexOf(":")

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    frontmatter[key] = value
  }

  return {
    frontmatter: {
      employer: frontmatter.employer ?? "",
      title: frontmatter.title ?? "",
      positionId: frontmatter["position-id"] ?? "",
    },
    body: match[2],
  }
}

function parseJobContent(markdown: string): ParsedJobContent {
  const { frontmatter, body } = parseFrontmatter(markdown)
  const intro: string[] = []
  const sections: JobSection[] = []
  let currentParagraph: string[] = []
  let currentSection: JobSection | null = null
  let inIntro = true

  const flushParagraph = () => {
    if (currentParagraph.length === 0) {
      return
    }

    const text = currentParagraph.join(" ").trim()
    currentParagraph = []

    if (!text || text.includes("Translated with DeepL")) {
      return
    }

    if (inIntro) {
      intro.push(text)
    }
  }

  for (const line of body.split("\n")) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.includes("Translated with DeepL")) {
      continue
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph()
      inIntro = false
      currentSection = { title: trimmed.slice(4), items: [] }
      sections.push(currentSection)
      continue
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph()
      inIntro = false
      currentSection?.items.push(trimmed.slice(2))
      continue
    }

    currentParagraph.push(trimmed)
  }

  flushParagraph()

  return { frontmatter, intro, sections }
}

function getJobContent(): ParsedJobContent {
  const filePath = join(
    process.cwd(),
    "app/europark-restaurant-bar/_/job-content.md"
  )
  const markdown = readFileSync(filePath, "utf8")

  return parseJobContent(markdown)
}

const { frontmatter: jobFrontmatter } = getJobContent()

export const metadata: Metadata = {
  title: `${jobFrontmatter.title} — ${jobFrontmatter.employer}`,
  description:
    "ვაკანსიები Europa-Park-ის რესტორნსა და ბარში — ოფიციანტი, ბარმენი, ბარისტა, მიმტანი და სხვა.",
}

export default function EuroparkRestaurantBarPage() {
  const { frontmatter, intro, sections } = getJobContent()

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 sm:py-14">
      <article>
        <header className="mb-10 space-y-5 border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <Image
            src="/europark-logo.png"
            alt="Europa-Park"
            width={572}
            height={210}
            priority
            className="h-12 w-auto sm:h-14"
          />
          <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {frontmatter.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {jobTags.map((tag) => (
              <JobTagBadge key={tag.label} {...tag} />
            ))}
          </div>
        </header>

        <div className="space-y-5 text-base leading-7 text-neutral-800 dark:text-neutral-200">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
                {section.title}
              </h2>
              <ul className="space-y-4 text-base leading-7 text-neutral-800 dark:text-neutral-200">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12">
          <WhatsappButton
            whatsappText={`გამარჯობა, მაინტერესებს ვაკანსიის ID ${frontmatter.positionId}.`}
            className="w-full sm:w-fit"
          />
        </div>
      </article>
    </main>
  )
}
