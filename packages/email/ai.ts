import OpenAI from "openai"

function parseExtractedCompany(content: string): Record<string, unknown> {
  let parsed: unknown

  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error("AI response is not valid JSON")
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AI response must be a JSON object")
  }

  return parsed as Record<string, unknown>
}

type TokenUsage = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

type ExtractionResult = {
  company: Record<string, unknown>
  usage: TokenUsage
}
export async function extractCompanyFromHtml(
  html: string
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL

  if (apiKey === undefined || apiKey.length === 0) {
    throw new Error("OPENAI_API_KEY is missing in .env.extract")
  }

  if (model === undefined || model.length === 0) {
    throw new Error("OPENAI_MODEL is missing in .env.extract")
  }

  const openai = new OpenAI({ apiKey })

  const response = await openai.chat.completions.create({
    model,
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
