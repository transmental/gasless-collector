/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tofushop.mypinata.cloud', 'arweave.net'], // Add your image domains here
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      {
        module: /node-fetch/,
        message: /.*Can't resolve 'encoding'.*/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;
