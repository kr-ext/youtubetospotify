const { merge } = require('webpack-merge');
const common = require('./webpack.common.config');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const publicPath = '/';
const PORT = 8080;

var options = {
  devServer: {
    hot: true,
    disableHostCheck: true,
    historyApiFallback: true,
    index: 'popup.html',
    port: PORT,
    publicPath,
  },
  mode: process.env.NODE_ENV || 'development',
  devtool: 'inline-source-map',
  output: {
    filename: '[name].bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '..', 'src', 'dev.html'),
      filename: 'dev.html',
      chunks: ['content'],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json',
          transform(content) {
            const jsonObject = JSON.parse(content.toString());

            jsonObject.externally_connectable = {
              matches: ['http://localhost:8080/*'],
            };
            jsonObject.permissions.push('http://localhost:8080/*');

            return Buffer.from(JSON.stringify(jsonObject));
          },
        },
      ],
    }),
  ],
};

const serverConfig = merge(common, options);
module.exports = serverConfig;
