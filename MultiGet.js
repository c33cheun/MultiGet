var http = require('http');
var fs = require('fs');

var downloadURL;
var isParallel = false;
const defaultFile = "384MB.jar";
var destination = defaultFile;

// check if we have command line arguments, we always have 2 by default ['node', 'MultiGet.js']
if (process.argv.length > 2) {
  // check if we have the custom flag
  if (process.argv.includes('-parallel')) {
    isParallel = true;
  }

  // check if the user is saving to a different location and set destination accordingly
  if (process.argv.includes('-o')) {
    destination = process.argv[process.argv.indexOf('-o') + 1];
  }

  // set downloadURL based on last argument of process.argv
  downloadURL = process.argv[process.argv.length - 1];

  // make sure user actually provided a destination, if not, use default
  if (downloadURL === destination) {
    console.log("Download destination not provided, using default...");
    downloadURL = defaultFile;
  }
} else {
  console.log("Usage: node MultiGet.js [OPTIONS] <url to download from>");
  console.log("example: node MultiGet.js -parallel www.google.com?file");
  console.log("-o <destination file>");
  console.log("   Write to custom destination file instead of default");
  console.log("-parallel");
  console.log("   Download chunks in paraleel instead of sequentially");
}

console.log(downloadURL);
console.log(destination);

// process command line arguments from process.argv


var download = function(url, dest, cb) {
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET","data.dat",false);
  xmlhttp.setRequestHeader("Range", "bytes=100-200");
  xmlhttp.send();

  var file = fs.createWriteStream(dest);
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
