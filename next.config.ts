import type { NextConfig } from "next"

const isGithubActions = process.env.GITHUB_ACTIONS === "true"

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
  },

  // Replace with your repository name
  basePath: isGithubActions ? "/snapstore-studio" : "",
  assetPrefix: isGithubActions ? "/snapstore-studio/" : "",

  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
