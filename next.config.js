/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  images: {
    domains: ["placehold.co"]
  },
  // Configure Next.js dev server for mobile access
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: false // Reduce noise in mobile testing
    },
    // Allow mobile device access
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*'
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS'
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization'
            }
          ]
        }
      ]
    }
  })
};

module.exports = nextConfig;
