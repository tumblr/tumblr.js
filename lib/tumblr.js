var fs = require('fs');

function TumblrClient(credentials) {
  this.credentials = credentials || {};
}

var request;

module.exports = {

  Client: TumblrClient,

  createClient: function (credentials) {
    var client = Object.create(TumblrClient.prototype);
    TumblrClient.bind(client)(credentials);
    return client;
  },

  request: function(r) {
    request = r;
  }

};


var baseURL = 'http://api.tumblr.com/v2';

var calls = {
  postCreation: function (type, requireOptions, allowsData) {
    return function (blogName, options, callback) {
      validations.require(options, requireOptions);
      this._createPost(blogName, type, options, allowsData, callback);
    };
  }
};

TumblrClient.prototype = {

  // Tagged

  tagged: function (tag, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.tag = tag;
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

  dashboard: function (options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    this._get('/user/dashboard', options, callback);
  },

  likes: function (options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.api_key = this.credentials.consumer_key;

    this._get('/user/likes', options, callback);
  },

  following: function (options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    this._get('/user/following', options, callback);
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

  _createPost: function (blogName, type, options, acceptsData, callback) {
    options = options || {};
    options.type = type;

    if (acceptsData && options.data) {
      var that = this;
      fs.readFile(options.data, function (err, data) {
        if (err) throw err;
        options.data = data.toString('base64');
        that._post(blogURLPath(blogName, '/post'), options, callback);
      });
    } else {
      this._post(blogURLPath(blogName, '/post'), options, callback);
    }
  },

  _get: function (path, params, callback) {
    request.get({url: baseURL + path, json: true, qs: params, oauth: this.credentials, followRedirect: false}, requestCallback(callback));
  },

  _post: function (path, params, callback) {
    request.post({url: baseURL + path, json: true, form: params, oauth: this.credentials, followRedirect: false}, requestCallback(callback));
  }

};

var requireValidation = function (options, choices) {
  var count = 0;
  for (var i = 0; i < choices.length; i++) {
    if (!options[choices[i]]) count += 1;
  }
  if (choices.length === 1) {
    if (count === 0) {
      throw new Error('Missing required field: "' + choices[0] + '"');
    }
  } else if (choices.length > 1) {
    if (count === 0) {
      throw new Error('Missing one of: ' + choices.join(','));
    }
    if (count > 1) {
      throw new Error('Can only use one of: ' + choices.join(','));
    }
  }
};

function blogURL(blogName) {
  return blogName + '.tumblr.com';
}

function blogURLPath(blogName, path) {
  return '/blog/' + blogURL(blogName) + path;
}

function requestCallback(callback) {
  if (!callback) return;
  return function (err, response, body) {
    if (err) return callback(err);
    if (response.statusCode >= 400) {
      return callback(new Error('API error: ' + response.statusCode + ' ' + responseBody.meta.msg));
    }
    return callback(null, body.response);
  };
}

function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}
