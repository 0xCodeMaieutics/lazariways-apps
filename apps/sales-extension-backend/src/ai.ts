import OpenAI from "openai"
import { z } from "zod"

const extractedCompanySchema = z.object({
  companyWebsite: z.string().nullable(),
  name: z.string().nullable(),
  contactName: z.string().nullable(),
  street: z.string().nullable(),
  postalCode: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
})

export type ExtractedCompany = z.infer<typeof extractedCompanySchema>

function parseExtractedCompany(content: string): ExtractedCompany {
  return z
    .preprocess((value, ctx) => {
      if (typeof value !== "string") {
        return value
      }

      try {
        return JSON.parse(value) as unknown
      } catch {
        ctx.addIssue("AI response is not valid JSON")
        return z.NEVER
      }
    }, extractedCompanySchema)
    .parse(content)
}

type TokenUsage = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

type ExtractionResult = {
  company: ExtractedCompany
  usage: TokenUsage
}
export async function extractCompanyFromHtml({
  html,
  apiKey,
}: {
  html: string
  apiKey: string
}): Promise<ExtractionResult> {
  const openai = new OpenAI({ apiKey })

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Extract company contact information from HTML. Return a JSON object with these fields:
- companyWebsite (string or null)
- name (string or null)
- contactName (string or null)
- street (string or null)
- postalCode (string or null)
- city (string or null)
- country (string or null)
- phone (string or null)
- email (string or null)
- googleMapsUrl (string or null)

Use null for fields not found. Do not include sourceUrl.`,
      },
      {
        role: "user",
        content: html,
      },
    ],
  })

  const content = response.choices[0]?.message?.content

  if (content === undefined || content === null || content.length === 0) {
    throw new Error("AI returned an empty response")
  }

  const usage = response.usage

  if (usage === undefined) {
    throw new Error("AI response did not include token usage")
  }

  return {
    company: parseExtractedCompany(content),
    usage: {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
    },
  }
}
