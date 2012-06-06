var request = require('request')
  , qs = require('querystring');

function Tumblr(credentials) {
    this.credentials = credentials;
}

module.exports = Tumblr;

// Blogs

Tumblr.prototype.blogInfo = function(blogName, callback) {
    get(blogPathForBlogName(blogName) + '/info', {}, this.credentials, callback);
};

Tumblr.prototype.avatar = function(options, callback) {};

Tumblr.prototype.followers = function(blogName, options, callback) {
    get(blogPathForBlogName(blogName) + '/followers', options, this.credentials, callback);
};

Tumblr.prototype.posts = function(blogName, options, callback) {
    get(blogPathForBlogName(blogName) + '/posts', options, this.credentials, callback);
};

Tumblr.prototype.queue = function(blogName, options, callback) {
    get(blogPathForBlogName(blogName) + '/posts/queue', options, this.credentials, callback);
};

Tumblr.prototype.drafts = function(blogName, options, callback) {
    get(blogPathForBlogName(blogName) + '/posts/draft', options, this.credentials, callback);
};

Tumblr.prototype.submissions = function(blogName, options, callback) {
    get(blogPathForBlogName(blogName) + '/posts/submission', options, this.credentials, callback);
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
    get('/user/info', {}, this.credentials, callback);
};

Tumblr.prototype.dashboard = function(options, callback) {
    get('/user/dashboard', {}, this.credentials, callback);

};

Tumblr.prototype.likes = function(options, callback) {
    get('/user/likes', {}, this.credentials, callback);
};

Tumblr.prototype.following = function(options, callback) {
    get('/user/following', {}, this.credentials, callback);
};

Tumblr.prototype.follow = function(options, callback) {};
Tumblr.prototype.unfollow = function(options, callback) {};
Tumblr.prototype.like = function(options, callback) {};
Tumblr.prototype.unlike = function(options, callback) {};

// Helpers

var blogPathForBlogName = function(blogName) {
    return '/blog/' + blogName + '.tumblr.com';
};

var get = function(path, params, oauth, callback) {
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
        url += '&' + qs.stringify(params);
    }

    request.get({ url: url, oauth: oauth }, function(err, response, body) {
        // TODO: Error handling

        // TODO: JSON.parse(body) doesn't handle nested objects ([Object object])
        callback(body);
    });
};