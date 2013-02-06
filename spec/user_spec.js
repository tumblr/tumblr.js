var assert = require('assert');
var helper = require('./helper');
var client = helper.client;

describe('post', function () {

  before(function () {
    helper.stubGet(client);
  });

  describe('info', function () {

    before(function (done) {
      this.callback = function () { done(); };
      client.userInfo(this.callback);
    });

    it('should use the proper path', function () {
      client.lastCall.path.should.equal('/user/info');
    });

    it('should send with no options', function () {
      client.lastCall.options.should.eql({});
    });

    it('should get the callback correctly', function () {
      client.lastCall.callback.should.equal(this.callback);
    });

  });

  ['likes', 'following'].forEach(function (call) {

    describe(call, function () {

      var fname = call;

      before(function (done) {
        this.callback = function () { done(); }
        this.limit = 10;
        this.offset = 7;
        client[fname](this.offset, this.limit, this.callback);
      });

      it('should use the proper path', function () {
        client.lastCall.path.should.equal('/user/' + call);
      });

      it('should send with proper options', function () {
        client.lastCall.options.should.eql({ limit: this.limit, offset: this.offset });
      });

      it('should send with proper callback', function () {
        this.callback.should.eql(client.lastCall.callback);
      });

      it('should work the same when passed callback earlier', function () {
        var callback = function () { };
        client[fname](callback); var callOne = client.lastCall;
        client[fname](undefined, callback); var callTwo = client.lastCall;
        assert.sameRequest(callOne, callTwo);
      });

    });

  });

});
