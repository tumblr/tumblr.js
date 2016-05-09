/*!
 * https://www.npmjs.com/package/tumblr.js
 *
 * <3 always,
 *     Tumblr
 */

var qs = require('query-string');
var request = require('request');

var set = require('lodash/set');
var keys = require('lodash/keys');
var intersection = require('lodash/intersection');
var extend = require('lodash/extend');
var reduce = require('lodash/reduce');
var partial = require('lodash/partial');
var zipObject = require('lodash/zipObject');
var isString = require('lodash/isString');
var isFunction = require('lodash/isFunction');
var isArray = require('lodash/isArray');
var isPlainObject = require('lodash/isPlainObject');
var omit = require('lodash/omit');

var CLIENT_VERSION = '1.0.0';
var API_BASE_URL = 'https://api.tumblr.com/v2';

var API_METHODS = {
    GET: {
        // Blog
        blogInfo: '/blog/:blogIdentifier/info',
        blogAvatar: '/blog/:blogIdentifier/avatar/:size',
        blogLikes: '/blog/:blogIdentifier/likes',
        blogFollowers: '/blog/:blogIdentifier/followers',
        blogPosts: '/blog/:blogIdentifier/posts/:type',
        blogQueue: '/blog/:blogIdentifier/posts/queue',
        blogDrafts: '/blog/:blogIdentifier/posts/draft',
        blogSubmissions: '/blog/:blogIdentifier/posts/submission',
        // User
        userInfo: '/user/info',
        userDashboard: '/user/dashboard',
        userFollowing: '/user/following',
        userLikes: '/user/likes',
        // General
        taggedPosts: ['/tagged', ['tag']],
    },
    POST: {
        // Post authoring
        createPost: '/blog/:blogIdentifier/post',
        editPost: '/blog/:blogIdentifier/post/edit',
        reblogPost: '/blog/:blogIdentifier/post/reblog',
        deletePost: ['/blog/:blogIdentifier/post/delete', ['id']],
        // Blog interaction
        followBlog: ['/user/follow', ['url']],
        unfollowBlog: ['/user/unfollow', ['url']],
        // Post interaction
        likePost: ['/user/like', ['id', 'reblog_key']],
        unlikePost: ['/user/unlike', ['id', 'reblog_key']],
    },
};

/**
 * ## forceFullBlogUrl
 *
 * Turns a blog name to a full blog URL
 *
 * @param  {String} blogUrl: blog name or URL
 *
 * @return {String} full blog URL
 */
function forceFullBlogUrl(blogUrl) {
    if (blogUrl.indexOf('.') < 0) {
        blogUrl += '.tumblr.com';
    }
    return blogUrl;
}

/**
 * ## createFunction
 *
 * Creates a named function with the desired signature
 *
 * @param  {String} name: function name
 * @param  {Array} [args]: array of argument names
 * @param  {Function} fn: function that contains the logic that should run
 *
 * @return {Function} a named function that takes the desired arguments
 */
function createFunction(name, args, fn) {
    if (isFunction(args)) {
        fn = args;
        args = [];
    }

    return new Function('body',
        'return function ' + name + '(' + args.join(', ') + ') { return body.apply(this, arguments); };'
    )(fn);
}

/**
 * ## requestCallback
 *
 * Wraps a function for use as a request callback
 *
 * @param  {Function} callback: function to wrap
 *
 * @return {Function} request callback
 */
function requestCallback(callback) {
    if (!callback) {
        return undefined;
    }

    return function(err, response, body) {
        if (err) {
            return callback(err, null, response);
        }

        if (response.statusCode >= 400) {
            var errString = body.meta ? body.meta.msg : body.error;
            return callback(new Error('API error: ' + response.statusCode + ' ' + errString), null, response);
        }

        if (body && body.response) {
            return callback(null, body.response, response);
        } else {
            return callback(new Error('API error (malformed API response): ' + body), null, response);
        }
    };
}

/**
 * ## getRequest
 *
 * Make a get request
 *
 * @param  {Function} requestGet: function that performs a get request
 * @param  {Object} credentials: OAuth credentials
 * @param  {String} baseUrl: base URL for the request
 * @param  {String} apiPath: URL path for the request
 * @param  {Object} requestOptions: additional request options
 * @param  {Object} params: query parameters
 * @param  {Function} callback request callback
 *
 * @return {Request} request object
 */
function getRequest(requestGet, credentials, baseUrl, apiPath, requestOptions, params, callback) {
    params = params || {};

    if (credentials.consumer_key) {
        params.api_key = credentials.consumer_key;
    }

    return requestGet(extend({
        url: baseUrl + apiPath + '?' + qs.stringify(params),
        oauth: credentials,
        json: true,
    }, requestOptions), requestCallback(callback));
}

