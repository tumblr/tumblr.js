var request = require('request')
  , qs = require('querystring');

function Tumblr(credentials) {
    this.credentials = credentials;
}

module.exports = Tumblr;

// Blog

Tumblr.prototype.blogInfo = function(blogName, callback) {
    get('blog/' + blogName + '.tumblr.com/info', {}, this.credentials, callback);
};

Tumblr.prototype.avatar = function(options) {};

Tumblr.prototype.followers = function(blogName, options, callback) {
    get('blog/' + blogName + '.tumblr.com/followers', options, this.credentials, callback);
};

Tumblr.prototype.posts = function(options) {};
Tumblr.prototype.queue = function(options) {};
Tumblr.prototype.draft = function(options) {};
Tumblr.prototype.submission = function(options) {};

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

Tumblr.prototype.info = function(options) {};
Tumblr.prototype.dashboard = function(options) {};
Tumblr.prototype.likes = function(options) {};
Tumblr.prototype.following = function(options) {};
Tumblr.prototype.follow = function(options) {};
Tumblr.prototype.unfollow = function(options) {};
Tumblr.prototype.like = function(options) {};
Tumblr.prototype.unlike = function(options) {};

// Helpers

var get = function(path, params, oauth, callback) {
    // TODO: Be smarter about handling which arguments are passed

    // TODO: Is this a good idea?
    if (!callback) {
        callback = function(response) {
            console.log(response);
        };
    }

    var url = 'http://api.tumblr.com/v2/' + path + '?api_key=' + oauth.consumer_key;

    // TODO: Better way to checkjust for this? Look at Underscore
    if (params && Object.keys(params).length > 0) {
        url += '&' + qs.stringify(params);
    }

    request.get({ url: url, oauth: oauth }, function(err, response, body) {
        // TODO: Error handling
        callback(body.response);
    });
};