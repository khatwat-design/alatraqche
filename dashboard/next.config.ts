import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dashbord.alatraqchy.com",
        pathname: "/**",
      },
    ],
    qualities: [75],
  },
};

export default nextConfig;
