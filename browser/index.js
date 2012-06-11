var tumblr = require('../tumblr');
tumblr.request(require('browser-request'));

module.exports = tumblr.Tumblr;