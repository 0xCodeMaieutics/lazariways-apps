import dotenv from "dotenv"
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { extractCompanyFromHtml } from "./ai.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env.extract") })

const companiesPath = path.join(__dirname, "companies.json")
const tmpDir = path.join(__dirname, ".tmp")

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

function buildTempHtmlPath(sourceUrl: string): string {
  mkdirSync(tmpDir, { recursive: true })
  const hostname = new URL(sourceUrl).hostname.replace(/\./g, "-")
  const fileName = `${Date.now()}-${hostname}.html`

  return path.join(tmpDir, fileName)
}

function readCompanies(): Record<string, unknown>[] {
  return JSON.parse(readFileSync(companiesPath, "utf8")) as Record<
    string,
    unknown
  >[]
}

function writeCompanies(companies: Record<string, unknown>[]) {
  writeFileSync(
    companiesPath,
    `${JSON.stringify(companies, null, 2)}\n`,
    "utf8"
  )
}

async function promptProceed(): Promise<boolean> {
  const readline = createInterface({ input, output })

  try {
    const answer = await readline.question(
      "Open the file and check whether it contains the company info you need.\nProceed with extraction? [y/n]: "
    )
    const normalized = answer.trim().toLowerCase()

    if (normalized === "y") {
      return true
    }

    if (normalized === "n") {
      return false
    }

    console.error("Invalid input. Expected y or n.")
    process.exit(1)
  } finally {
    readline.close()
  }
}

function deleteTempFile(tempFilePath: string) {
  try {
    unlinkSync(tempFilePath)
  } catch {
    // ignore if already deleted
  }
}

function printUsage() {
  console.error("Usage: pnpm company-scraper -- <source-url>")
}

async function main() {
  const sourceUrl = process.argv[2]

  if (sourceUrl === undefined || sourceUrl.length === 0) {
    printUsage()
    process.exit(1)
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(sourceUrl)
  } catch {
    printUsage()
    console.error(`Invalid URL: ${sourceUrl}`)
    process.exit(1)
  }

  const html = await fetchHtml(parsedUrl.href)
  const tempFilePath = buildTempHtmlPath(parsedUrl.href)
  writeFileSync(tempFilePath, html, "utf8")

  console.log(`Saved HTML to ${tempFilePath}`)

  const proceed = await promptProceed()

  if (!proceed) {
    deleteTempFile(tempFilePath)
    return
  }

  try {
    const { company: extracted, usage } = await extractCompanyFromHtml(html)
    const company = { ...extracted, sourceUrl: parsedUrl.href }
    const companies = readCompanies()
    const alreadyExists = companies.some(
      (existing) => existing.sourceUrl === parsedUrl.href
    )

    if (alreadyExists) {
      console.warn(`Company already exists for ${parsedUrl.href}`)
    }

    writeCompanies([...companies, company])
    deleteTempFile(tempFilePath)
    console.log(JSON.stringify(company, null, 2))
    console.log(
      `Token usage: prompt=${usage.promptTokens} completion=${usage.completionTokens} total=${usage.totalTokens}`
    )
  } catch (error) {
    deleteTempFile(tempFilePath)
    throw error
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
