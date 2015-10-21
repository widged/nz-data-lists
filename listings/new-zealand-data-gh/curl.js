#!/usr/bin/env babel-node

var fs = require("fs");
var request = require('request');

request('https://raw.githubusercontent.com/PrototypeAlex/new-zealand-data/master/README.md', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	fs.writeFileSync('listing.md', body, 'utf8');
    console.log('`listing.md` saved locally');
  }
});
