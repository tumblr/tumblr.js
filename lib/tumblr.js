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

var baseURL = 'http://api.tumblr.com/v2';

Tumblr.prototype = {

  // Tagged

  tagged: function (tag, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.api_key = this.credentials.consumer_key;

    this._get('/tagged', options, callback);
  },

  // Blogs

  blogInfo: function (blogName, callback) {
    this._get(blogURLPath(blogName, '/info'), {api_key: this.credentials.consumer_key}, callback);
  },

  avatar: function (blogName, size, callback) {
    if (isFunction(size)) { callback = size; size = null; }

    this._get(blogURLPath(blogName, '/avatar/' + (size || 64)), {api_key: this.credentials.consumer_key}, callback);
  },

  blogLikes: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.api_key = this.credentials.consumer_key;

    this._get(blogURLPath(blogName, '/likes'), options, callback);
  },

  followers: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.api_key = this.credentials.consumer_key;

    this._get(blogURLPath(blogName, '/followers'), options, callback);
  },

  posts: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.api_key = this.credentials.consumer_key;

    var path = '/posts';
    if (options.type) {
      path += '/' + options.type;
    }

    this._get(blogURLPath(blogName, path), options, callback);
  },

  queue: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    this._get(blogURLPath(blogName, '/posts/queue'), options, callback);
  },

  drafts: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    this._get(blogURLPath(blogName, '/posts/draft'), options, callback);
  },

  submissions: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    this._get(blogURLPath(blogName, '/posts/submission'), options, callback);
  },

  // Posts

  edit: function (blogName, options, callback) {
    this._post(blogURLPath(blogName, '/post/edit'), options, callback);
  },

  reblog: function (blogName, options, callback) {
    this._post(blogURLPath(blogName, '/post/reblog'), options, callback);
  },

  deletePost: function (blogName, id, callback) {
    this._post(blogURLPath(blogName, '/post/delete'), {id: id}, callback);
  },

  photo: function (blogName, options, callback) {
    if (options.data && options.source) {
      callback(new Error('Can\'t pass both "data" and "source" fields'));
      return;
    }

    var that = this;

    if (options.data) {
      // TODO: Add support for multiple photos
      fs.readFile(options.data, 'base64', function (err, data) {
        if (err) throw err;

        options.data = data;
        that._createPost(blogName, 'photo', options, callback);
      });
    }
  },

  quote: function (blogName, options, callback) {
    if (!options.quote) {
      callback(new Error('Missing required field: "quote"'));
      return;
    }

    this._createPost(blogName, 'quote', options, callback);
  },

  text: function (blogName, options, callback) {
    if (!options.body) {
      callback(new Error('Missing required field: "body"'));
      return;
    }

    this._createPost(blogName, 'text', options, callback);
  },

  link: function (blogName, options, callback) {
    if (!options.url) {
      callback(new Error('Missing required field: "url"'));
      return;
    }

    this._createPost(blogName, 'link', options, callback);
  },

  chat: function (blogName, options, callback) {
    if (!options.conversation) {
      callback(new Error('Missing required field: "conversation"'));
      return;
    }

    this._createPost(blogName, 'chat', options, callback);
  },

  audio: function (blogName, options, callback) {
    if (!options.data && !options.external_url) {
      callback(new Error('Missing required field: "data" or "external_url"'));
      return;
    }

    if (options.data && options.external_url) {
      callback(new Error('Can\'t pass both "data" and "external_url" fields'));
      return;
    }

    if (options.data) {
      var that = this;

      fs.readFile(options.data, function (err, data) {
        if (err) throw err;

        options.data = data.toString('base64');
        that._createPost(blogName, 'audio', options, callback);
      });
    }
  },

  video: function (blogName, options, callback) {
    if (!options.data && !options.external_url) {
      callback(new Error('Missing required field: "data" or "embed"'));
      return;
    }

    if (options.data && options.embed) {
      callback(new Error('Can\'t pass both "data" and "embed" fields'));
      return;
    }

    if (options.data) {
      var that = this;

      fs.readFile(options.data, function (err, data) {
        if (err) throw err;

        options.data = data.toString('base64');
        that._createPost(blogName, 'video', options, callback);
      });
    }
  },

  // User

  userInfo: function (callback) {
    this._get('/user/info', {}, callback);
  },

  dashboard: function (options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    this._get('/user/dashboard', options, callback);
  },

  likes: function (offset, limit, callback) {
    if (isFunction(offset)) { callback = offset; offset = null; limit = null; }
    if (isFunction(limit)) { callback = limit; limit = null; }

    this._get('/user/likes', {offset: offset || 0, limit: limit || 20}, callback);
  },

  following: function (offset, limit, callback) {
    if (isFunction(offset)) { callback = offset; offset = null; limit = null; }
    if (isFunction(limit)) { callback = limit; limit = null; }

    this._get('/user/following', {offset: offset || 0, limit: limit || 20}, callback);
  },

  follow: function (blogName, callback) {
    this._post('/user/follow', {url: blogURL(blogName)}, callback);
  },

  unfollow: function (blogName, callback) {
    this._post('/user/unfollow', {url: blogURL(blogName)}, callback);
  },

  like: function (id, reblogKey, callback) {
    this._post('/user/like', {id: id, reblog_key: reblogKey}, callback);
  },

  unlike: function (id, reblogKey, callback) {
    this._post('/user/unlike', {id: id, reblog_key: reblogKey}, callback);
  },

  // Helpers

  _createPost: function (blogName, type, options, callback) {
    options = options || {};
    options.type = type;

    this._post(blogURLPath(blogName, '/post'), options, callback);
  },

  _get: function (path, params, callback) {
    request.get({url: baseURL + path, qs: params, oauth: this.credentials, followRedirect: false}, requestCallback(callback));
  },

  _post: function (path, params, callback) {
    request.post({url: baseURL + path, form: params, oauth: this.credentials, followRedirect: false}, requestCallback(callback));
  }

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

    var responseBody = JSON.parse(body),
      statusCode = responseBody.meta.status,
      message = responseBody.meta.msg;

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
