module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|pdf)$/i,
        type: 'assets',
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
};
