#!/usr/bin/env node
'use strict';

const fs = require('fs');
const minimist = require('minimist');
const glob = require('glob');

const readArgv = () => {
  const argv = minimist(process.argv.slice(2));
  return {
    source: argv.source || './dist/web/mainnet/min/',
    dist: argv.dist || './sw/service-worker1.js',
    templatePath: argv.template || './sw/sw-template.js',
    cacheStore: argv.cache || 'acryl',
    navigationFallback: argv.navigationFallback || './index.html'
  };
}

const removeFile = (path) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

const isDirectory = (path) => {
  return fs.lstatSync(path).isDirectory();
}
// '**/*'
const getFiles = (source) => {
  return glob.sync('**/*', { cwd: source }).filter(path => !isDirectory(source + path));
};

const arrayToString = (array) => {
  const strings = array.map(item => `'${item}'`).join(', ');
  return `[${strings}]`;
}

const generateSWFile = () => {
  const argv = readArgv();
  removeFile(argv.dist);

  const template = fs.readFileSync(argv.templatePath, 'utf-8');
  const internalFiles = getFiles(argv.source);
  const intFilesCorrectPath = internalFiles.map(filePath => '/' + filePath);
  // intFilesCorrectPath.push('./../service-worker.js');
  const externalFiles = [
    // here you can add some external files that you want to have cached
  ];
  const files = arrayToString([...intFilesCorrectPath, ...externalFiles]);
  const content = [
    `const $CACHE_STORE = '${argv.cacheStore}';`,
    `const $NAVIGATION_FALLBACK = '${argv.navigationFallback}';\n`,
    `const $FILES = ${files};\n`,
    template
  ].join('\n');
  fs.writeFileSync(argv.dist, content, 'utf-8');
};

generateSWFile();