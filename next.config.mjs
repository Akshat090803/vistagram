/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wallpapers.com', // Add this line
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Add this line
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
