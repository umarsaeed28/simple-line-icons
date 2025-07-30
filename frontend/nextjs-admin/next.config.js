/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['via.placeholder.com', 'storage.example.com'],
  },
  env: {
    DESIGNER_AGENT_URL: process.env.DESIGNER_AGENT_URL || 'http://localhost:3001',
    DATA_AGENT_URL: process.env.DATA_AGENT_URL || 'http://localhost:3002',
    USER_AGENT_URL: process.env.USER_AGENT_URL || 'http://localhost:3003',
  },
}

module.exports = nextConfig