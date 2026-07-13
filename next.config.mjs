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
    minimumCacheTTL: 60 * 60 * 24 * 30,  // 30 din cache — CDN par images fast serve hongi
  },
  // Gzip compression — page size kam karti hai
  compress: true,
};

export default nextConfig;
