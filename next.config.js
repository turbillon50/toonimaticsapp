/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'd8j0ntlcm91z4.cloudfront.net' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
      { protocol: 'https', hostname: 'assets.higgsfield.ai' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: { serverComponentsExternalPackages: ['postgres'] },
}
module.exports = nextConfig
