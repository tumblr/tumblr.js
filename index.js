var tumblr = require('./tumblr');
tumblr.request(require('request'));

module.exports = tumblr.Tumblr;