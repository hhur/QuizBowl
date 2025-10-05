/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@quizbowlhub/types"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:3001"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;