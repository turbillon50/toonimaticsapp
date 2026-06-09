/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.higgsfield.ai' },
      { protocol: 'https', hostname: '*.higgsfield.ai' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: { serverComponentsExternalPackages: ['postgres'] },
}
module.exports = nextConfig
