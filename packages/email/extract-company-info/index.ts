import dotenv from "dotenv"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { extractCompanyFromHtml } from "../ai.js"
import z, { email } from "zod"
import "colors"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "..", ".env.extract") })

const inputHtmlPath = path.join(__dirname, "input.html")
const companiesPath = path.join(__dirname, "..", "companies.json")

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

function printUsage() {
  console.error("Usage: pnpm extract-company-info -- <source-url>")
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

  let html: string

  try {
    html = readFileSync(inputHtmlPath, "utf8")
  } catch {
    console.error(`Could not read input.html: ${inputHtmlPath}`)
    process.exit(1)
  }

  if (html.length === 0) {
    console.error(`input.html is empty: ${inputHtmlPath}`)
    process.exit(1)
  }

  const { company: extracted, usage } = await extractCompanyFromHtml(html)
  const parsedCompany = z
    .object({
      companyWebsite: z.url().nullable(),
      googleMapsUrl: z.string().nullable(),
      name: z.string().nullable(),
      contactName: z.string().nullable(),
      street: z.string().nullable(),
      postalCode: z.string().nullable(),
      city: z.string().nullable(),
      country: z.string().nullable(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
    })
    .parse(extracted)
  const company = {
    ...parsedCompany,
    sourceUrl: parsedUrl.href,
    note: null,
    status: "IDLE",
    createdAt: new Date().toISOString(),
  }

  const companies = readCompanies()
  const alreadyExists = companies.some(
    (existing) =>
      existing.sourceUrl === parsedUrl.href ||
      (parsedCompany.email !== null && existing.email === parsedCompany.email)
  )

  if (alreadyExists) {
    console.warn(
      `Company already exists for ${parsedUrl.href} ${parsedCompany.email}`
        .yellow
    )
  }

  writeCompanies([...companies, company])
  console.log(JSON.stringify(company, null, 2))
  console.log(
    `Token usage: prompt=${usage.promptTokens} completion=${usage.completionTokens} total=${usage.totalTokens}`
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
