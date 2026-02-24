/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@agent-auth/shared'],
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
