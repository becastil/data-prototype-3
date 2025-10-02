import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for Docker deployment
  output: 'standalone',

  // Fix workspace root detection (resolve multiple lockfile warning)
  outputFileTracingRoot: __dirname,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Experimental features (disabled for production stability)
  experimental: {
    // turbo: false, // Disabled for production builds
  },
  
  // Transpile packages that might have issues
  transpilePackages: [
    '@mui/x-charts', 
    '@mui/x-data-grid'
  ],
  
  // Compiler options
  compiler: {
    // Remove console.log statements in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration for better ESM module handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  
  // Output configuration for static exports if needed
  // output: 'export', // Uncomment if deploying as static site
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
