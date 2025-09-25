/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable proper image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'localhost',
      'preuniversitario-astral.vercel.app',
      // Add other allowed image domains here
    ],
  },
  // Optimize font loading to reduce preload warnings
  experimental: {
    optimizePackageImports: ['geist', 'lucide-react', '@radix-ui/react-icons'],
  },
  // Improve build performance and output
  reactStrictMode: true,
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Static asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  webpack: (config, { isServer }) => {
    // Optimize Three.js for production builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    // Add bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      );
    }
    
    return config;
  },
}

export default nextConfig
