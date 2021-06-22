const path = require('path');

module.exports = {
  mode: 'development',
  entry: './javascript/game.js',
  output: {
    filename: 'game_wp.js',
    path: path.resolve(__dirname, 'javascript'),
  },
  devtool: "eval-source-map"
};
