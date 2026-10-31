import { ImageResponse } from "next/og"

import { requireContentSessionForApi } from "@/lib/auth"
import { loadSocialPostFonts } from "@/lib/social-posts/fonts"
import { STORY_HEIGHT, STORY_WIDTH, Story } from "@/lib/social-posts/story"
import { vacancyDetailsSchema } from "@/lib/social-posts/vacancy-details"
import { findVacancyTemplate } from "@/lib/social-posts/vacancy-templates"

export const GET = async (request: Request) => {
  const authResult = await requireContentSessionForApi()

  if (authResult instanceof Response) {
    return authResult
  }

  const params = Object.fromEntries(new URL(request.url).searchParams)
  const template = findVacancyTemplate(params.template ?? "")

  if (template === undefined) {
    return Response.json({ error: "Unknown vacancy template" }, { status: 404 })
  }

  const details = vacancyDetailsSchema.safeParse({ ...template.defaultDetails, ...params })

  if (!details.success) {
    return Response.json({ error: "Invalid vacancy details", issues: details.error.issues }, { status: 400 })
  }

  const fonts = await loadSocialPostFonts().catch((error: unknown) => {
    console.error("LOAD_SOCIAL_POST_FONTS_FAILED", error)
    return null
  })

  if (fonts === null) {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  return new ImageResponse(<Story template={template} details={details.data} />, {
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    fonts,
    emoji: "twemoji",
  })
}
