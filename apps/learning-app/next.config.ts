import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@lazariways/ui"],
  images: {
    // `search` is omitted so presigned S3 query strings are allowed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lazari-ways-bucket.s3.eu-central-1.amazonaws.com",
        pathname: "/learning-app-platform/avatars/**",
      },
    ],
  },
}

export default nextConfig
