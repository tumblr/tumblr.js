
var TumblrClient = require('./client');
var request = require('browser-request');

module.exports = {
  Client: TumblrClient,
  createClient: function (credentials) {
    return new TumblrClient(credentials, request);
  }
};
