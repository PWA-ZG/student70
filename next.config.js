/** @type {import('next').NextConfig} */
const nextConfig = {}

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  swSrc: "path/to/custom-sw.js",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
  runtimeCaching: [
    {
      urlPattern: '/api/getImages',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
  workboxOptions: {
      disableDevLogs: true
  }
});

module.exports = withPWA(nextConfig)
