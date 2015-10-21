/* jshint esnext: true */

var sha1 = require('sha1');

var Datastore = require('nedb'),
		db_default  = new Datastore({ filename: __dirname + '/../data/merged-default/merged.nedb.json', autoload: true });


capture([
	{ "url": "http://www.emi.ea.govt.nz" },
  { "url": "http://www.emi.ea.govt.nz" },
  { "url": "http://www.emi.ea.govt.nz/Datasets\\Ancillary_services\\Frequency_keeping" },
  { "url": "http://www.stats.govt.nz/about_us/our-publications/annual-reports.aspx" },
  { "url": "http://www.teara.govt.nz" },
  { "url": "http://www.tetaurawhiri.govt.nz/english/pub_e/annualrpt/2000.shtml" }
])

/*
{ "url": "http://archive.votemenot.co.nz/thread/25651432/trademe-api/" },
{ "url": "http://archive.votemenot.co.nz/thread/25651432/trademe-api/" },
{ "url": "http://nabis2/map.aspx?topic=CustomaryAreas" },
{ "url": "http://nabis2/map.aspx?topic=FisheriesAdminAreas" },
{ "url": "https://network.xero.com/Login.xro/Login" },
{ "url": "https://secure.niwa.co.nz/fbis/index.do" },
{ "url": "https://wiki.open.org.nz/wiki/display/main/New+Zealand+APIs" },

*/
const SNAP_DELAY = 5000;

/*
db_default.find({}, function(err, list) {
	capture(list);
});
*/

function capture(list) {
	var remote = require('' + 'remote');
	var BrowserWindow = remote.require('browser-window');
	var win = new BrowserWindow({ width: 1024, height: 768, show: false });
	win.on('closed', function() {
	  win = null;
	});
	win.show();

	var previews = list.filter((d, i) => { return i >= 0 && i <= 100 ; } )
	var count = 0;
	previewUrl(previews.shift());
	function previewUrl({url}) {
		count++;
		if(count % 30 === 0) { console.log(count); }
		win.loadUrl(url);
		screenshot({delay: SNAP_DELAY}, function(png) {
			var filename = sha1(url);
			remote.require('fs').writeFile(`snapshots/raw_${filename}.png`, png, function() {
				if(previews.length) {
					previewUrl(previews.shift());
				} else {
					console.log('[DONE]')
				}
			})
		})
	}

	function screenshot(opt, cb) {
	  cb = cb || function() {}
	  var remote = require('' + 'remote') // prevent static analysis like browserify
	  setTimeout(function() {
	    win.capturePage(function handleCapture(img) {
				cb(img.toPng())
	    });
	  }, opt.delay)
	}
}
