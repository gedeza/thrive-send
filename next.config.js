/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["placehold.co"]
  }
};
module.exports = {
  experimental: {
    forceSwcTransforms: true,
  },
}
module.exports = nextConfig;