/**
 * ## postRequest
 *
 * Create a function to make POST requests to the Tumblr API
 *
 * @param  {Function} requestPost: function that performs a get request
 * @param  {Object} credentials: OAuth credentials
 * @param  {String} baseUrl: base URL for the request
 * @param  {String} apiPath: URL path for the request
 * @param  {Object} requestOptions: additional request options
 * @param  {Object} params: form data
 * @param  {Function} callback request callback
 *
 * @return {Request} request object
 */
function postRequest(requestPost, credentials, baseUrl, apiPath, requestOptions, params, callback) {
    params = params || {};

    // Sign without multipart data
    var currentRequest = requestPost(extend({
        url: baseUrl + apiPath,
        oauth: credentials,
    }, requestOptions), function(err, response, body) {
        try {
            body = JSON.parse(body);
        } catch (e) {
            body = {
                error: 'Malformed Response: ' + body,
            };
        }
        requestCallback(callback)(err, response, body);
    });

    // Sign it with the non-data parameters
    var dataKeys = ['data'];
    currentRequest.form(omit(params, dataKeys));
    currentRequest.oauth(credentials);

    // Clear the side effects from form(param)
    delete currentRequest.headers['content-type'];
    delete currentRequest.body;

    // And then add the full body
    var form = currentRequest.form();
    for (var key in params) {
        form.append(key, params[key]);
    }

    // Add the form header back
    extend(currentRequest.headers, form.getHeaders());

    return currentRequest;
}

/**
 * ## addMethod
 *
 * Adds a request method to the client
 *
 * @param  {Object} client: add the method to this object
 * @param  {String} methodName: the name of the method
 * @param  {String} apiPath: the API route, which uses any colon-prefixed segments as arguments
 * @param  {Array} paramNames: ordered list of required request parameters used as arguments
 * @param  {String|Function} requestType: the request type or a function that makes the request
 */
function addMethod(client, methodName, apiPath, paramNames, requestType) {
    var apiPathSplit = apiPath.split('/');
    var apiPathParamsCount = apiPath.split(/\/:[^\/]+/).length - 1;

    var buildApiPath = function(args) {
        var pathParamIndex = 0;
        return reduce(apiPathSplit, function(apiPath, apiPathChunk, i) {
            // Parse arguments in the path
            if (apiPathChunk === ':blogIdentifier') {
                // Blog URLs are special
                apiPathChunk = forceFullBlogUrl(args[pathParamIndex++]);
            } else if (apiPathChunk[0] === ':') {
                apiPathChunk = args[pathParamIndex++];
            }

            if (apiPathChunk) {
                return apiPath + '/' + apiPathChunk;
            } else {
                return apiPath;
            }
        }, '');
    };

    var namedParams = (apiPath.match(/\/:[^\/]+/g) || []).map(function(param) {
        return param.substr(2);
    }).concat(paramNames, 'params', 'callback');

    var methodBody = function() {
        var argsLength = arguments.length;
        var args = new Array(argsLength);
        for (var i = 0; i < argsLength; i++) {
            args[i] = arguments[i];
        }

        var requiredParamsStart = apiPathParamsCount;
        var requiredParamsEnd = requiredParamsStart + paramNames.length;
        var requiredParamArgs = args.slice(requiredParamsStart, requiredParamsEnd);

        // Callback is at the end
        var callback = isFunction(args[args.length - 1]) ? args.pop() : null;

        // Required Parmas
        var params = zipObject(paramNames, requiredParamArgs);
        extend(params, isPlainObject(args[args.length - 1]) ? args.pop() : {});

        // Path arguments are determined after required parameters
        var apiPathArgs = args.slice(0, apiPathParamsCount);

        var request = requestType;
        if (isString(requestType)) {
            request = requestType.toUpperCase() === 'POST' ? client.postRequest : client.getRequest;
        } else if (!isFunction(requestType)) {
            request = client.getRequest;
        }

        return request.call(client, buildApiPath(apiPathArgs), params, callback);
    };

    set(client, methodName, createFunction(methodName, namedParams, methodBody));
}

/**
 * ## addMethods
 *
 * Adds methods to the client
 *
 * @param  {TumblrClient} client: an instance of the `tumblr.js` API client
 * @param  {Object} methods: mapping of method names to endpoints. Endpoints can be a string or an
 *         array of format `[apiPathString, requireParamsArray]`
 * @param  {String|Function} requestType: the request type or a function that makes the request
 */
function addMethods(client, methods, requestType) {
    var apiPath, paramNames;
    for (var methodName in methods) {
        apiPath = methods[methodName];
        if (isString(apiPath)) {
            paramNames = [];
        } else if (isPlainObject(apiPath)) {
            paramNames = apiPath.paramNames || [];
            apiPath = apiPath.path;
        } else {
            paramNames = apiPath[1] || [];
            apiPath = apiPath[0];
        }
        addMethod(client, methodName, apiPath, paramNames, requestType || 'GET');
    }
}

