var fs = require('fs');
var qs = require('querystring');

function TumblrClient(credentials) {
  this.credentials = credentials || {};
}

var request;

module.exports = {

  Client: TumblrClient,

  createClient: function (credentials) {
    return new TumblrClient(credentials);
  },

  request: function(r) {
    request = r;
  }

};

var baseURL = 'http://api.tumblr.com/v2';
var version = require('../package.json').version;

var calls = {

  postCreation: function (type, requireOptions, acceptsData) {
    return function (blogName, options, callback) {
      requireValidation(options, requireOptions);
      options.type = type;
      if (!acceptsData) {
        delete options.data;
      }
      this._post(blogPath(blogName, '/post'), options, callback);
    };
  },

  getWithOptions: function (path) {
    return function (options, callback) {
      if (isFunction(options)) { callback = options; options = {}; }
      this._get(path, options, callback);
    };
  },

  blogList: function (path) {
    return function (blogName, options, callback) {
      if (isFunction(options)) { callback = options; options = {}; }
      this._get(blogPath(blogName, path), options, callback);
    };
  }

};

TumblrClient.prototype = {

  // Tagged

  tagged: function (tag, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.tag = tag;

    this._get('/tagged', options, callback, true);
  },

  // Blogs

  blogInfo: function (blogName, callback) {
    this._get(blogPath(blogName, '/info'), {}, callback, true);
  },

  avatar: function (blogName, size, callback) {
    if (isFunction(size)) { callback = size; size = null; }
    var path = size ? '/avatar/' + size : '/avatar';
    this._get(blogPath(blogName, path), {}, callback, true);
  },

  blogLikes: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }
    this._get(blogPath(blogName, '/likes'), options, callback, true);
  },

  followers: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }
    this._get(blogPath(blogName, '/followers'), options, callback);
  },

  posts: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }
    options = options || {};
    var path = options.type ? '/posts/' + options.type : '/posts';
    this._get(blogPath(blogName, path), options, callback, true);
  },

  queue:       calls.blogList('/posts/queue'),
  drafts:      calls.blogList('/posts/draft'),
  submissions: calls.blogList('/posts/submission'),

  // Posts

  edit: function (blogName, options, callback) {
    this._post(blogPath(blogName, '/post/edit'), options, callback);
  },

  reblog: function (blogName, options, callback) {
    this._post(blogPath(blogName, '/post/reblog'), options, callback);
  },

  deletePost: function (blogName, id, callback) {
    this._post(blogPath(blogName, '/post/delete'), {id: id}, callback);
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
    if (isFunction(options)) { callback = options; options = {}; }
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

    request.get({
      url: baseURL + path + '?' + qs.stringify(params),
      json: true,
      oauth: this.credentials,
      followRedirect: false,
      headers : {
        'User-Agent' : 'tumblr.js/' + version
      }
    }, requestCallback(callback));

  },

  _post: function (path, params, callback) {

    var data = params.data;

    delete params.data;

    // Sign without multipart data
    var r = request.post({
      url : baseURL + path,
      headers :  {
        'User-Agent' : 'tumblr.js/' + version
      }
    }, function (err, response, body) {
      try { body = JSON.parse(body); } catch (e) { body = { error: 'Malformed Response: ' + body }; }
      requestCallback(callback)(err, response, body);
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

      // An array can be passed for multi-image posts
      if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
          form.append('data[' + i + ']', filePointer(data[i]));
        }
      } else {
        form.append('data', filePointer(data));
      }

    }

    // Add the form header back
    var headers = form.getHeaders();
    for (key in headers) {
      r.headers[key] = headers[key];
    }

  }

};

var requireValidation = function (options, choices) {
  var count = 0;
  for (var i = 0; i < choices.length; i++) {
    if (options[choices[i]]) {
      count += 1;
    }
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

function blogPath(blogName, path) {
  var bn = blogName.indexOf('.') !== -1 ? blogName : blogName + '.tumblr.com';
  return '/blog/' + bn + path;
}

function requestCallback(callback) {
  if (!callback) return undefined;
  return function (err, response, body) {

    if (err) return callback(err);
    if (response.statusCode >= 400) {
      var errString = body.meta ? body.meta.msg : body.error;
      return callback(new Error('API error: ' + response.statusCode + ' ' + errString));
    }

    if (body && body.response) {
      return callback(null, body.response);
    } else {
      return callback(new Error('API error (malformed API response): ' + body));
    }
  };
}

function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}

// Check if path is web, otherwise pull from fs
function filePointer(path) {
  if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
    return request.get(path);
  } else {
    return fs.createReadStream(path);
  }
}