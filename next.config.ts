import type { NextConfig } from "next"

const isGithubActions = process.env.GITHUB_ACTIONS === "true"

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // If deploying to nishantsharma113.github.io/snapstore-studio, basePath must be /snapstore-studio
  basePath: isGithubActions ? "/snapstore-studio" : "",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
