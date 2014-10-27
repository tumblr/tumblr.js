var TumblrClient = require('./client');

module.exports = {

  Client: TumblrClient,

  createClient: function (credentials) {
    return new TumblrClient(credentials);
  },

  request: function(r) {
    TumblrClient.prototype.request = r;
  }

};