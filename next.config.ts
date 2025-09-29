import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    '@mui/x-data-grid', 
    '@mui/material', 
    '@mui/icons-material', 
    '@mui/system', 
    '@mui/material-nextjs'
  ],
  
  // Output configuration for Render deployment
  output: 'standalone',
  
  // Compiler options
  compiler: {
    // Remove console.log statements in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration for better ESM module handling
  webpack: (config, { isServer }) => {
    // Handle ESM packages properly
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };
    
    // Ensure proper module resolution for MUI packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
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
