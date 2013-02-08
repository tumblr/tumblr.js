var libpath = process.env['TUMBLR_COV'] ? '../lib-cov/' : '../lib/';
var t = require(libpath + 'tumblr');
var assert = require('assert');

assert.sameRequest = function (original, other) {
  ['callback', 'options', 'path', 'method'].forEach(function (thing) {
    this.deepEqual(original[thing], other[thing]);
  }.bind(this));
};

t.request(require('request'));

module.exports = {

  stubPost: function (client) {
    client._post = function (path, options, callback) {
      client.lastCall = {
        method: 'post',
        path: path,
        options: options,
        callback: callback
      };
      callback();
    };
  },

  stubGet: function (client, err, data) {
    client._get = function (path, options, callback) {
      client.lastCall = {
        method: 'get',
        path: path,
        options: options,
        callback: callback
      };
      callback(err, data);
    };
  },

  client: new t.Tumblr()

};
