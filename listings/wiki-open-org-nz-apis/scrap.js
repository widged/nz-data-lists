#!/usr/bin/env babel-node

/* jshint esnext: true */

import {loadHtml} from '../../lib/jsdom-helper.js';
import {cleanText} from '../../lib/scrap-helper.js';

var fs = require("fs");

let lines = scrap(fs.readFileSync('wiki-open-org-nz-apis.html', 'utf8'));
let piped = ['title,url,description,format'.split(',')].concat(lines);
let body = piped.map((d) => d.join('\t')).join('\n');
fs.writeFileSync('links.tsv', body, 'utf8');
console.log('`links.tsv` updated.');


function scrap(html) {
	let lines = [];
	let document = loadHtml(html);
	var content = document.querySelector('#content');
	var entries = Array
		.from(content.querySelectorAll('p'))
		.filter((d, i) => {return i > 0;})
		.reduce((acc, p, i) => {
			if(!Array.isArray(acc)) { acc = []; }
			let links = Array.from(p.querySelectorAll('a')).map((a) => {
				var o = {text: cleanText(a.textContent), url: a.getAttribute('href')};
				a.parentNode.removeChild(a);
				return o;
			});
			if(i % 2 === 0) {
				let title = p.innerHTML;
				acc.push({title, links: links || []})
			} else {
				let lastEntry = acc[acc.length-1];
				lastEntry.links = lastEntry.links.concat(links);
				lastEntry.description =  p.innerHTML;
			}
			return acc;
		}, null)
		.map(({title, description, links}) => {
			var primary = links.shift();
			var format = links.map(({text, url}) => { return `[api](${url})`; }).join(', ');
			return [cleanText(title), primary.url, cleanText(description), cleanText(format)];
		});

	return entries;
}
