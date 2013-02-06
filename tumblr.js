var fs = require('fs');

function Tumblr(credentials) {
  this.credentials = credentials;
}

var request;

module.exports = {
  Tumblr: Tumblr,
  request: function(r) {
    request = r;
  }
};

// Blogs

Tumblr.prototype.blogInfo = function (blogName, callback) {
  this._get(blogURLPath(blogName, '/info'), {api_key: this.credentials.consumer_key}, callback);
};

Tumblr.prototype.avatar = function (blogName, size, callback) {
  if (isFunction(size)) { callback = size; size = null; }

  this._get(blogURLPath(blogName, '/avatar/' + (size || 64)), {api_key: this.credentials.consumer_key}, callback);
};

Tumblr.prototype.blogLikes = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  options = options || {};
  options.api_key = this.credentials.consumer_key;

  this._get(blogURLPath(blogName, '/likes'), options, callback);
};

Tumblr.prototype.followers = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  options = options || {};
  options.api_key = this.credentials.consumer_key;

  this._get(blogURLPath(blogName, '/followers'), options, callback);
};

Tumblr.prototype.tagged = function (tag, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  options = options || {};
  options.api_key = this.credentials.consumer_key;

  this._get('/tagged', options, callback);
};

Tumblr.prototype.posts = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  options = options || {};
  options.api_key = this.credentials.consumer_key;

  var path = '/posts';
  if (options.type) {
    path += '/' + options.type;
  }

  this._get(blogURLPath(blogName, path), options, callback);
};

Tumblr.prototype.queue = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {} }

  this._get(blogURLPath(blogName, '/posts/queue'), options, callback);
};

Tumblr.prototype.drafts = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  this._get(blogURLPath(blogName, '/posts/draft'), options, callback);
};

Tumblr.prototype.submissions = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  this._get(blogURLPath(blogName, '/posts/submission'), options, callback);
};

// Posts

Tumblr.prototype.edit = function (blogName, options, callback) {
  this._post(blogURLPath(blogName, '/post/edit'), options, callback);
};

Tumblr.prototype.reblog = function (blogName, options, callback) {
  this._post(blogURLPath(blogName, '/post/reblog'), options, callback);
};

Tumblr.prototype.delete = function (blogName, id, callback) {
  this._post(blogURLPath(blogName, '/post/delete'), {id: id}, callback);
};

Tumblr.prototype.photo = function (blogName, options, callback) {
  if (options.data && options.source)
    return callback(new Error('Can\'t pass both "data" and "source" fields'));

  var that = this;

  if (options.data) {
    // TODO: Add support for multiple photos
    fs.readFile(options.data, 'base64', function (err, data) {
      if (err) throw err;

      options.data = data;
      that._createPost(blogName, 'photo', options, callback);
    });
  }
};

Tumblr.prototype.quote = function (blogName, options, callback) {
  if (!options.quote)
    return callback(new Error('Missing required field: "quote"'));

  this._createPost(blogName, 'quote', options, callback)
};

Tumblr.prototype.text = function (blogName, options, callback) {
  if (!options.body)
    return callback(new Error('Missing required field: "body"'));

  this._createPost(blogName, 'text', options, callback);
};

Tumblr.prototype.link = function (blogName, options, callback) {
  if (!options.url)
    return callback(new Error('Missing required field: "url"'));

  this._createPost(blogName, 'link', options, callback);

};

Tumblr.prototype.chat = function (blogName, options, callback) {
  if (!options.conversation)
    return callback(new Error('Missing required field: "conversation"'));

  this._createPost(blogName, 'chat', options, callback);
};

Tumblr.prototype.audio = function (blogName, options, callback) {
  if (!options.data && !options.external_url)
    return callback(new Error('Missing required field: "data" or "external_url"'));

  if (options.data && options.external_url)
    return callback(new Error('Can\'t pass both "data" and "external_url" fields'));

  if (options.data) {
    var that = this;

    fs.readFile(options.data, function (err, data) {
      if (err) throw err;

      options.data = data.toString('base64');
      that._createPost(blogName, 'audio', options, callback);
    });
  }
};

Tumblr.prototype.video = function (blogName, options, callback) {
  if (!options.data && !options.external_url)
    return callback(new Error('Missing required field: "data" or "embed"'));

  if (options.data && options.embed)
    return callback(new Error('Can\'t pass both "data" and "embed" fields'));

  if (options.data) {
    var that = this;

    fs.readFile(options.data, function (err, data) {
      if (err) throw err;

      options.data = data.toString('base64');
      that._createPost(blogName, 'video', options, callback);
    });
  }
};

// User

Tumblr.prototype.userInfo = function (callback) {
  this._get('/user/info', {}, callback);
};

Tumblr.prototype.dashboard = function (options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  this._get('/user/dashboard', options, callback);
};

Tumblr.prototype.likes = function (offset, limit, callback) {
  if (isFunction(offset)) { callback = offset, offset = null; limit = null; }
  if (isFunction(limit)) { callback = limit; limit = null; }

  this._get('/user/likes', {offset: offset || 0, limit: limit || 20}, callback);
};

Tumblr.prototype.following = function (offset, limit, callback) {
  if (isFunction(offset)) { callback = offset; offset = null; limit = null; }
  if (isFunction(limit)) { callback = limit; limit = null; }

  this._get('/user/following', {offset: offset || 0, limit: limit || 20}, callback);
};

Tumblr.prototype.follow = function (blogName, callback) {
  this._post('/user/follow', {url: blogURL(blogName)}, callback);
};

Tumblr.prototype.unfollow = function (blogName, callback) {
  this._post('/user/unfollow', {url: blogURL(blogName)}, callback);
};

Tumblr.prototype.like = function (id, reblogKey, callback) {
  this._post('/user/like', {id: id, reblog_key: reblogKey}, callback);
};

Tumblr.prototype.unlike = function (id, reblogKey, callback) {
  this._post('/user/unlike', {id: id, reblog_key: reblogKey}, callback);
};

// Helpers

var baseURL = 'http://api.tumblr.com/v2';

Tumblr.prototype._createPost = function (blogName, type, options, callback) {
  options = options || {};
  options.type = type;

  this._post(blogURLPath(blogName, '/post'), options, callback);
};

Tumblr.prototype.get = function (path, params, callback) {
  request.get({url: baseURL + path, qs: params, oauth: this.credentials, followRedirect: false}, requestCallback(callback));
};

Tumblr.prototype.post = function (path, params, callback) {
  request.post({url: baseURL + path, form: params, oauth: this.credentials, followRedirect: false}, requestCallback(callback));
};

function blogURL(blogName) {
  return blogName + '.tumblr.com';
}

function blogURLPath(blogName, path) {
  return '/blog/' + blogURL(blogName) + path;
}

function requestCallback(callback) {
  if (!callback) return function () {};

  return function (err, response, body) {
    if (err) return callback(err);

    var responseBody = JSON.parse(body)
      , statusCode = responseBody.meta.status
      , message = responseBody.meta.msg;

    if (Math.floor(statusCode / 100) !== 2 && statusCode != 301) // Avatar requests will return 301 responses
      return callback(new Error('API error: ' + statusCode + ' ' + message));

    return callback(null, responseBody.response);
  };
}

function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}

function isArray(value) {
  return Object.prototype.toString.call(value) == '[object Array]';
}
