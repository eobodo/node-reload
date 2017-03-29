let path = require('path');

let basedir = '.';

let config = {
  "entry": path.join(basedir, 'test/main.js'),
  "args": {
    'a': 1,
    'l': 'load',
  },
  "watch": ["./test/*.js"],
  "log": true,
};

module.exports = config;
