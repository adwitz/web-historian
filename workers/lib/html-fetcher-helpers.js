var fs = require('fs');

exports.readUrls = function(filePath, cb){
  var sites;
  fs.readFile(filePath, "utf8", function(error, content){
    if (error){
      return;
    } else {
      sites = content.split('\n');
      cb(sites);
    }
  });
};

exports.downloadUrls = function(urls){
  // fixme
};
