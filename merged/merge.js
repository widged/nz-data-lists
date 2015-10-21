#!/usr/bin/env babel-node

/* jshint esnext: true */


var fs            = require('fs');
var vinyl         = require('vinyl-fs');
var through       = require('through');
var eventStream   = require('event-stream');


let mergeStream = through();


let inStream = vinyl.src('../listings/*/links.tsv', { buffer: false })
							.pipe((function() {
								let pending = 0;
								return through(
									function(file, cb) {
										let headers, source = file.path.split('/').splice(-2, 1).join('/');
										pending++;
										file.contents
											.pipe(eventStream.split())
											.pipe(through(
												function(line) {
													let strm = this;
													let cols = line.split('\t');
													if(headers === undefined) {
														headers = cols;
													} else {
														var obj = cols.reduce((acc, d, i) => {
															if(d && d.length) {
																acc[headers[i]] = d;
															}
															return acc;
														}, {});
														obj.source = source;
														mergeStream.queue(obj);
													}
												},
												function() {
													pending--
													if(pending === 0) {
														mergeStream.queue(null);
													}
												}
											));
										},
										function() { }
							)

							}()))


var dict = [];
var list = [];
mergeStream.pipe(through(
	function(d) {
		let {url} = d;
		let idx = dict.indexOf(d.url);
		if(idx === -1) {
			idx = dict.length; dict.push(url);
			list[idx] = {url: url, listed: []}
		}
		delete d["url"];
		if(d.description) {
				d.description = d.description.replace(/\"/g, "''");
		}
		list[idx].listed.push(d);
		this.queue(d);
	},
	function() {


		var sha1 = require('sha1');

		const filename = __dirname + '/merged-default/merged.nedb.json';
		if (fs.existsSync(filename)) { fs.unlinkSync(filename); }
		const filename_geo = __dirname + '/merged-geo/merged.nedb.json';
		if (fs.existsSync(filename_geo)) { fs.unlinkSync(filename_geo); }

		var Datastore = require('nedb'),
		    db_default  = new Datastore({ filename: filename, autoload: true }),
				db_geo      = new Datastore({ filename: filename_geo, autoload: true });;

		list.sort((a,b) => {
			let urla = (a.url || '').replace(/https?:\/\//, '');
			let urlb = (b.url || '').replace(/https?:\/\//, '');
			return urla < urlb ? -1 : urla > urlb ? 1 : 0
		});
		list.forEach((d, i) => {
			let sha = sha1(d.url || '');
			let db = (fs.existsSync(__dirname + '/merged-geo/snapshots/raw_' + sha + '.png')) ? db_geo : db_default;
			d.sha1 = sha;
			db.insert(d);
		});
		this.queue(null);
		console.log(`[saved] ${filename}`)
		console.log(`[saved] ${filename_geo}`)
	}
))
