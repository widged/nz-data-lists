#!/usr/bin/env babel-node

var fs = require("fs");
var request = require('request');

request('http://govhack.org.nz/2015-data/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	fs.writeFileSync('govhack-data-2015.html', body, 'utf8');
    console.log('`govhack-data-2015.html` saved locally');

  }
});
