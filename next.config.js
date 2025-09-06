const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');
const withVideos = require('next-videos');

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  trailingSlash: true,
  // Use relative asset prefix only for production/export. Disable in dev to keep HMR working.
  assetPrefix: isDev ? '' : '.',
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: function (config) {
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]'
        }
      }
    })
    return config
  },
  images: {
    disableStaticImages: true,
  }
};

module.exports = withPlugins([withImages, withVideos], nextConfig);
