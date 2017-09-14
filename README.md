# Multi-Get
JavaScript command line application for downloading file in multiple requests

### Getting Started

To setup all node dependencies and build run (requires node package manager):
`npm install -g`

Now you can run the script by running:
`multi-get [OPTIONS] <url>`

On Windows there may be some problems with running the above command, due to Windows paths, run the following
`node multi-get.js [OPTIONS] <url>`
from a directory with the multi-get.js file.

### Open-Source Libraries

async: (https://github.com/caolan/async)

Used primarily for the async.map() method, which allows for parallel execution of asynchronous calls. Also made it easier to piece together the file chunks downloaded from the parallel requests, since it keeps the order of the original array in the map() method.

commander: https://www.npmjs.com/package/commander

Used to handle command line arguments.

synchronize: http://alexeypetrushin.github.io/synchronize/docs/index.html

Used await() and defer() from this library to execute asynchronous requests synchronously, and make code easier to read. 
