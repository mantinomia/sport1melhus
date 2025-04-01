import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [
      'media.bluestonecdn.com',
      'media.bluestonepim.com', // ← add this one too
    ],
  },
}

export default nextConfig
