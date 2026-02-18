/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@agent-auth/shared'],
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
