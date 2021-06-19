const path = require('path');

module.exports = {
  mode: 'development',
  entry: './javascript/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'javascript'),
  },
  devtool: "eval-source-map"
};
