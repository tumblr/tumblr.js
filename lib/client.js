var fs = require('fs');
var qs = require('querystring');

var helpers = require('./helpers');

var calls = {
  postCreation: function (type, requireOptions, acceptsData) {
    return function (blogName, options, callback) {
      helpers.requireValidation(options, requireOptions);
      options.type = type;
      if (!acceptsData) {
        delete options.data;
      }
      this._post(helpers.blogPath(blogName, '/post'), options, callback);
    };
  },

  getWithOptions: function (path) {
    return function (options, callback) {
      if (helpers.isFunction(options)) { callback = options; options = {}; }
      this._get(path, options, callback);
    };
  },

  blogList: function (path) {
    return function (blogName, options, callback) {
      if (helpers.isFunction(options)) { callback = options; options = {}; }
      this._get(helpers.blogPath(blogName, path), options, callback);
    };
  }
};

function TumblrClient(credentials, req) {
  this.credentials = credentials || {};
}

TumblrClient.prototype = {

  // Tagged

  tagged: function (tag, options, callback) {
    if (helpers.isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.tag = tag;

    this._get('/tagged', options, callback, true);
  },

  // Blogs

  blogInfo: function (blogName, callback) {
    this._get(helpers.blogPath(blogName, '/info'), {}, callback, true);
  },

  avatar: function (blogName, size, callback) {
    if (helpers.isFunction(size)) { callback = size; size = null; }
    var path = size ? '/avatar/' + size : '/avatar';
    this._get(helpers.blogPath(blogName, path), {}, callback, true);
  },

  blogLikes: function (blogName, options, callback) {
    if (helpers.isFunction(options)) { callback = options; options = {}; }
    this._get(helpers.blogPath(blogName, '/likes'), options, callback, true);
  },

  followers: function (blogName, options, callback) {
    if (helpers.isFunction(options)) { callback = options; options = {}; }
    this._get(helpers.blogPath(blogName, '/followers'), options, callback);
  },

  posts: function (blogName, options, callback) {
    if (helpers.isFunction(options)) { callback = options; options = {}; }
    options = options || {};
    var path = options.type ? '/posts/' + options.type : '/posts';
    this._get(helpers.blogPath(blogName, path), options, callback, true);
  },

  queue:       calls.blogList('/posts/queue'),
  drafts:      calls.blogList('/posts/draft'),
  submissions: calls.blogList('/posts/submission'),

  // Posts

  edit: function (blogName, options, callback) {
    this._post(helpers.blogPath(blogName, '/post/edit'), options, callback);
  },

  reblog: function (blogName, options, callback) {
    this._post(helpers.blogPath(blogName, '/post/reblog'), options, callback);
  },

  deletePost: function (blogName, id, callback) {
    this._post(helpers.blogPath(blogName, '/post/delete'), {id: id}, callback);
  },

  photo: calls.postCreation('photo', ['data', 'source'],       true),
  audio: calls.postCreation('audio', ['data', 'external_url'], true),
  video: calls.postCreation('video', ['data', 'embed'],        true),
  quote: calls.postCreation('quote', ['quote'],                false),
  text:  calls.postCreation('text',  ['body'],                 false),
  link:  calls.postCreation('link',  ['url'],                  false),
  chat:  calls.postCreation('chat',  ['conversation'],         false),

  // User

  userInfo: function (callback) {
    this._get('/user/info', {}, callback);
  },

  likes: function (options, callback) {
    if (helpers.isFunction(options)) { callback = options; options = {}; }
    this._get('/user/likes', options, callback);
  },

  follow: function (url, callback) {
    this._post('/user/follow', {url: url}, callback);
  },

  unfollow: function (url, callback) {
    this._post('/user/unfollow', {url: url}, callback);
  },

  like: function (id, reblogKey, callback) {
    this._post('/user/like', {id: id, reblog_key: reblogKey}, callback);
  },

  unlike: function (id, reblogKey, callback) {
    this._post('/user/unlike', {id: id, reblog_key: reblogKey}, callback);
  },

  dashboard: calls.getWithOptions('/user/dashboard'),
  following: calls.getWithOptions('/user/following'),

  // Helpers

  _get: function (path, params, callback, addApiKey) {

    params = params || {};
    if (addApiKey) {
      params.api_key = this.credentials.consumer_key;
    }

    this.request.get({
      url: helpers.baseUrl + path + '?' + qs.stringify(params),
      json: true,
      oauth: this.credentials,
      followRedirect: false
    }, helpers.requestCallback(callback));

  },

  _post: function (path, params, callback) {

    var data = params.data;
    delete params.data;

    // Sign without multipart data
    var r = this.request.post(helpers.baseUrl + path, function (err, response, body) {
      try { body = JSON.parse(body); } catch (e) { body = { error: 'Malformed Response: ' + body }; }
      helpers.requestCallback(callback)(err, response, body);
    });

    // Sign it with the non-data parameters
    r.form(params);
    r.oauth(this.credentials);

    // Clear the side effects from form(param)
    delete r.headers['content-type'];
    delete r.body;

    // And then add the full body
    var form = r.form();
    for (var key in params) {
      form.append(key, params[key]);
    }
    if (data) {
      form.append('data', fs.createReadStream(data));
    }

    // Add the form header back
    var headers = form.getHeaders();
    for (key in headers) {
      r.headers[key] = headers[key];
    }

  }

};



module.exports = TumblrClient;