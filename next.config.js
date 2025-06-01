/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rough-art.pockethost.io", // Removed "https://"
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;
