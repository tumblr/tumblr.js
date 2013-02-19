var assert = require('assert');
var helper = require('./helper');
var client = helper.client;

describe('blog', function () {

  before(function () {
    helper.stubGet(client);
    helper.stubPost(client);
    client.credentials = { consumer_key: 'consumer_key' };
  });

  ['photo', 'audio', 'video'].forEach(function (call) {

    var otherData = { photo: 'source', audio: 'external_url', video: 'embed' };
    var otherField = otherData[call];

    describe(call, function () {

      describe('when passing no options', function () {

        it('should raise an error', function () {
          (function () {
            client[call]('blog', {}, function () { });
          }).should.throw('Missing one of: data,' + otherField);
        });

      });

      describe('when passing both options', function () {

        it('should raise an error', function () {
          (function () {
            var options = { data: 'data' };
            options[otherField] = 'otherField';
            client[call]('blog', options, function () { });
          }).should.throw('Can only use one of: data,' + otherField);
        });

      });

      describe('when passing only other field', function () {

        before(function (done) {
          this.callback = function () { done(); };
          this.options = {}; this.options[otherField] = 'value';
          this.blogName = 'blog';
          client[call](this.blogName, this.options, this.callback);
        });

        helper.properCall.bind(this)(client, function () {
          var proper = { type: call };
          proper[otherField] = this.options[otherField];

          return {
            method: 'post',
            path: '/blog/' + this.blogName + '.tumblr.com/post',
            options: proper,
            callback: this.callback
          };
        });

      });

      describe('when passing data', function () {

        before(function (done) {
          this.callback = function () { done(); };
          this.options = { data: './test/support' };
          this.blogName = 'blog';
          client[call](this.blogName, this.options, this.callback);
        });

        helper.properCall.bind(this)(client, function () {
          var proper = { data: './test/support', type: call };

          return {
            method: 'post',
            path: '/blog/' + this.blogName + '.tumblr.com/post',
            options: proper,
            callback: this.callback
          };
        });

      });

    });

  });

  ['quote', 'text', 'link', 'chat'].forEach(function (call) {

    var simpleTypes = { quote: 'quote', text: 'body', link: 'url', chat: 'conversation' };
    var field = simpleTypes[call];

    describe(call, function () {

      describe('when not passing quote option', function () {

        it('should raise an error', function () {
          (function () {
            client[call]('blog', {}, function () { });
          }).should.throw('Missing required field: "' + field + '"');
        });

      });

      describe('when passing the quote options', function () {

        before(function (done) {
          this.blogName = 'blog';
          this.options = {}; this.options[field] = 'hello world';
          this.callback = function () { done(); };
          client[call](this.blogName, this.options, this.callback);
        });

        helper.properCall.bind(this)(client, function () {
          var proper = { type: call };
          proper[field] = this.options[field];

          return {
            method: 'post',
            path: '/blog/' + this.blogName + '.tumblr.com/post',
            options: proper,
            callback: this.callback,
            apiKey: undefined
          };
        });

      });

    });

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
        return {
          method: 'get',
          path: '/blog/' + this.blogName + '.tumblr.com/posts',
          options: this.options,
          callback: this.callback,
          apiKey: true
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
        return {
          method: 'get',
          path: '/blog/' + this.blogName + '.tumblr.com/posts/text',
          options: this.options,
          callback: this.callback,
          apiKey: true
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
        client.lastCall.path.should.equal('/blog/' + this.blogName + '.tumblr.com/avatar');
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
      this.blogName = 'blog.com';
      this.callback = function () { done(); };
      client.blogInfo(this.blogName, this.callback);
    });

    helper.properCall.bind(this)(client, function () {
      return {
        method: 'get',
        path: '/blog/' + this.blogName + '/info',
        options: { },
        callback: this.callback,
        apiKey: true
      };
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
          client.lastCall.apiKey.should.equal(true);
        });

      }

    });

  });

});
