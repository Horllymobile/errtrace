/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@vercel/blob'],
  // outputFileTracingRoot: path.join(__dirname, '../../'),
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-ErrTrace-Key' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },

  env: {
    ERRTRACE_USERNAME: process.env.ERRTRACE_USERNAME,
    ERRTRACE_PASSWORD: process.env.ERRTRACE_PASSWORD,
  },

  // Prevent Vercel from redirecting API routes
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;