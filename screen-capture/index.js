var ElectronApp = require('../lib/electron/electron_boilerplate/electron_app');

ElectronApp.load(
  'file://' + __dirname + '/index.html',
  '../lib/electron/react-devtools'
);
