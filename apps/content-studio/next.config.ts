import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Social Post fonts are read from disk at request time, so they must be traced into the route's bundle.
  outputFileTracingIncludes: {
    "/api/social-posts/**": [
      "./node_modules/@fontsource/manrope/files/manrope-latin-*-normal.woff",
      "./node_modules/@fontsource/noto-sans-georgian/files/noto-sans-georgian-georgian-*-normal.woff",
    ],
  },
}

export default nextConfig
