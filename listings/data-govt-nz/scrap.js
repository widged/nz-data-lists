#!/usr/bin/env babel-node

/* jshint esnext: true */

var csv = require("fast-csv");
var fs = require("fs");
import {cleanText} from '../../lib/scrap-helper.js';

var stream = fs.createReadStream("data-govt-nz.csv");

var headers = 'Title,Url,DatasetType,Agency,AgencyContact,AgencyContactEmail,AgencyContactPhone,Description,Format,UpdateFrequency,Cost,CostInformation,SubmissionSource,Licence,LicenceURL,Date listed,Date last updated,DatasetLastUpdated,DatasetCreation,Guid'.split(',');
var keep = [
  {header: 'Title'           , replace: 'title'},
  {header: 'Url'             , replace: 'url'},
  {header: 'Agency'          , replace: 'agency'},
  {header: 'Description'     , replace: 'description'},
  {header: 'Format'          , replace: 'format'},
  {header: 'UpdateFrequency' , replace: 'update_frequency'},
  {header: 'Cost'            , replace: 'cost'},
  {header: 'Licence'         , replace: 'license'}
];
let newHeaders = keep.reduce((acc, {header, replace}) => {
  let idx  = headers.indexOf(header);
  acc[idx] = replace;
  return acc;
}, []);

var lines = [];
var csvStream = csv()
    .on("data", function(data,i){
      let line;
      if(!lines.length){
        // first line contains headers`
        line = data.map((d,i) => { return newHeaders[i]; });
      } else {
        line = data.map(cleanText);
      }
      let keep = line.filter((d, i) => { return newHeaders[i]; });
      lines.push(keep);
    })
    .on("end", function(){
		let body = lines.map((d) => d.join('\t')).join('\n');
    	fs.writeFileSync('links.tsv', body, 'utf8');
      console.log('`links.tsv` updated.');
    });

stream.pipe(csvStream);
