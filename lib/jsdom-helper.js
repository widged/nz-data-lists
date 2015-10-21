import jsdom from 'jsdom';

function loadHtml(html) {
  if(html === undefined) { html = '<!doctype html><html><body></body></html>'; }
  const doc = jsdom.jsdom(html);
  const win = doc.defaultView;

  global.document = doc;
  global.window = win;

  Object.keys(window).forEach((key) => {
    if (!(key in global)) {
      global[key] = window[key];
    }
  });

  return doc;
}

export {loadHtml};
