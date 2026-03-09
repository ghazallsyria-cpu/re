/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
<<<<<<< HEAD
=======

  eslint: {
    ignoreDuringBuilds: true,
  },

>>>>>>> 6a5b527cad545db71c1d5a7bf16bd53609a27c53
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
<<<<<<< HEAD
=======

>>>>>>> 6a5b527cad545db71c1d5a7bf16bd53609a27c53
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
