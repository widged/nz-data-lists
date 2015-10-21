#!/usr/bin/env babel-node

var fs = require("fs");
var request = require('request');

request('https://wiki.open.org.nz/wiki/display/main/New+Zealand+APIs', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	fs.writeFileSync('wiki-open-org-nz-apis.html', body, 'utf8');
    console.log('`wiki-open-org-nz-apis.html` saved locally');
  }
});
