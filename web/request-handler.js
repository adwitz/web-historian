var path = require('path');
var url = require('url');
var fs = require('fs');

module.exports.datadir = path.join(__dirname, "../data/sites.txt"); // tests will need to override this.

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};


exports.sendResponse = sendResponse = function(response, content, status) {
  status = status || 200;
  response.writeHead(status, headers);
  response.end(content);
  console.log('Responding with content', content, 'and', status);
};

exports.findSite = findSite = function(req, res) {
  pathName = url.parse(req.url).pathname;
  if (pathName === '/') {
    pathName = './public/index.html';
  } else {
    pathName = '../data/sites' + pathName;
  }
  console.log('pathName', pathName);
  fs.exists(pathName, function(exists) {
    if (exists) {
      fs.readFile(pathName, function(error, content) {
        if (error) {
          sendResponse(res, '', 404);
        } else {
          sendResponse(res, content, 200);
        }
      });
    } else {
      sendResponse(res, '', 404);
    }
  });
};


module.exports.handleRequest = function (req, res) {
  console.log(exports.datadir);

  switch( req.method ){
    case 'GET':
      findSite(req, res);
      break;

    case 'POST':
      
      break;

    case 'OPTIONS':
      sendResponse(res, null);

    default:
      sendResponse(res, null, 404);
      break;
  }
};
