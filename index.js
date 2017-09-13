#!/usr/bin/env node
const url = require('url');
var http = require('http');
var fs = require('fs');
var program = require('commander');

var downloadURL;
var isParallel = false;
const defaultFile = "384MB.jar";
var destination = defaultFile;

// process command line arguments from process.argv, using commander module from node
program
  .arguments('<url>')
  .option('-p, --parallel', 'Download chunks in parallel instead of sequentially')
  .option('-o, --overwrite <destination>', 'Write to custom destination file instead of default')
  .action(function (urlOption) {
    downloadURL = urlOption;
  })
  .parse(process.argv);

// check if we have command line arguments, we always have 2 by default ['node', 'MultiGet.js'], output help if we have nothing and exit
if (!process.argv.slice(2).length) {
  program.help();
}

// if we are given command line options but not a download url, ouput error and exit
if (typeof downloadURL === 'undefined') {
   console.error('No URL to download from provided!');
   process.exit(1);
}

// set options if present
if (program.parallel) {
  isParallel = true;
}

if (program.overwrite) {
  destination = program.overwrite;
}

console.log("Downloading from: " + downloadURL);
console.log("Downloading file to: " + destination);

checkFile(destination);

if (isParallel) {

} else {
  console.log("Starting download...");
  download1();
}

// FUNCTIONS

// check to see if destination file exists already and delete if present, repurposed from (https://stackoverflow.com/questions/5315138/node-js-remove-file)
function checkFile(destination) {
  fs.exists(destination, function(exists) {
    if(exists) {
      console.log('File exists. Deleting now ...');
      fs.unlink(destination);
    } else {
      //Show in red
      console.log('File not found, so not deleting.');
    }
  });
}

function download1() {
  download(downloadURL, destination, "bytes=0-1048575", download2);
}

function download2() {
  download(downloadURL, destination, "bytes=1048576-2097151", download3);
}

function download3() {
  download(downloadURL, destination, "bytes=2097152-3145727", download4);
}

function download4() {
  download(downloadURL, destination, "bytes=3145728-4194303");
}

function download(urlString, dest, range, cb) {
  var urlObject = url.parse(urlString);
  var options = {
      hostname: urlObject.hostname,
      port: urlObject.port,
      path: urlObject.pathname,
      method: 'GET',
      headers: {
          accept: 'application/json',
          range: range
      }
  };

  var request = http.get(options, function(response) {
    response.on("data", function(chunk) {
      fs.appendFile(dest, chunk, function (err) {
        if (err) throw err;
      });
    });
    console.log('Wrote to file: ' + range);
    // run callback after
    if (cb) {
      cb();
    }
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    console.error(`Got error: ${err.message}`);
  });
};
