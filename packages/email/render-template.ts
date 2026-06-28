import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatesDir = path.join(__dirname, "templates")
const companiesPath = path.join(__dirname, "companies.json")

const templateParameterPattern = /\{\{(\w+)\}\}/g
const companySchema = z.looseObject({
  email: z.email().nullable(),
})
const companiesSchema = z.array(companySchema)

function parseCliArg(args: string[], flag: string): string | undefined {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === undefined) continue

    const prefix = `${flag}=`
    if (arg.startsWith(prefix)) {
      return arg.slice(prefix.length)
    }

    const nextArg = args[index + 1]
    if (arg === flag && nextArg !== undefined) {
      return nextArg
    }
  }

  return undefined
}

function extractTemplateParameters(templateContent: string): string[] {
  const parameters = new Set<string>()

  for (const match of templateContent.matchAll(templateParameterPattern)) {
    const parameter = match[1]
    if (parameter !== undefined) {
      parameters.add(parameter)
    }
  }

  return [...parameters]
}

function readTemplateParams(
  paramsFilePath: string
): Record<string, unknown> | undefined {
  try {
    return JSON.parse(readFileSync(paramsFilePath, "utf8")) as Record<
      string,
      unknown
    >
  } catch {
    return undefined
  }
}

function buildGeneratedTemplatePath(templateName: string): string {
  const generatedDir = path.join(templatesDir, templateName, "generated")
  mkdirSync(generatedDir, { recursive: true })

  const fileName = `${Date.now()}-${templateName}.html`

  return path.join(generatedDir, fileName)
}

function readCompanies(): z.infer<typeof companySchema>[] {
  try {
    const parsed = companiesSchema.safeParse(
      JSON.parse(readFileSync(companiesPath, "utf8"))
    )

    if (!parsed.success) {
      console.error(`Invalid companies.json: ${companiesPath}`)
      process.exit(1)
    }

    return parsed.data
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return []
    }

    console.error(`Could not read companies.json: ${companiesPath}`)
    process.exit(1)
  }
}

function readSentEmails(): string[] {
  const companies = readCompanies()

  return companies.flatMap((company) =>
    company.email === null ? [] : [company.email]
  )
}

function trackSentEmail(email: string) {
  const normalizedEmail = email.toLowerCase()
  const alreadyTracked = readSentEmails().some(
    (sentEmail) => sentEmail.toLowerCase() === normalizedEmail
  )

  if (alreadyTracked) {
    console.warn("Email already in the database")
    return
  }

  console.warn(`Email not found in companies.json: ${email}`)
}

function printUsage() {
  console.error("Usage: pnpm render-template -- \\")
  console.error("  --template=<template-folder-name> \\")
  console.error("  [--email=<email>]")
  console.error("")
  console.error(
    "Each template folder must contain template.html and params.json."
  )
  console.error(
    "Output is written to <template-folder>/generated/<timestamp>-<template-name>.html"
  )
}

function main() {
  const cliArgs = process.argv.slice(2)
  const templateName = parseCliArg(cliArgs, "--template")
  const emailArg = parseCliArg(cliArgs, "--email")

  if (templateName === undefined || templateName.length === 0) {
    printUsage()
    console.error("--template parameter is missing")
    process.exit(1)
  }

  const templateDir = path.join(templatesDir, templateName)
  const templatePath = path.join(templateDir, "template.html")
  const paramsFilePath = path.join(templateDir, "params.json")

  let templateContent: string
  try {
    templateContent = readFileSync(templatePath, "utf8")
  } catch {
    printUsage()
    console.error(`Template not found: ${templatePath}`)
    process.exit(1)
  }

  const params = readTemplateParams(paramsFilePath)

  if (params === undefined) {
    console.error(`Params file not found or invalid: ${paramsFilePath}`)
    process.exit(1)
  }

  const parameters = extractTemplateParameters(templateContent)
  const replacements = new Map<string, string>()

  for (const parameter of parameters) {
    const value = params[parameter]

    if (typeof value !== "string" || value.length === 0) {
      console.error(`${parameter} parameter is missing in params.json`)
      process.exit(1)
    }

    replacements.set(parameter, value)
  }

  const renderedTemplate = templateContent.replace(
    templateParameterPattern,
    (_match, parameter: string) => replacements.get(parameter) ?? _match
  )

  const outputPath = buildGeneratedTemplatePath(templateName)
  writeFileSync(outputPath, renderedTemplate, "utf8")

  if (emailArg !== undefined) {
    const parsedEmail = z.email().safeParse(emailArg.trim())

    if (!parsedEmail.success) {
      console.error(`Invalid email: ${emailArg}`)
      process.exit(1)
    }

    trackSentEmail(parsedEmail.data)
  }

  console.log(outputPath)
}

main()
