/**
 * Client Webpack config
 */
const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./base.config');

const config = merge(baseConfig, {
  entry: path.resolve(__dirname, '../src/entry-client.js'),
  output: {
    path: path.resolve(__dirname, '../.ssr'),
    publicPath: '/.ssr/', // static folder served by server
    filename: 'entry-client.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    },
  },
  // devServer: {
  //   host: '0.0.0.0',
  //   port: 3000,
  //   disableHostCheck: true,
  //   historyApiFallback: true,
  //   inline: true,
  //   hotOnly: true, // hot reload
  //   before: require('./compile'), // mock server compile in development
  //   // write files on disk for mock server usage
  //   writeToDisk: (filepath) => /index.html|entry-client.js/g.test(filepath),
  //   overlay: { errors: true },
  // },
});

config.plugins.push(new HtmlWebpackPlugin({
  template: path.resolve(__dirname, '../index.html'),
  filename: 'index.html',
  inject: 'body',
}));

module.exports = config;