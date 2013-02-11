var assert = require('assert');
var helper = require('./helper');
var client = helper.client;

describe('tagged', function () {

  before(function () {
    client.credentials = { consumer_key: 'consumer_key' };
    helper.stubGet(client);
  });

  describe('tagged', function () {

    before(function (done) {
      this.options = { hello: 'world' };
      this.callback = function () { done(); };
      this.tag = 'lol';
      client.tagged(this.tag, this.options, this.callback);
    });

    helper.properCall.bind(this)(client, function () {
      var properOptions = { tag: this.tag };
      for (var key in this.options) {
        properOptions[key] = this.options[key];
      }

      return {
        method: 'get',
        path: '/tagged',
        options: properOptions,
        callback: this.callback,
        apiKey: true
      };
    });

    it('should work the same when passed the callback earlier', function () {
      var callback = function () { };
      client.tagged(this.tag, callback); var callOne = client.lastCall;
      client.tagged(this.tag, undefined, callback); var callTwo = client.lastCall;
      assert.sameRequest(callOne, callTwo);
    });

  });

});
