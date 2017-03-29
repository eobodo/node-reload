#!/usr/bin/env node
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const gulp = require('gulp');
const glob = require('glob');

function buildCommand(config) {
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

  command = `${commandPrefix[process.platform]} ${process.argv[0]} ${config.entry} ${command}`;

  return command;
}

function buildWatchList(config) {
  //Resolve files to watch
  let watchList = [];

  for (let l of config.watch) {
    let locs = glob.sync(l, {});
    watchList.push(...locs);
  }

  return watchList;
}

function relogger(logMsg) {
  if (configRef.log)
    console.log(logMsg);
}

function loadConfig(argv) {
  if (argv._.length === 0) {
    throw new Error('Expected path to config file');
  }

  let configPath = path.resolve(argv._[0]);
  let config = require(configPath);

  if (!config.entry || typeof config.entry !== 'string')
    throw new Error('Config file must contain an "entry" property with String as value');

  if (!config.watch || !Array.isArray(config.watch)) 
    throw new Error('Config file must contain a "watch" property with Array as value');

  //Add entry to watch list
  config.watch.push(config.entry)

  return config;
}

let configRef;

(function () {
  let config = loadConfig(argv);
  let command = buildCommand(config);

  let watchList = buildWatchList(config);
  configRef = config;

  let options = {
    stdio: [process.stdin, 'pipe', 'pipe'],
    shell: [(process.platform !== 'win32') ? true : false],
  };

  let proc;
  let pid = undefined;

  //Run Gulp
  console.log(`Watching: ${watchList.length} files\n`);

  gulp.task('start-process', ['kill-process'], (cb) => {
    proc = child_process.spawn(command, [], options);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stdout);

    relogger(`Current process id: ${proc.pid}\n`);

    proc.on('exit', (signal) => {
      relogger(`\n*** Reload success *** \n`);
    });

    cb();
  });

  gulp.task('kill-process', (cb) => {
    if (proc !== undefined) {
      proc.kill();
    }

    cb();
  });

  gulp.watch(config.watch, ['start-process']);
})();
