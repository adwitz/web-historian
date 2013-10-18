// eventually, you'll have some code here that uses the tested helpers 
// to actually download the urls you want to download.
var path = require('path');

var fetcherhelpers = require('./lib/html-fetcher-helpers');

var crawl = function() {
  fetcherhelpers.readUrls(fetcherhelpers.downloadUrls);
};
crawl();