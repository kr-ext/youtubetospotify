const { merge } = require('webpack-merge');
const common = require('./webpack.common.config');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const options = {
  mode: 'production',

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json',
          transform(content, absoluteFrom) {
            const jsonObject = JSON.parse(content.toString());
            jsonObject.externally_connectable = {
              matches: ['*://*.paradify.com/*'],
            };
            jsonObject.permissions.push('*://*.paradify.com/*');
            return Buffer.from(JSON.stringify(jsonObject));
          },
        },
      ],
    }),
    new CleanWebpackPlugin(),
  ],
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({})],
  },
};

const serverConfig = merge(common, options);
module.exports = serverConfig;
