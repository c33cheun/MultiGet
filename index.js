#!/usr/bin/env node
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
  .action(function (url) {
    downloadURL = url;
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

console.log(downloadURL);
console.log(destination);



var download = function(url, dest, cb) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","data.dat",false);
  xmlhttp.setRequestHeader("Range", "bytes=100-200");
  xmlhttp.send();

  var file = fs.createWriteStream(dest);

  var options = {
      host: 'localhost',
      port: 7474,
      path: '/db/data',
      method: 'GET',
      headers: {
          accept: 'application/json'
      }
  };

  http.get(url, (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        console.log(parsedData);
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });

  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
