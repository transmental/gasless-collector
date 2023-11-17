/** @type {import('next').NextConfig} */
const nextConfig = {
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
