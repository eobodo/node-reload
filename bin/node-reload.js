#!/usr/bin/env node

'use strict';

let path = require('path');
let fs = require('fs');
let child_process = require('child_process');

let gulp = require('gulp');
let glob = require('glob');

function init() {
  let config = require(path.resolve(process.argv[2]));

  if (!config) {
    throw new Error('Expected String path to config file');
  }

  //let argList = process.argv.slice(4, process.argv.length);

  //Load config file or JSON literal
  /*
  if (config[0] === '{') {
    config = JSON.parse(config);
  } else {
    config = JSON.parse(fs.readFileSync(config));
  }
  */

  //Init
  if (!config.watch || !Array.isArray(config.watch)) 
    throw new Error('No source path found');

  return config;
}

function buildCommand() {
  let command = '';

  let count = 0;
  let keys = Object.keys(config.args);
  for (let c of keys) {
    let value = config.args[c];

    if (Array.isArray(value)) {
      value = `[${value.toString()}]`;
    } else if (typeof value === 'object') {
      //TODO Manually convert object to string
      value = JSON.stringify(value);
    }

    command += `-${c} ${value} `;
    count++;
  }

  let commandPrefix = {
    //TODO Add clear screen method for windows console
    win32: '',
    linux: 'clear;',
  };

  command = `${commandPrefix[platform]} ${process.argv[0]} ${config.entry} ${command}`;

  return command;

}

function buildWatchList() {
  //Resolve files to watch
  let watchList = [];

  for (let l of config.watch) {
    let locs = glob.sync(l, {});
    watchList.push(...locs);
  }

  return watchList;
}

function relogger(logMsg) {
  if (config.log)
    console.log(logMsg);
}

let proc;
let pid = undefined;
let platform = process.platform;

let config = init();
let command = buildCommand();
let watchList = buildWatchList();

let options = {
  stdio: [process.stdin, 'pipe', 'pipe'],
  shell: [(platform !== 'win32') ? true : false],
};

//Run Gulp
console.log(`Watching: ${watchList.length} files\n`);

gulp.task('default', ['start-process']);

gulp.task('start-process', ['kill-process'], (cb) => {
  relogger(`Current process id: ${pid}`);

  proc = child_process.spawn(command, [], options);
  pid = proc.pid;
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stdout);

  proc.on('close', (data) => {
    relogger(`\n*** Reload success *** \n`);
  });

  cb();
});

gulp.task('kill-process', (cb) => {
  relogger(`Killing previous process id: ${pid}`);
  relogger(`\n*** Reload complete *** \n`);

  if (proc !== undefined) 
    proc.kill();

  cb();
});

gulp.watch(config.watch, ['start-process']);
