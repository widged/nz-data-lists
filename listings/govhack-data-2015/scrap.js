#!/usr/bin/env babel-node

/* jshint esnext: true */

import {loadHtml} from '../../lib/jsdom-helper.js';
import {cleanText} from '../../lib/scrap-helper.js';

var fs = require("fs");

let lines = scrap(fs.readFileSync('govhack-data-2015.html', 'utf8'));
let piped = ['title,url,description,category'.split(',')].concat(lines);
let body = piped.map((d) => d.join('\t')).join('\n');
fs.writeFileSync('links.tsv', body, 'utf8');
console.log('`links.tsv` updated.');


function scrap(html) {
	let lines = [];
	let document = loadHtml(html);
	var content = document.querySelector('.entry-content');
	content.innerHTML.split(/<h3.*?>/).map((d) => {
		let [category, section] = d.split('</h3>');
		let entries = (section || '').split('<br>')
		entries.forEach((e) => {
			let node = document.createElement('div');
			node.innerHTML = e;
			let links = Array.from(node.querySelectorAll('a')).map((a) => {
				let obj = {text: a.textContent, url: a.getAttribute('href')}
				a.parentNode.removeChild(a);
				return obj;
			});
			let primaryLink = links.shift();
			if(primaryLink) {
				let categoryNode = document.createElement('div');
				categoryNode.innerHTML = category;

				let formats = links.map(({text,url}) => { return `[${text}](${text})`}).join(',');
				lines.push([
					cleanText(primaryLink.text), // title
					primaryLink.url,             // url
					cleanText(node.textContent).replace(/^[^a-z]+/i, ''), // description
					cleanText(categoryNode.textContent),                    // category
					// formats                      // alternative formats
				])
			}
		})
	})


// 	var sections = content.innerHTML



	return lines;

}
