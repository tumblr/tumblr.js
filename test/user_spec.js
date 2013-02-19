var assert = require('assert');
var helper = require('./helper');
var client = helper.client;

describe('post', function () {

  before(function () {
    helper.stubGet(client);
    helper.stubPost(client);
  });

  describe('deletePost', function () {

    before(function (done) {
      this.callback = function () { done(); };
      this.blogName = 'heyo';
      this.id = 42;
      client.deletePost(this.blogName, 42, this.callback);
    });

    helper.properCall.bind(this)(client, function () {
      return {
        method: 'post',
        path: '/blog/' + this.blogName + '.tumblr.com/post/delete',
        options: { id: this.id },
        callback: this.callback
      };
    });

  });

  ['edit', 'reblog'].forEach(function (call) {

    describe(call, function () {

      before(function (done) {
        this.callback = function () { done(); };
        this.blogName = 'heyo';
        this.options = { coolstory: 'bro' };
        client[call](this.blogName, this.options, this.callback);
      });

      helper.properCall.bind(this)(client, function () {
        return {
          method: 'post',
          path: '/blog/' + this.blogName + '.tumblr.com/post/' + call,
          options: this.options,
          callback: this.callback
        };
      });

    });

  });

  ['like', 'unlike'].forEach(function (call) {

    describe(call, function () {

      before(function (done) {
        this.callback = function () { done(); };
        this.id = 42;
        this.reblog_key = 'coolstorybro';
        client[call](this.id, this.reblog_key, this.callback);
      });

      helper.properCall.bind(this)(client, function () {
        return {
          method: 'post',
          path: '/user/' + call,
          options: { id: this.id, reblog_key: this.reblog_key },
          callback: this.callback
        };
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

      helper.properCall.bind(this)(client, function () {
        return {
          method: 'post',
          path: '/user/' + call,
          options: { url: this.blogName },
          callback: this.callback
        };
      });

    });

  });

  describe('info', function () {

    before(function (done) {
      this.callback = function () { done(); };
      client.userInfo(this.callback);
    });

    helper.properCall.bind(this)(client, function () {
      return {
        method: 'get',
        path: '/user/info',
        options: {},
        callback: this.callback
      };
    });

  });

  ['dashboard', 'likes', 'following'].forEach(function (call) {

    describe(call, function () {

      var fname = call;

      before(function (done) {
        this.options = { limit: 7, offset: 21 };
        this.callback = function () { done(); };
        client[fname](this.options, this.callback);
      });

      helper.properCall.bind(this)(client, function () {
        return {
          method: 'get',
          path: '/user/' + call,
          options: this.options,
          callback: this.callback
        };
      });

      it('should work the same when passed callback earlier', function () {
        var callback = function () { };
        client[fname](callback); var callOne = client.lastCall;
        client[fname]({}, callback); var callTwo = client.lastCall;
        assert.sameRequest(callOne, callTwo);
      });

    });

  });

});
