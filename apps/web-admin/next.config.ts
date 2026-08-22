import { resolve } from 'node:path'
import { config } from 'dotenv'
import type { NextConfig } from 'next'

// See `web-student/next.config.ts` — one `.env` at the repo root, shared.
config({ path: resolve(__dirname, '../../.env') })

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/client'],
  typescript: { ignoreBuildErrors: false },
}

export default nextConfig
