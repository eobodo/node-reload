'use strict';

let gulp = require('gulp');
let fs = require('fs');
let child_process = require('child_process');
let path = require('path');

let argList = process.argv.slice(2, process.argv.length);
if (!argList[0]) throw new Error('No source path found');
let src = argList[0];
let proc;
let pid = undefined;
let loc = path.resolve(src);
let plat = process.platform;

let command = {
  win32: 'node',
  linux: 'clear; node',
};

let options = {
  stdio: [process.stdin, 'pipe', 'pipe'],
  shell: [(plat !== 'win32') ? true : false],
};

console.log('Watching:', loc, '\n');

gulp.task('default', ['start-process']);

gulp.task('start-process', ['kill-process'], (cb) => {
  console.log(`Process PID is ${pid}`);

  proc = child_process.spawn(command[plat], argList, options);
  pid = proc.pid;
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stdout);

  proc.on('close', (data) => {
    console.log(`\n*** Reload complete *** \n`);
  });

  cb();
});

gulp.task('kill-process', (cb) => {
  //console.log(`Killing process ${pid}`);

  if (proc !== undefined) proc.kill();
  cb();
});

gulp.watch(src, ['start-process']);
