const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      // Handle images and SVGs
      {
        test: /\.(png|jpe?g|gif|svg|pdf)$/i,
        type: 'asset', // Use Webpack 5 built-in asset type
        parser: {
          dataUrlCondition: {
            maxSize: 100 * 1024, // Adjust limit based on your preference (100KB here)
          },
        },
      },
      // Babel loader for JS files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // 'es2015' is deprecated, use '@babel/preset-env'
            compact: true,
          },
        },
      },
    ],
  },
  optimization: {
    minimizer: [
      '...',
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.svgoMinify,
          options: {
            encodeOptions: {
              multipass: true,
              plugins: ['preset-default'],
            },
          },
        },
      }),
    ],
  },
};
