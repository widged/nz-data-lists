#!/usr/bin/env node

var fs = require("fs");
var request = require('request');

request('http://cat.open.org.nz/category/dataset/page/1/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	fs.writeFileSync('cat-open-org-nz-1.html', body, 'utf8');
    console.log('`cat-open-org-nz-1.html` saved locally');
  }
});

request('http://cat.open.org.nz/category/dataset/page/2/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	fs.writeFileSync('cat-open-org-nz-2.html', body, 'utf8');
    console.log('`cat-open-org-nz-2.html` saved locally');
  }
});
