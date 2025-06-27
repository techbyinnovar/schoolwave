/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    // Explicitly exclude the scripts directory from linting
    ignoreDuringBuilds: true,
    dirs: ['app', 'components', 'pages', 'lib', 'src']
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**"
      },
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
