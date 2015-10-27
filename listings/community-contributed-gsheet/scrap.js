#!/usr/bin/env babel-node

/* jshint esnext: true */

var csv = require("fast-csv");
var fs = require("fs");
import {cleanText} from '../../lib/scrap-helper.js';

var stream = fs.createReadStream("New Zealand Datasets - Sheet1.csv");

var headers = 'title,url,description,publisher,format,license,cost,thumbnail'.split(',');

var lines = [];
var csvStream = csv()
    .on("data", function(data,i){
      let line;
      if(!lines.length){
        // first line contains headers`
        line = data.map((d,i) => { return headers[i]; });
      } else {
        line = data.map(cleanText);
      }
      lines.push(line);
    })
    .on("end", function(){
		let body = lines.map((d) => d.join('\t')).join('\n');
    	fs.writeFileSync('links.tsv', body, 'utf8');
      console.log('`links.tsv` updated.');
    });

stream.pipe(csvStream);
