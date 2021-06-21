const path = require('path');

module.exports = {
  mode: 'development',
  entry: './javascript/room.js',
  output: {
    filename: 'room-main.js',
    path: path.resolve(__dirname, 'javascript'),
  },
  devtool: "eval-source-map"
};
 