import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/admin",
  assetPrefix: "/admin",
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
