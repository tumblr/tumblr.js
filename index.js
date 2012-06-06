var request = require('request')
  , qs = require('querystring');

function Tumblr(credentials) {
    this.credentials = credentials;
}

module.exports = Tumblr;

// Blogs

Tumblr.prototype.blogInfo = function(blogName, callback) {
    blogRequest('/info', blogName, {}, callback, this.credentials);
};

Tumblr.prototype.avatar = function(options, callback) {
};

Tumblr.prototype.followers = function(blogName, options, callback) {
    blogRequest('/followers', blogName, options, callback, this.credentials);
};

Tumblr.prototype.posts = function(blogName, options, callback) {
    blogRequest('/posts', blogName, options, callback, this.credentials);
};

Tumblr.prototype.queue = function(blogName, options, callback) {
    blogRequest('/posts/queue', blogName, options, callback, this.credentials);
};

Tumblr.prototype.drafts = function(blogName, options, callback) {
    blogRequest('/posts/draft', blogName, options, callback, this.credentials);
};

Tumblr.prototype.submissions = function(blogName, options, callback) {
    blogRequest('/posts/submission', blogName, options, callback, this.credentials);
};

// Posts

Tumblr.prototype.edit = function(options) {};
Tumblr.prototype.reblog = function(options) {};
Tumblr.prototype.delete = function(options) {};
Tumblr.prototype.photo = function(options) {};
Tumblr.prototype.quote = function(options) {};
Tumblr.prototype.text = function(options) {};
Tumblr.prototype.link = function(options) {};
Tumblr.prototype.chat = function(options) {};
Tumblr.prototype.audio = function(options) {};
Tumblr.prototype.video = function(options) {};

// User

Tumblr.prototype.userInfo = function(callback) {
    get('/user/info', {}, callback, this.credentials);
};

Tumblr.prototype.dashboard = function(options, callback) {
    get('/user/dashboard', {}, callback, this.credentials);
};

Tumblr.prototype.likes = function(options, callback) {
    get('/user/likes', {}, callback, this.credentials);
};

Tumblr.prototype.following = function(options, callback) {
    get('/user/following', {}, callback, this.credentials);
};

Tumblr.prototype.follow = function(options, callback) {};
Tumblr.prototype.unfollow = function(options, callback) {};
Tumblr.prototype.like = function(options, callback) {};
Tumblr.prototype.unlike = function(options, callback) {};

// Helpers

var blogRequest = function(path, blogName, options, callback, credentials) {
    options = options || {};
    options.api_key = credentials.consumer_key;

    get(blogPathForBlogName(blogName) + path, options, callback, credentials);
};

var blogPathForBlogName = function(blogName) {
    return '/blog/' + blogName + '.tumblr.com';
};

var get = function(path, params, callback, oauth) {
    // TODO: Be smarter about handling which arguments are passed

    // TODO: Is this a good idea?
    if (!callback) {
        callback = function(response) {
            console.log(response);
        };
    }

    var url = 'http://api.tumblr.com/v2' + path;

    // TODO: Better way to checkjust for this? Look at Underscore
    if (params && Object.keys(params).length > 0) {
        url += '?' + qs.stringify(params);
    }

    console.log(url);

    request.get({ url: url, oauth: oauth }, function(err, response, body) {
        // TODO: Error handling

        // TODO: JSON.parse(body) doesn't handle nested objects ([Object object])
        callback(body);
    });
};