var assert = require('assert');
var helper = require('./helper');
var client = helper.client;

describe('blog', function () {

  before(function () {
    helper.stubGet(client);
    client.credentials = { consumer_key: 'consumer_key' };
  });

  describe('posts', function () {

    describe('with no type specified', function () {

      before(function (done) {
        this.blogName = 'blog';
        this.options = { hello: 'world' };
        this.callback = function () { done(); };
        client.posts(this.blogName, this.options, this.callback);
      });

      helper.properCall.bind(this)(client, function () {
        var properOptions = { api_key: 'consumer_key' };
        for (var key in this.options) {
          properOptions[key] = this.options[key];
        }

        return {
          method: 'get',
          path: '/blog/' + this.blogName + '.tumblr.com/posts',
          options: properOptions,
          callback: this.callback
        };
      });

      it('should allow options to be skipped', function () {
        var callback = function () { };
        client.posts(this.blogName, undefined, callback); var callOne = client.lastCall;
        client.posts(this.blogName, callback); var callTwo = client.lastCall;
        assert.sameRequest(callOne, callTwo);
      });

    });

    describe ('with type specified', function () {

      before(function (done) {
        this.blogName = 'blog';
        this.options = { hello: 'world', type: 'text' };
        this.callback = function () { done(); };
        client.posts(this.blogName, this.options, this.callback);
      });

      helper.properCall.bind(this)(client, function () {
        var properOptions = { api_key: 'consumer_key' };
        for (var key in this.options) {
          properOptions[key] = this.options[key];
        }

        return {
          method: 'get',
          path: '/blog/' + this.blogName + '.tumblr.com/posts/text',
          options: properOptions,
          callback: this.callback
        };
      });

    });

  });

  describe('avatar', function () {

    describe('no size specified', function () {

      before(function (done) {
        helper.stubGet(client, undefined, { avatar_url: 'the_ns_url' });
        this.blogName = 'blog';
        this.callback = function (err, data) {
          this.received = { err: err, data: data };
          done();
        }.bind(this);
        client.avatar(this.blogName, undefined, this.callback);
      });

      it('should be a get', function () {
        client.lastCall.method.should.equal('get');
      });

      it('should use the proper path', function () {
        client.lastCall.path.should.equal('/blog/' + this.blogName + '.tumblr.com/avatar/64');
      });

      it('should use the proxy callback', function () {
        assert.equal(this.received.err, undefined);
        this.received.data.should.eql({ avatar_url: 'the_ns_url' });
      });

      it('should allow the callback to be passed second', function (done) {
        var callback = function () { done(); };
        client.avatar(this.blogName, callback);
      });

    });

    describe('size specified', function () {

      before(function (done) {
        helper.stubGet(client, undefined, { avatar_url: 'the_url' });
        this.blogName = 'blog';
        this.callback = function (err, data) {
          this.received = { err: err, data: data };
          done();
        }.bind(this);
        client.avatar(this.blogName, 128, this.callback);
      });

      it('should use the proper path', function () {
        client.lastCall.path.should.equal('/blog/' + this.blogName + '.tumblr.com/avatar/128');
      });

      it('should use the proxy callback', function () {
        assert.equal(this.received.err, undefined);
        this.received.data.should.eql({ avatar_url: 'the_url' });
      });

    });

    describe('response is error', function () {

      before(function (done) {
        helper.stubGet(client, 'err', undefined);
        this.blogName = 'blog';
        this.callback = function (err, data) {
          this.received = { err: err, data: data };
          done();
        }.bind(this);
        client.avatar(this.blogName, 128, this.callback);
      });

      it('should use the proxy callback and get back an error', function () {
        assert.equal(this.received.data, undefined);
        this.received.err.should.equal('err');
      });

    });

  });

  describe('info', function () {

    before(function (done) {
      this.blogName = 'blog';
      this.callback = function () { done(); };
      client.blogInfo(this.blogName, this.callback);
    });

    it('should be a get', function () {
      client.lastCall.method.should.equal('get');
    });

    it('should use the proper path', function () {
      client.lastCall.path.should.equal('/blog/' + this.blogName + '.tumblr.com/info');
    });

    it('should send with the proper callback', function () {
      client.lastCall.callback.should.equal(this.callback);
    });

    it('should include the api key', function () {
      client.lastCall.options.should.eql({ api_key: 'consumer_key' });
    });

  });

  ['likes', 'followers', 'queue', 'draft', 'submission'].forEach(function (call) {

    describe(call, function () {

      var fname = call === 'likes' ? 'blogLikes' : call;
      if (fname === 'draft') fname = 'drafts';
      if (fname === 'submission') fname = 'submissions';

      before(function (done) {
        this.blogName = 'blog';
        this.callback = function () { done(); };
        this.options = { hello: 'world' };
        client[fname](this.blogName, this.options, this.callback);
      });

      it('should be a get', function () {
        client.lastCall.method.should.equal('get');
      });

      it('should use the proper path', function () {
        if (['queue', 'draft', 'submission'].indexOf(call) !== -1) {
          client.lastCall.path.should.equal('/blog/' + this.blogName + '.tumblr.com/posts/' + call);
        } else {
          client.lastCall.path.should.equal('/blog/' + this.blogName + '.tumblr.com/' + call);
        }
      });

      it('should send with the proper options', function () {
        client.lastCall.options.should.equal(this.options);
      });

      it('should send with proper callback', function () {
        client.lastCall.callback.should.equal(this.callback);
      });

      it('should work the same when passing callback earlier', function () {
        var callback = function () { };
        client[fname](this.blogName, callback); var callOne = client.lastCall;
        client[fname](this.blogName, {}, callback); var callTwo = client.lastCall;
        assert.sameRequest(callOne, callTwo);
      });

      if (call === 'likes') {

        it('should include the api key', function () {
          client.lastCall.options.api_key.should.equal('consumer_key');
        });

      }

    });

  });

});
