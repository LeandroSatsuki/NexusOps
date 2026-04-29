import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@nexusops/ui", "@nexusops/types"]
};

export default nextConfig;

