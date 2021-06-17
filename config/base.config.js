/**
 * Base Webpack config
 */
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const config = {
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: isProd, // extract css when production
        },
      },
      {
        test: /\.s?css$/,
        use: [
          // extract css when production
          isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              esModule: false,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              additionalData: '',
            },
          },
        ],
      },
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  optimization: {
    minimizer: [],
  },
};

if (isProd) {
  config.plugins.push(new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash].css',
    chunkFilename: 'css/[id].[contenthash].css',
  }));
  config.optimization.minimizer.push(new TerserPlugin());
}

module.exports = config;
