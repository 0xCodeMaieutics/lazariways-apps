import { z } from "zod"
export const env = z
  .object({
    DATABASE_URL: z.string(),
    TELEGRAM_BOT_TOKEN: z.string(),
    TELEGRAM_CHAT_ID: z.string(),
    OPENAI_API_KEY: z.string(),
  })
  .parse(process.env)
