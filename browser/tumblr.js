var TumblrClient = require('./client');

var request;

module.exports = {

  Client: TumblrClient,

  createClient: function (credentials) {
    return new TumblrClient(credentials, request);
  },

  request: function(r) {
    request = r;
  }
};
