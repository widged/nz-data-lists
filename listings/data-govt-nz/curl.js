#!/usr/bin/env babel-node

var fs = require("fs");
var request = require('request');

request('https://data.govt.nz/search/csv/?q=&CategoryID=0', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	fs.writeFileSync('data-govt-nz.csv', body, 'utf8');
    console.log('`data-govt-nz.csv` saved locally');
  }
});
