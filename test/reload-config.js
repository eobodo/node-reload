let path = require('path');

let basedir = '.';

let config = {
  "entry": path.join(basedir, 'test/main.js'),
  "args": {
    'h': undefined,
  },
  "watch": ["./*.js", "./test/*.js"],
  "log": true,
};

module.exports = config;
