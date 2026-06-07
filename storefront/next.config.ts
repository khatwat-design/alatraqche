import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/store",
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
  },
};

export default nextConfig;
