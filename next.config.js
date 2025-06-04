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
      },
      {
        protocol: "https",
        hostname: "iprints.com.ng",
        pathname: "/wp-content/uploads/**"
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;
