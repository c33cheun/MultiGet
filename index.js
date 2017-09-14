#!/usr/bin/env node
const url = require('url');
const http = require('http');
const fs = require('fs');
const program = require('commander');

// synchronize is a npm library for making async requests sequential
const sync = require('synchronize');
var fiber = sync.fiber;
var await = sync.await;
var defer = sync.defer;


var downloadURL;
var isParallel = false;
const defaultFile = "384MB.jar";
var destination = defaultFile;

// store the ranges for the html request header in this const object for easy reference
const byteRanges = {
  1: "bytes=0-1048575",
  2: "bytes=1048576-2097151",
  3: "bytes=2097152-3145727",
  4: "bytes=3145728-4194303"
}

main();

function main() {
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
     console.error('No Source URL to download from provided!');
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

  // check and delete already present destination file
  checkFile(destination);

  // create url object for use in http requests
  downloadURL = url.parse(downloadURL);

  if (isParallel) {

  } else {
    console.log("Starting download...");
    downloadParts();
  }

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
      console.log('Creating new file...');
    }
  });
}

function downloadParts() {
  // use synchronize library to defer async functions until they finish
  try {
    fiber(function () {
      await(downloadSync(1, defer() ));
      await(downloadSync(2, defer() ));
      await(downloadSync(3, defer() ));
      await(downloadSync(4, defer() ));
      await(finishDownload());
    })
  } catch(err) {
    console.log("Error: " + err);
  }
}

function finishDownload() {
  console.log("Done.");
}

function downloadSync(range, cb) {
  var options = {
      hostname: downloadURL.hostname,
      port: downloadURL.port,
      path: downloadURL.pathname,
      method: 'GET',
      headers: {
          accept: 'application/json',
          range: byteRanges[range]
      }
  };

  var request = http.get(options, function(response) {
    // to hold chunks of data
    response.on("data", function(chunk) {
      fs.appendFileSync(destination, chunk)
    });

    response.on("end", function() {
      console.log('Wrote to file: ' + byteRanges[range]);

      if (cb) {
        cb();
      }
    });

  }).on('error', function(err) { // Handle errors
    fs.unlink(destination); // Delete the file async. (But we don't check the result)
    console.log(`Got error: ${err.message}`);
  });
}
