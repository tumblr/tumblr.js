var assert = require('assert');
var helper = require('./helper');
var client = helper.client;

describe('post', function () {

  before(function () {
    helper.stubGet(client);
    helper.stubPost(client);
  });

  ['like', 'unlike'].forEach(function (call) {

    describe(call, function () {

      before(function (done) {
        this.callback = function () { done(); };
        this.id = 42;
        this.reblog_key = 'coolstorybro';
        client[call](this.id, this.reblog_key, this.callback);
      });

      it('should be a post', function () {
        client.lastCall.method.should.equal('post');
      });

      it('should use the proper path', function () {
        client.lastCall.path.should.equal('/user/' + call);
      });

      it('should use the right options', function () {
        client.lastCall.options.should.eql({
          id: this.id,
          reblog_key: this.reblog_key
        });
      });

      it('should use the callback', function () {
        this.callback.should.equal(client.lastCall.callback);
      });

    });

  });

  ['follow', 'unfollow'].forEach(function (call) {

    describe(call, function () {

      before(function (done) {
        this.callback = function () { done(); };
        this.blogName = 'blog';
        client[call](this.blogName, this.callback);
      });

      it('should use the proper path', function () {
        client.lastCall.path.should.equal('/user/' + call);
      });

      it('should be a post', function () {
        client.lastCall.method.should.equal('post');
      });

      it('should include the url properly', function () {
        client.lastCall.options.should.eql({
          url: this.blogName + '.tumblr.com'
        });
      });

      it('should use the proper callback', function () {
        client.lastCall.callback.should.equal(this.callback);
      });

    });

  });

  describe('info', function () {

    before(function (done) {
      this.callback = function () { done(); };
      client.userInfo(this.callback);
    });

    it('should be a get', function () {
      client.lastCall.method.should.equal('get');
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

      it('should be a get', function () {
        client.lastCall.method.should.equal('get');
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
