var path = require('path');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');
var fetcherhelpers = require('../workers/lib/html-fetcher-helpers');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'web_historian'
});

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

exports.checkSitesList = checkSitesList = function(req, res, site) {
  fetcherhelpers.readQuery(checkArchivingAlready, req, res, site);
};

exports.checkArchivingAlready = checkArchivingAlready = function(urls, req, res, site) {
  var found = false;
  for (var j = 0; j < urls.length; j++) {
    if (site === urls[j]) {
      found = true;
    }
  }
  if (!found) {
    connection.query('insert into list (url) values (?)', [site], function(error, rows) {
      if (error) {
        console.log('error adding', site, 'to list:', error);
        sendResponse(res, '', 500);
      } else {
        console.log('added', site, 'to list');
        sendResponse(res, '', 201);
      }
    });
  } else {
    sendResponse(res, '', 302);
  }
};

exports.collectInput = collectInput = function(request, response, cb){
  var data = '';
  request.on('data', function(chunk){
    data += chunk;
  });
  request.on('end', function(){
    var site = data.split('=')[1];
    cb(request, response, site);
  });
};


module.exports.handleRequest = function (req, res) {
  console.log(exports.datadir);

  switch( req.method ){
    case 'GET':
      findSite(req, res);
      break;

    case 'POST':
      collectInput(req, res, checkSitesList);
      break;

    case 'OPTIONS':
      //sendResponse(res, null);
      break;

    default:
      sendResponse(res, null, 404);
      break;
  }
};
