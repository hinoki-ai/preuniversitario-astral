/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Use flat config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
