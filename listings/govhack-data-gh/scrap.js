#!/usr/bin/env babel-node

/* jshint esnext: true */

import {loadHtml} from '../../lib/jsdom-helper.js';
import {cleanText} from '../../lib/scrap-helper.js';

var fs = require("fs");

let lines = scrap(fs.readFileSync('govhack-data-wiki.md', 'utf8'));
let piped = ['title,url'.split(',')].concat(lines);
let body = piped.map((d) => d.join('\t')).join('\n');
fs.writeFileSync('links.tsv', body, 'utf8');
console.log('`links.tsv` updated.');


function scrap(md) {
	let lines = [];
	md.split('* ').forEach((d) => {
		var m = d.match(/\[(.*?)\]\((.*?)\)/);
		if(m) {
			d = d.replace(m[0] , m[1]);
			lines.push([cleanText(d),m[2]])
		}
	})

	return lines;

}