/**
 * ## wrapCreatePost
 *
 * Wraps createPost to specify `type` and validate the parameters
 *
 * @param  {String} type: post type
 * @param  {Function} [validate]: returns `true` if the parameters validate
 *
 * @return {Function} wrapped function
 */
function wrapCreatePost(type, validate) {
    return function(blogIdentifier, params, callback) {
        params = extend({type: type}, params);

        if (isArray(validate)) {
            validate = partial(function(params, requireKeys) {
                if (requireKeys.length) {
                    var keyIntersection = intersection(keys(params), requireKeys);
                    if (requireKeys.length === 1 && !keyIntersection.length) {
                        throw new Error('Missing required field: ' + requireKeys[0]);
                    } else if (!keyIntersection.length) {
                        throw new Error('Missing one of: ' + requireKeys.join(', '));
                    } else if (keyIntersection.length > 1) {
                        throw new Error('Can only use one of: ' + requireKeys.join(', '));
                    }
                }
                return true;
            }, params, validate);
        }

        if (isFunction(validate)) {
            if (!validate(params)) {
                throw new Error('Error validating parameters');
            }
        }

        if (arguments.length > 2) {
            return this.createPost(blogIdentifier, params, callback);
        } else {
            return this.createPost(blogIdentifier, params);
        }
    };
}

/**
 * ## TumblrClient
 *
 * Creates a Tumblr API client using the given credentials and with a specific base URL.
 *
 * @constructor
 * @param  {Object} [credentials]: OAuth credentials
 * @param  {String} [baseUrl]: API base URL
 * @param  {Object} [requestLibrary]: library to use for making requests
 */
function TumblrClient(credentials, baseUrl, requestLibrary) {
    this.version = CLIENT_VERSION;
    this.credentials = credentials || {};
    this.baseUrl = baseUrl || API_BASE_URL;
    this.requestOptions = {
        followRedirect: false,
        headers: {
            'User-Agent': 'tumblr.js/' + CLIENT_VERSION,
        },
    };

    this.request = requestLibrary || request;

    this.addGetMethods(API_METHODS.GET);
    this.addPostMethods(API_METHODS.POST);

    this.createTextPost = wrapCreatePost('text', ['body']);
    this.createPhotoPost = wrapCreatePost('photo', ['data', 'data64', 'source']);
    this.createQuotePost = wrapCreatePost('quote', ['quote']);
    this.createLinkPost = wrapCreatePost('link', ['url']);
    this.createChatPost = wrapCreatePost('chat', ['conversation']);
    this.createAudioPost = wrapCreatePost('audio', ['data', 'data64', 'external_url']);
    this.createVideoPost = wrapCreatePost('video', ['data', 'data64', 'embed']);
}

/**
 * ## getRequest
 *
 * Perform a GET request
 *
 * @param  {String} apiPath: URL path for the request
 * @param  {Object} params: query parameters
 * @param  {Function} callback request callback
 *
 * @return {Request} request object
 */
TumblrClient.prototype.getRequest = function(apiPath, params, callback) {
    if (isFunction(params)) {
        callback = params;
        params = {};
    }
    return getRequest(this.request.get, this.credentials, this.baseUrl, apiPath, this.requestOptions, params, callback);
};

/**
 * ## postRequest
 *
 * Perform a POST request
 *
 * @param  {String} apiPath: URL path for the request
 * @param  {Object} params: form parameters
 * @param  {Function} callback request callback
 *
 * @return {Request} request object
 */
TumblrClient.prototype.postRequest = function(apiPath, params, callback) {
    if (isFunction(params)) {
        callback = params;
        params = {};
    }
    return postRequest(this.request.post, this.credentials, this.baseUrl, apiPath, this.requestOptions, params, callback);
};

/**
 * ## addGetMethods
 *
 * Adds GET methods to the client
 *
 * @param  {Object} methods: mapping of method names to endpoints
 */
TumblrClient.prototype.addGetMethods = function(methods) {
    addMethods(this, methods, 'GET');
};

/**
 * ## addPostMethods
 *
 * Adds POST methods to the client
 *
 * @param  {Object} methods: mapping of method names to endpoints
 */
TumblrClient.prototype.addPostMethods = function(methods) {
    addMethods(this, methods, 'POST');
};

/**
 * Please, enjoy our luxurious exports.
 */
module.exports = {
    Client: TumblrClient,
    createClient: function(credentials, baseUrl) {
        return new TumblrClient(credentials, baseUrl);
    },
};
