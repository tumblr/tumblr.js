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

  properCall: function (client, dcb) {
    before(function () {
      this.proper = dcb.bind(this)();
    });
    it('should use the proper request method', function () {
      client.lastCall.method.should.equal(this.proper.method);
    });
    it('should use the proper path', function () {
      client.lastCall.path.should.equal(this.proper.path);
    });
    it('should use the proper options', function () {
      client.lastCall.options.should.eql(this.proper.options);
    });
    it('should use the proper callback', function () {
      client.lastCall.callback.should.equal(this.proper.callback);
    });
    it('should use api key properly', function () {
      if (this.proper.apiKey !== undefined) {
        assert.equal(client.lastCall.apiKey, this.proper.apiKey);
      }
    });
  },

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
    client._get = function (path, options, callback, apiKey) {
      client.lastCall = {
        method: 'get',
        path: path,
        options: options,
        callback: callback,
        apiKey: !!apiKey
      };
      callback(err, data);
    };
  },

  client: new t.createClient()

};
