# node-reload 

Configuration based file watcher/reloader for node.js.

```javascript
npm install -g node-reload
```

## Usage

Here's a sample configuration file. Current convention is to name it "reload-config.js".

```javascript
let config = {
  'entry': 'test/main.js',
  'args': {
    'source': 'path/to/somewhere.js',
  },
  'watch': ['./*.js', './test/*.js'],
  'log': true,
};

module.exports = config;
```

Load exported configuration.

```javascript
node-reload "path/to/reload-config.js"
```

## API
```javascript
{
  //This file will reload on change
  "entry": String, 
  //Object will be convert into an argument string
  "args": Object <Any>,
  //Array of files to watch
  "watch": Array <String>,
  //Log events to console
  "log": Boolean,
}
```
