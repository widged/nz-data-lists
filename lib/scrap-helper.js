import jsdom from 'jsdom';

function cleanText(text) {
	return text.replace(/[\n\r\t]/g, '').trim();
}

export {cleanText};
