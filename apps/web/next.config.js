/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@business-app/types'],
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    },
};

module.exports = nextConfig;
