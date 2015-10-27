#!/usr/bin/env babel-node

/* jshint esnext: true */

var fs            = require('fs');
var vinyl         = require('vinyl-fs');
var through       = require('through');
var eventStream   = require('event-stream');
var sha1          = require('sha1');
var chalk         = require('chalk');

var warn = chalk.white.bgRed.bold;
var info = chalk.blue;

class LineToObjectConverter {
	constructor() {
		this.state = { headers: [], separator: '\t' };
	}
	separator(_) {
		if(!arguments.length) { return this.state.separator; }
		this.state.separator = _;
		return this;
	}
	headerLine(line) {
		let {separator} = this.state;
		if(!arguments.length) { return this.state.headers; }
		this.state.headers = line.split(separator);
		return this;
	}
	asObject(line) {
		let {separator, headers} = this.state;
		let cols = line.split(separator);
		var obj = cols.reduce((acc, d, i) => {
			if(d && d.length) { acc[headers[i]] = d; }
			return acc;
		}, {});
		return obj;
	}
}

function overwriteFile(filename) {
	if (fs.existsSync(filename)) { fs.unlinkSync(filename); }
	return filename;
}


function turnFileLinesIntoObjectStream() {
	var count = 0;
	return through(
		function(file, cb) {
			let list = through();
			let converter;
			this.queue({path: file.path, list});
			file.contents
				.pipe(eventStream.split())
				.pipe(through(
					function(line) {
						if(converter === undefined) {
							// first line has headers
							converter = new LineToObjectConverter()
										.separator('\t')
										.headerLine(line);
						} else {
							// data lines
							var obj = converter.asObject(line);
							if(obj) {
								list.queue(obj);
							} else {
								console.log(warn('[WARN] dropped', obj));
							}
						}
					},
					function() {
						list.queue(null);
						this.queue(null);
					}
				));
		}, function() {
			this.queue(null);
		}
	)
}


function addSourceToEachObjectInStream(getSourceFromPath) {
	return through(
		function({path, list}) {
				let source = getSourceFromPath(path);
				let newList = list.pipe(eventStream.map(function(obj, cb) {
					obj.source = source;
					cb(null, obj);
				}));
				this.queue(newList);
		},
		function() {
			this.queue(null);
		}
	)
}

function mergeObjectStreams() {
	let pending = 0;
	let mergeStream;
	return through(
		function(strm) {
			if(mergeStream === undefined) { mergeStream = this; }
			pending++;
			strm.pipe(through(
				function whenData(d) { mergeStream.queue(d); },
				function whenEnd() {
					pending--;
					if(pending === 0) { mergeStream.queue(null); }
					this.queue(null);
				}
			));
		},
		function() { /* do nothing */ },
		{end: false}
	);
};


class UrlGrouper {
	constructor() {
		this.state = {dict: [], list: []};
	}

	static getSourceIndex(sources, source) {
		let srcIdx = sources.indexOf(source);
		if(srcIdx === -1) { srcIdx = sources.length; sources.push(source); }
		return srcIdx;
	}

	static getUrlProtocol(url) {
		let protocol = url.match(/^(?:(ht|f)tp(s?)\:\/\/)?/);
		if(protocol) {
			protocol = protocol[0];
			url = url.replace(protocol, '');
		} else {
			protocol = 'http://';
		}
		return {url, protocol};
	}

	getUrlEntry(item) {
		let {url} = item;
		if(!url) {
			console.log(warn(`[WARN] Item has no url ${JSON.stringify(item)}`));
			return;
		}
		let urlAndProtocol = UrlGrouper.getUrlProtocol(url);
		url = urlAndProtocol.url;
		let {dict, list} = this.state;
		let idx = dict.indexOf(url);
		if(idx === -1) {
			idx = dict.length; dict.push(url);
			list[idx] = {url: url, protocol: urlAndProtocol.protocol, sources: []};
		}
		return list[idx];
	}

	queue(item) {
		let entry  = this.getUrlEntry(item);
		if(!entry) { return; }
		let props = {};
		let srcIdx = UrlGrouper.getSourceIndex(entry.sources, item.source);
		Object.keys(item).forEach((key) => {
			if('url,source'.split(',').indexOf(key) !== -1) { return; }
			let raw = (item[key] || '').replace(/\"/g, "''");
			if(!props.hasOwnProperty(key)) { props[key] = []; };
			props[key][srcIdx] = raw;
		});
		entry.props = props;
	}

	listUrls()    { return this.state.list; }
}


function exportItems() {
	let grouped = new UrlGrouper();
	var geoUrls = require('./geo-urls.js');
	var count = 0;

	return through(
		function(item) { grouped.queue(item); },
		function() {
			var Datastore = require('nedb'),
				db_default  = new Datastore({ filename: overwriteFile(__dirname + '/merged-default/merged.nedb.json'), autoload: true }),
				db_geo      = new Datastore({ filename: overwriteFile(__dirname + '/merged-geo/merged.nedb.json'), autoload: true });

			let urls    = grouped.listUrls();
			urls.sort((a,b) => { return a.url < b.url ? -1 : a.url > b.url ? 1 : 0 });
			urls.forEach(({url, protocol, sources, props}, i) => {
				let fullUrl = protocol+url;
				let db = (geoUrls.indexOf(fullUrl) !== -1) ? db_geo : db_default;
				db.insert({url: fullUrl, sha1: sha1(fullUrl), sources, props});
			});

			console.log(info(`[INFO] saved '${db_default.filename}'`));
			console.log(info(`[INFO] saved '${db_geo.filename}'`));
		}
	);
}

let inStream = vinyl.src('../listings/*/links.tsv', { buffer: false })
										.pipe(turnFileLinesIntoObjectStream())
										.pipe(addSourceToEachObjectInStream(
											function getSource(path) { return path.split('/').splice(-2, 1).join('/'); })
										)
										.pipe(mergeObjectStreams())
										.pipe(exportItems());
