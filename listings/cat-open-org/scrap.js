#!/usr/bin/env babel-node

/* jshint esnext: true */

import {loadHtml} from '../../lib/jsdom-helper.js';
import {cleanText} from '../../lib/scrap-helper.js';

var fs = require("fs");

let lines1 = scrap(fs.readFileSync('cat-open-org-nz-1.html', 'utf8'));
let lines2 = scrap(fs.readFileSync('cat-open-org-nz-2.html', 'utf8'));

let lines = ['title,url,agency,description,instant_access,license,cost,format'.split(',')].concat(lines1).concat(lines2);
let body = lines.map((d) => d.join('\t')).join('\n');
fs.writeFileSync('links.tsv', body, 'utf8');
console.log('`links.tsv` updated.');

function scrap(html) {

	let document = loadHtml(html);

	let headers = Array.from(document.querySelectorAll('#tblDataset > thead > tr > th'));
	let entries = Array.from(document.querySelectorAll('#tblDataset > tbody > tr'));

	let fields = headers.map((th) => cleanText(th.textContent));
	let formats = "XLS,CSV,KML,Geo,API,Other".toLowerCase().split(',');
	var lines = entries.reduce((acc,  tr) => {
		if(!Array.isArray(acc)) { acc = []; }
		let out = {};
		let tds = Array.from(tr.querySelectorAll('td'));
		tds.forEach((td, i) => {
			let links = Array.from(td.querySelectorAll('a')).map((a) => {
				var o = {url: a.getAttribute('href'), text: a.innerHTML};
				a.parentNode.removeChild(a);
				return o;
			});
			let field = fields[i].toLowerCase().replace(/\s+/g, '_');
			if(i === 0) {
				let datasetNode = td.querySelector('h2');
				let dataset = cleanText(datasetNode.textContent); datasetNode.parentNode.removeChild(datasetNode);
				let agencyNode = td.querySelector('h3');
				if(links.length > 1) { console.log('[PB]'); }
				out.title = links[0].text;
				out.url   = links[0].url;
				out.agency = cleanText(agencyNode.textContent); agencyNode.parentNode.removeChild(agencyNode);
				out.note = dataset+ ' ' + cleanText(td.textContent);
			} else if(formats.indexOf(field) !==-1) {
				if(!out.hasOwnProperty('format')) { out.format = []; }
				if(links.length) {
					out.format.push(links.map(({text, url}) => { return `[${field}](${url})`; }));
				}
			} else {
				out[field] = cleanText(td.textContent);
			}
		});
		let {title, url, agency, description, instant_access, license, price, format} = out;
		acc.push([title, url, agency, description, instant_access, license, price, (format || []).join(',') ]);
		return acc;
	}, null);

	return lines;

}
