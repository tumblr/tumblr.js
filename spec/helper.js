var t = require('../tumblr');
var assert = require('assert');

assert.sameRequest = function (original, other) {
  ['callback', 'options', 'path'].forEach(function (thing) {
    this.deepEqual(original[thing], other[thing]);
  }.bind(this));
};

t.request(require('request'));

module.exports = {

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
