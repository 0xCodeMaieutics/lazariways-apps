import type { Metadata } from "next"

import { SITE } from "./site"

export function createPageMetadata({
  title,
  description = SITE.description,
  path = "/",
}: {
  title?: string
  description?: string
  path?: string
} = {}): Metadata {
  const pageTitle = title ?? SITE.title
  const canonical = new URL(path, SITE.url).toString()

  return {
    metadataBase: new URL(SITE.url),
    title: title ? { absolute: `${title} | ${SITE.name}` } : pageTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "de_DE",
      url: canonical,
      siteName: SITE.name,
      title: pageTitle,
      description,
      images: [
        {
          url: "/android-chrome-512x512.png",
          width: 512,
          height: 512,
          alt: SITE.name,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description,
      images: ["/android-chrome-512x512.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
