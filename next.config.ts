import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.blob.core.windows.net", pathname: "/**" },
      { protocol: "https", hostname: "*.openai.com", pathname: "/**" },
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net", pathname: "/**" },
    ],
  },
};

export default nextConfig;
