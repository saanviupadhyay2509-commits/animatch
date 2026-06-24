/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle the trained model JSON into the serverless functions that need it.
  experimental: {
    outputFileTracingIncludes: {
      "/api/recommend": ["./lib/model.json"],
      "/api/search": ["./lib/model.json"],
      "/api/meta": ["./lib/model.json"],
    },
  },
};

export default nextConfig;
