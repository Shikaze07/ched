import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Redirect /program-assessment/<refNo> → /evaluation/<refNo>
        source: "/program-assessment/:refNo",
        destination: "/evaluation/:refNo",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
