var fs = require('fs');
var path = require('path');
var http = require('http');


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
  for (var i = 0; i < urls.length; i++) { 
    var filePath = path.resolve(__dirname, '../../data/sites/' + urls[i]);
    var options = {
      host: urls[i],
      path: '/'
    };
    http.get(options, function(res) {
      var data = '';
      res.on('data', function(chunk){
        data += chunk;
      });
      res.on('end', function(){
        fs.writeFile(filePath, data, function(error) {
          if (error) {
            console.log('failed to write successfully');
          } else {
            console.log('wrote successfully');
          }
        });
      });
    });
  }
};



