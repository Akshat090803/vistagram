/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wallpapers.com', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nibmeunbmqvmfiswsapg.supabase.co', 
        port: '',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com', 
        port: '',
        pathname: '/**', 
      },
    ],
  },
};

export default nextConfig;