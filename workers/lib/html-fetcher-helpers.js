var fs = require('fs');
var path = require('path');
var http = require('http');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'web_historian'
});

exports.readUrls = readUrls = function(cb){
  if (!connection) {
    dbConnect(function() {
      readQuery(cb);
    });
  } else {
    readQuery(cb);
  }
};

exports.dbConnect = dbConnect = function(cb) {
  connection.connect(function(error) {
    if (error) {
      console.log('error connecting to DB');
    } else {
      cb();
    }
  });
};

exports.readQuery = readQuery = function(cb, req, res, site) {
  connection.query('select url from list', function(error, rows) {
    if (error) {
      console.log('error reading urls from database:', error);
    } else {
      var urls = [];
      for (var i = 0; i < rows.length; i++) {
        urls.push(rows[i].url);
      }
      cb(urls, req, res, site);
    }
  });
};

exports.downloadUrls = function(urls){
  for (var k = 0; k < urls.length; k++) {
    initiateRequest(urls[k]);
  }
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
      dbWrite(url, data);
    });
  });
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







