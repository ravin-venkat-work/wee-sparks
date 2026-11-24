import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@wee-sparks/curriculum-schema"],
};

export default nextConfig;
