/**
 * Server Webpack config
 */
const path = require('path');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const baseConfig = require('./base.config');

const config = merge(baseConfig, {
  entry: path.resolve(__dirname, '../src/entry-server.js'),
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, '../.ssr'),
    filename: 'entry-server.js',
    library: {
      type: 'module', // native nodejs module
    },
  },
  target: 'node', // in node env
  node: {
    // tell webpack not to handle following
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals({
    // polyfill, .vue, .css
    allowlist: [
      // /^vue-meta*/,
      /\.(css|sass|scss)$/,
      /\.(vue)$/,
      /\.(html)$/,
    ],
  })], // external node_modules deps
});

module.exports = config;