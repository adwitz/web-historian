var fs = require('fs');
var path = require('path');
var http = require('http');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'web_historian'
});


exports.readUrls = readUrls = function(filePath, cb){
  var sites;
  fs.readFile(filePath, "utf8", function(error, content){
    if (error){
      return;
    } else {
      sites = content.split('\n');
      sites.splice(sites.length - 1, 1);
      console.log(sites);
      cb(sites);
    }
  });
};

exports.downloadUrls = function(urls){
  dbConnect(loopThruUrls, urls);
};

exports.dbWrite = dbWrite = function(url, data) {
  console.log('writing', url, 'to database');
  connection.query("insert into archive (url, html, stamp) values (?, ?, NOW())", [url, data], function(error, rows) {
    if (error) {
      console.log('error inserting', error);
    } else {
      console.log('inserted successfully');
      // connection.end(function(error) {
      //   if (error) {
      //     console.log('error terminating connection');
      //   } else {
      //     console.log('successfully terminated connection');
      //   }
      // });
    }
  });
};

exports.fileWrite = fileWrite = function(url, data) {
  var filePath = path.resolve(__dirname, '../../data/sites/' + url);
  fs.writeFile(filePath, data, function(error) {
    if (error) {
      console.log('failed to write successfully');
    } else {
      console.log('wrote successfully');
    }
  });
};

exports.initiateRequest = initiateRequest = function(url) {
  var options = {
    host: url,
    path: '/'
  };
  http.get(options, function(res) {
    var data = '';
    res.on('data', function(chunk){
      data += chunk;
    });
    res.on('end', function(){
      //fileWrite(urls[i], data);
      dbWrite(url, data);
    });
  });
};

exports.dbConnect = dbConnect = function(cb, urls) {

  connection.connect(function(error) {
    if (error) {
      console.log('error connecting to DB');
    } else {
      cb(urls);
    }
  });
};

exports.loopThruUrls = loopThruUrls = function(urls) {
  for (var i = 0; i < urls.length; i++) {
    initiateRequest(urls[i]);
  }
};

