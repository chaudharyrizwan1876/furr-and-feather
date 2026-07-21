/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary uploaded images
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern compressed formats — faster load
    minimumCacheTTL: 60 * 60 * 24 * 30,  // 30 day cache — images served fast via CDN
  },
  // Gzip compression — reduces page size
  compress: true,
};

export default nextConfig;
