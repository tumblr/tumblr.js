var request = require('request');

function Tumblr(credentials) {
  this.credentials = credentials;
}

module.exports = Tumblr;

// TODO: Check option validity (arrays of expected option values)

// Blogs

Tumblr.prototype.blogInfo = function (blogName, callback) {
  blogRequest('/info', blogName, {}, callback, this.credentials);
};

Tumblr.prototype.avatar = function (options, callback) {
  // TODO
};

Tumblr.prototype.followers = function (blogName, options, callback) {
  blogRequest('/followers', blogName, options, callback, this.credentials);
};

Tumblr.prototype.posts = function (blogName, options, callback) {
  blogRequest('/posts', blogName, options, callback, this.credentials);
};

Tumblr.prototype.queue = function (blogName, options, callback) {
  blogRequest('/posts/queue', blogName, options, callback, this.credentials);
};

Tumblr.prototype.drafts = function (blogName, options, callback) {
  blogRequest('/posts/draft', blogName, options, callback, this.credentials);
};

Tumblr.prototype.submissions = function (blogName, options, callback) {
  blogRequest('/posts/submission', blogName, options, callback, this.credentials);
};

// Posts

Tumblr.prototype.edit = function (options) {
  // TODO
};

Tumblr.prototype.reblog = function (options) {
  // TODO
};

Tumblr.prototype.delete = function (options) {
  // TODO
};

Tumblr.prototype.photo = function (options) {
  options = options || {};
  options.type = 'photo';

  // TODO
};

Tumblr.prototype.quote = function (options) {
  options = options || {};
  options.type = 'quote';

  // TODO
};

Tumblr.prototype.text = function (options) {
  options = options || {};
  options.type = 'text';

  // TODO
};

Tumblr.prototype.link = function (options) {
  options = options || {};
  options.type = 'link';

  // TODO
};

Tumblr.prototype.chat = function (options) {
  options = options || {};
  options.type = 'chat';

  // TODO
};

Tumblr.prototype.audio = function (options) {
  options = options || {};
  options.type = 'audio';

  // TODO
};

Tumblr.prototype.video = function (options) {
  options = options || {};
  options.type = 'video';

  // TODO
};

// User

Tumblr.prototype.userInfo = function (callback) {
  get('/user/info', {}, callback, this.credentials);
};

Tumblr.prototype.dashboard = function (options, callback) {
  get('/user/dashboard', options, callback, this.credentials);
};

Tumblr.prototype.likes = function (offset, limit, callback) {
  get('/user/likes', {offset: offset || 0, limit: limit || 20}, callback, this.credentials);
};

Tumblr.prototype.following = function (offset, limit, callback) {
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

var blogRequest = function (path, blogName, options, callback, credentials) {
  options = options || {};
  options.api_key = credentials.consumer_key;

  get(blogURLPath(blogName, path), options, callback, credentials);
};

var blogURL = function (blogName) {
  return blogName + '.tumblr.com';
}

var blogURLPath = function (blogName, path) {
  return '/blog/' + blogURL(blogName) + path;
};

var baseURL = 'http://api.tumblr.com/v2';

var get = function (path, params, callback, oauth) {
  // TODO: Be smarter about handling which arguments are passed
  request.get({url: baseURL + path, qs: params, oauth: oauth}, requestCallback(callback));
};

var post = function (path, params, callback, oauth) {
  // TODO: Be smarter about handling which arguments are passed
  request.post({url: baseURL + path, form: params, oauth: oauth}, requestCallback(callback));
};

var requestCallback = function (callback) {
  if (!callback) {
    // If callback has not been provided, log the response (particularly useful in the REPL)
    callback = function (response) {
      console.log(JSON.stringify(response, null, 2));
    };
  }

  return function (err, response, body) {
    if (err)
      return callback('Unknown error');

    var responseBody = JSON.parse(body)
      , statusCode = responseBody.meta.status;

    if (statusCode != 200)
      return callback('API error: ' + statusCode);

    return callback(responseBody.response);
  };
};