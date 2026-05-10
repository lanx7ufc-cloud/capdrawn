/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ['cloudinary', 'bcryptjs', 'jsonwebtoken', 'formidable'],
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
