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
  get(blogURLPath(blogName, '/info'), {api_key: this.credentials.consumer_key}, callback, this.credentials);
};

Tumblr.prototype.avatar = function (blogName, size, callback) {
  if (isFunction(size)) { callback = size; size = null; }

  get(blogURLPath(blogName, '/avatar/' + (size || 64)), {api_key: this.credentials.consumer_key}, callback, this.credentials);
};

Tumblr.prototype.followers = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  options = options || {};
  options.api_key = this.credentials.consumer_key;

  get(blogURLPath(blogName, '/followers'), options, callback, this.credentials);
};

Tumblr.prototype.posts = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  options = options || {};
  options.api_key = this.credentials.consumer_key;

  get(blogURLPath(blogName, '/posts'), options, callback, this.credentials);
};

Tumblr.prototype.queue = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {} }

  get(blogURLPath(blogName, '/posts/queue'), options, callback, this.credentials);
};

Tumblr.prototype.drafts = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  get(blogURLPath(blogName, '/posts/draft'), options, callback, this.credentials);
};

Tumblr.prototype.submissions = function (blogName, options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  get(blogURLPath(blogName, '/posts/submission'), options, callback, this.credentials);
};

// Posts

Tumblr.prototype.edit = function (blogName, options, callback) {
  post(blogURLPath(blogName, '/post/edit'), options, callback, this.credentials);
};

Tumblr.prototype.reblog = function (blogName, options, callback) {
  post(blogURLPath(blogName, '/post/reblog'), options, callback, this.credentials);
};

Tumblr.prototype.delete = function (blogName, id, callback) {
  post(blogURLPath(blogName, '/post/delete'), {id: id}, callback, this.credentials);
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
      createPost(blogName, 'photo', options, callback, that.credentials);
    });
  }
};

Tumblr.prototype.quote = function (blogName, options, callback) {
  if (!options.quote)
    return callback(new Error('Missing required field: "quote"'));

  createPost(blogName, 'quote', options, callback)
};

Tumblr.prototype.text = function (blogName, options, callback) {
  if (!options.body)
    return callback(new Error('Missing required field: "body"'));

  createPost(blogName, 'text', options, callback, this.credentials);
};

Tumblr.prototype.link = function (blogName, options, callback) {
  if (!options.url)
    return callback(new Error('Missing required field: "url"'));

  createPost(blogName, 'link', options, callback, this.credentials);
};

Tumblr.prototype.chat = function (blogName, options, callback) {
  if (!options.conversation)
    return callback(new Error('Missing required field: "conversation"'));

  createPost(blogName, 'chat', options, callback, this.credentials);
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
      createPost(blogName, 'audio', options, callback, that.credentials);
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
      createPost(blogName, 'video', options, callback, that.credentials);
    });
  }
};

// User

Tumblr.prototype.userInfo = function (callback) {
  get('/user/info', {}, callback, this.credentials);
};

Tumblr.prototype.dashboard = function (options, callback) {
  if (isFunction(options)) { callback = options; options = {}; }

  get('/user/dashboard', options, callback, this.credentials);
};

Tumblr.prototype.likes = function (offset, limit, callback) {
  if (isFunction(offset)) { callback = offset, offset = null; limit = null; }
  if (isFunction(limit)) { callback = limit; limit = null; }

  get('/user/likes', {offset: offset || 0, limit: limit || 20}, callback, this.credentials);
};

Tumblr.prototype.following = function (offset, limit, callback) {
  if (isFunction(offset)) { callback = offset; offset = null; limit = null; }
  if (isFunction(limit)) { callback = limit; limit = null; }

  get('/user/following', {offset: offset || 0, limit: limit || 20}, callback, this.credentials);
};

Tumblr.prototype.follow = function (blogName, callback) {
  post('/user/follow', {url: blogURL(blogName)}, callback, this.credentials);
};

Tumblr.prototype.unfollow = function (blogName, callback) {
  post('/user/unfollow', {url: blogURL(blogName)}, callback, this.credentials);
};

Tumblr.prototype.like = function (id, reblogKey, callback) {
  post('/user/like', {id: id, reblog_key: reblogKey}, callback, this.credentials);
};

Tumblr.prototype.unlike = function (id, reblogKey, callback) {
  post('/user/unlike', {id: id, reblog_key: reblogKey}, callback, this.credentials);
};

// Helpers

function createPost(blogName, type, options, callback, credentials) {
  options = options || {};
  options.type = type;

  post(blogURLPath(blogName, '/post'), options, callback, credentials);
}

function blogURL(blogName) {
  return blogName + '.tumblr.com';
}

function blogURLPath(blogName, path) {
  return '/blog/' + blogURL(blogName) + path;
}

var baseURL = 'http://api.tumblr.com/v2';

function get(path, params, callback, oauth) {
  request.get({url: baseURL + path, qs: params, oauth: oauth, followRedirect: false}, requestCallback(callback));
}

function post(path, params, callback, oauth) {
  request.post({url: baseURL + path, form: params, oauth: oauth, followRedirect: false}, requestCallback(callback));
}

function requestCallback(callback) {
  if (!callback) return function () {};

  return function (err, response, body) {
    if (err) return callback(err);

    console.log(response);

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