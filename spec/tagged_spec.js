var assert = require('assert');
var helper = require('./helper');
var client = helper.client;

/* NOT IMPLEMENTED
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

    it('should use the proper path', function () {
      client.lastCall.path.should.equal('tagged');
    });

    it('should use the proper callback', function () {
      client.lastCall.callback.should.equal(this.callback);
    });

    it('should use the proper options', function () {
      for (var key in this.options) {
        client.lastCall.options[key].should.equal(this.options[key]);
      }
    });

    it('should include the api_key', function () {
      client.lastCall.options.api_key.should.equal('consumer_key');
    });

    it('should work the same when passed the callback earlier', function () {
      var callback = function () { };
      client.tagged(this.tag, callback); var callOne = client.lastCall;
      client.tagged(this.tag, undefined, callback); var callTwo = client.lastCall;
      assert.sameRequest(callOne, callTwo);
    });

    describe('when oauth_token is set', function () {

      before(function () {
        this.options = { hello: 'world' };
        client.credentials.token = 'abc';
        client.tagged(this.tag, this.options, function () { });
      });

      after(function () { client.credentials.token = undefined; });

      it('should not include api_key', function () {
        assert.equal(undefined, client.lastCall.options.api_key);
      });

    });

  });

});
*/
