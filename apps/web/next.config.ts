/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@master-aesthetics-suite/ui',
    '@master-aesthetics-suite/shared'
  ],
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: [
      'localhost',
      'leaaesthetics.com',
      'blob.vercel-storage.com',
      's3.amazonaws.com'
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
  async redirects() {
    return [
      // Legacy redirects from old multi-app structure
      {
        source: '/admin/:path*',
        destination: '/practitioner/:path*',
        permanent: true,
      },
      {
        source: '/web/:path*',
        destination: '/client/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
