#!/usr/bin/env babel-node

/* jshint esnext: true */

import {loadHtml} from '../../lib/jsdom-helper.js';
import {cleanText} from '../../lib/scrap-helper.js';

var fs = require("fs");

let lines = scrap(fs.readFileSync('listing.md', 'utf8'));
let piped = ['title,url,description,agency'.split(',')].concat(lines);
let body = piped.map((d) => d.join('\t')).join('\n');
fs.writeFileSync('links.tsv', body, 'utf8');
console.log('`links.tsv` updated.');


function listAndSublist(agencies) {
	let list = [];

	agencies.split(/^\- /mg).forEach((agency) => {
		let agencyName;
		agency.split(/^  \- /mg).forEach((item,i) => {
			if(i === 0) { agencyName = item; return; }
			let m = item.match(/\[(.*?)\]\((.*?)\)/);
			let title, url, description;
			if(m) {
				[,title,url] = m;
				description = item.replace(m[0], '').replace(/^[^a-z\(]+/i, '');
				list.push([cleanText(title), url, cleanText(description), cleanText(agencyName)]);
			}
		})
	})
	return list;
}


let category;
function scrap(md) {
	let lines = [];

	let sections = md.split(/\#\#\#\s*/mi);

	sections.forEach((section) => {
		if(section.substr(0,1) === '#') { return; }
		let mHeading = section.match(/^(.*?)$/mi);
		let heading = mHeading[1];
		section = section.replace(heading, '');
		lines = lines.concat(listAndSublist(section));
	})
	return lines;
}
