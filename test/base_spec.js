var request = require('request');
var helper = require('./helper');
var client = helper.client;

client.credentials.consumer_key = 'consumer_key';

describe('_get', function () {

  describe('no api key', function () {

    before(function () {
      request.get = function (options, callback) {
        this.call = options;
        this.receivedCallback = callback;
      }.bind(this);
      // make a call
      this.path = '/the/path';
      this.options = { my: 'options' };
      this.callback = function () { };
      client._get(this.path, this.options, this.callback);
    });

    it('should call with the proper url', function () {
      this.call.url.should.equal('https://api.tumblr.com/v2' + this.path + '?my=options');
    });

    it('should want json back', function () {
      this.call.json.should.equal(true);
    });

    it('should pass the credentials for oauth', function () {
      this.call.oauth.should.eql(client.credentials);
    });

    it('should avoid redirect', function () {
      this.call.followRedirect.should.equal(false);
    });

    it('should get a function callback', function () {
      (typeof this.receivedCallback).should.equal('function');
    });

  });

  describe('api key', function () {

    before(function () {
      request.get = function (options, callback) {
        this.call = options;
        this.receivedCallback = callback;
      }.bind(this);
      // make a call
      this.path = '/the/path';
      this.options = { my: 'options' };
      this.callback = function () { };
      client._get(this.path, this.options, this.callback, true);
    });

    it('should add the api key as an option', function () {
      var proper = { my: 'options', api_key: 'consumer_key' };
      this.call.url.should.equal('https://api.tumblr.com/v2/the/path?my=options&api_key=consumer_key');
    });

  });

});
