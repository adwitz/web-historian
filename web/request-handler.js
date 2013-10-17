var path = require('path');
var url = require('url');
var fs = require('fs');

module.exports.datadir = path.resolve(__dirname, "../data/sites.txt"); // tests will need to override this.



exports.sendResponse = sendResponse = function(response, content, status, contentType) {
  status = status || 200;
  var headers = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10 // Seconds.
  };
  contentType = contentType || "text/html";
  headers['Content-Type'] = contentType;

  response.writeHead(status, headers);
  response.end(content);
};

exports.findSite = findSite = function(req, res) {
  pathName = url.parse(req.url).pathname;
  if (pathName === '/') {
    pathName = path.resolve(__dirname,'./public/index.html');
  } else if (pathName === '/styles.css') {
    pathName = path.resolve(__dirname, './public/styles.css');
  } else {
    pathName = path.resolve(__dirname, '../data/sites' + pathName);
  }
  fs.exists(pathName, function(exists) {
    if (exists) {
      fs.readFile(pathName, function(error, content) {
        if (error) {
          sendResponse(res, '', 404);
        } else {
          if(path.extname(pathName) === '.css'){
            sendResponse(res, content, 200, 'text/css');
          } else {
            sendResponse(res, content, 200);
          }
        }
      });
    } else {
      sendResponse(res, '', 404);
    }
  });
};

exports.addToSiteList = addToSiteList = function(req, res) {
  var site = req._postData.url;
  var pathName = module.exports.datadir;
  fs.readFile(pathName, 'utf8', function(error, content){
    if (error){
      sendResponse(res, '', 500);
    } else {
      console.log('reading the file successfully');
      console.log('content of the file', content);
      if (content.indexOf(site) === -1){
        fs.appendFile(pathName, site + '\n', function(error) {
          if (error) {
            sendResponse(res, '', 500);
          } else {
            sendResponse(res, '', 302);
          }
        });
      } else {
        sendResponse(res, '', 302); // should probably use code 201 rather than 302
      }
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
      addToSiteList(req, res);
      break;

    case 'OPTIONS':
      //sendResponse(res, null);
      break;

    default:
      sendResponse(res, null, 404);
      break;
  }
};
