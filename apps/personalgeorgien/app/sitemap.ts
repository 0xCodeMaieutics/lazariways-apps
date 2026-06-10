import type { MetadataRoute } from "next"

import { SITE } from "../lib/site"

const ROUTES = ["/", "/galerie", "/impressum", "/datenschutz"] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: new URL(path, SITE.url).toString(),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "monthly" : "yearly",
    priority: path === "/" ? 1 : path === "/galerie" ? 0.8 : 0.3,
  }))
}
