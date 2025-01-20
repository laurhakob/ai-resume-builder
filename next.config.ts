import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ep-falling-bar-a2xbaglj.eu-central-1.aws.neon.tech",
      },
    ],
  },
};

export default nextConfig;
