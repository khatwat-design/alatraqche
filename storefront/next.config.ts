import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dashbord.alatraqchy.com",
        port: "",
        pathname: "/storage/**",
      },
    ],
    qualities: [75, 90, 95, 100],
  },
};

export default nextConfig;
