#!/usr/bin/env babel-node

var fs = require("fs");
var request = require('request');

request('https://docs.google.com/spreadsheet/pub?key=1M-dAy2_oaHugkx8kPYguA_IrYVEKWeejLPCFth506qY&single=true&gid=0&output=csv', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	fs.writeFileSync('New Zealand Datasets - Sheet1.csv', body, 'utf8');
    console.log('`New Zealand Datasets - Sheet1.csv` saved locally');
  }
});
