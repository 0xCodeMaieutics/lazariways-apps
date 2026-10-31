import { notFound } from "next/navigation"

import { env } from "@/env"
import { requireContentSessionForPage } from "@/lib/auth"
import { findVacancyTemplate } from "@/lib/social-posts/vacancy-templates"

import { SocialPostEditor } from "./page.client"

interface SocialPostPageProps {
  params: Promise<{ templateId: string }>
}

export default async function SocialPostPage({ params }: SocialPostPageProps) {
  const { templateId } = await params
  await requireContentSessionForPage(`/social-posts/${templateId}`)

  const template = findVacancyTemplate(templateId)

  if (template === undefined) {
    notFound()
  }

  return <SocialPostEditor template={template} applicationFormUrl={env.APPLICATION_FORM_URL} />
}
