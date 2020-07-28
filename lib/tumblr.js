/*!
 * https://www.npmjs.com/package/tumblr.js
 *
 * <3 always,
 *     Tumblr
 */

/**
 * @namespace tumblr
 */

const qs = require('query-string');
const request = require('request');
const URL = require('url').URL;

const get = require('lodash/get');
const set = require('lodash/set');
const keys = require('lodash/keys');
const intersection = require('lodash/intersection');
const extend = require('lodash/extend');
const reduce = require('lodash/reduce');
const partial = require('lodash/partial');
const zipObject = require('lodash/zipObject');
const isString = require('lodash/isString');
const isFunction = require('lodash/isFunction');
const isArray = require('lodash/isArray');
const isPlainObject = require('lodash/isPlainObject');
const omit = require('lodash/omit');

const CLIENT_VERSION = '3.0.0';
const API_BASE_URL = 'https://api.tumblr.com'; // deliberately no trailing slash

const API_METHODS = {
    GET: {
        /**
         * Gets information about a given blog
         *
         * @method blogInfo
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} [params] - optional data sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        blogInfo: '/v2/blog/:blogIdentifier/info',

        /**
         * Gets the avatar URL for a blog
         *
         * @method blogAvatar
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {number} [size] - avatar size, in pixels
         * @param  {Object} [params] - optional data sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        blogAvatar: '/v2/blog/:blogIdentifier/avatar/:size',

        /**
         * Gets the likes for a blog
         *
         * @method blogLikes
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} [params] - optional data sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        blogLikes: '/v2/blog/:blogIdentifier/likes',

        /**
         * Gets the followers for a blog
         *
         * @method blogFollowers
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} [params] - optional data sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        blogFollowers: '/v2/blog/:blogIdentifier/followers',

        /**
         * Gets a list of posts for a blog
         *
         * @method blogPosts
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {string} [type] - filters returned posts to the specified type
         * @param  {Object} [params] - optional data sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @memberof TumblrClient
         */
        blogPosts: '/v2/blog/:blogIdentifier/posts/:type',

        /**
         * Gets the queue for a blog
         *
         * @method blogQueue
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} [params] - optional data sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        blogQueue: '/v2/blog/:blogIdentifier/posts/queue',

        /**
         * Gets the drafts for a blog
         *
         * @method blogDrafts
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} [params] - optional data sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        blogDrafts: '/v2/blog/:blogIdentifier/posts/draft',

        /**
         * Gets the submissions for a blog
         *
         * @method blogSubmissions
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} [params] - optional parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        blogSubmissions: '/v2/blog/:blogIdentifier/posts/submission',

        /**
         * Gets information about the authenticating user and their blogs
         *
         * @method userInfo
         *
         * @param  {Object} [params] - optional parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        userInfo: '/v2/user/info',

        /**
         * Gets the dashboard posts for the authenticating user
         *
         * @method userDashboard
         *
         * @param  {Object} [params] - optional parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        userDashboard: '/v2/user/dashboard',

        /**
         * Gets the blogs the authenticating user follows
         *
         * @method userFollowing
         *
         * @param  {Object} [params] - optional parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        userFollowing: '/v2/user/following',

        /**
         * Gets the likes for the authenticating user
         *
         * @method userLikes
         *
         * @param  {Object} [params] - optional parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        userLikes: '/v2/user/likes',

        /**
         * Gets posts tagged with the specified tag
         *
         * @method taggedPosts
         *
         * @param  {string} [tag] - tag to search for
         * @param  {Object} [params] - optional parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        taggedPosts: ['/v2/tagged', ['tag']],
    },

    POST: {
        /**
         * Creates a post on the given blog.
         *
         * @see {@link https://www.tumblr.com/docs/api/v2#posting|API Docs}
         * @method createPost
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} params - parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        createPost: '/v2/blog/:blogIdentifier/post',

        /**
         * Edits a given post
         *
         * @method editPost
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} params - parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        editPost: '/v2/blog/:blogIdentifier/post/edit',

        /**
         * Edits a given post
         *
         * @method reblogPost
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} params - parameters sent with the request
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        reblogPost: '/v2/blog/:blogIdentifier/post/reblog',

        /**
         * Edits a given post
         *
         * @method deletePost
         *
         * @param  {string} blogIdentifier - blog name or URL
         * @param  {Object} params - parameters sent with the request
         * @param  {Object} params.id - ID of the post to delete
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        deletePost: ['/v2/blog/:blogIdentifier/post/delete', ['id']],

        /**
         * Follows a blog as the authenticating user
         *
         * @method followBlog
         *
         * @param  {Object} params - parameters sent with the request
         * @param  {Object} params.url - URL of the blog to follow
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        followBlog: ['/v2/user/follow', ['url']],

        /**
         * Unfollows a blog as the authenticating user
         *
         * @method unfollowBlog
         *
         * @param  {Object} params - parameters sent with the request
         * @param  {Object} params.url - URL of the blog to unfollow
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        unfollowBlog: ['/v2/user/unfollow', ['url']],

        /**
         * Likes a post as the authenticating user
         *
         * @method likePost
         *
         * @param  {Object} params - parameters sent with the request
         * @param  {Object} params.id - ID of the post to like
         * @param  {Object} params.reblog_key - Reblog key for the post ID
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        likePost: ['/v2/user/like', ['id', 'reblog_key']],

        /**
         * Unlikes a post as the authenticating user
         *
         * @method unlikePost
         *
         * @param  {Object} params - parameters sent with the request
         * @param  {Object} params.id - ID of the post to unlike
         * @param  {Object} params.reblog_key - Reblog key for the post ID
         * @param  {TumblrClient~callback} [callback] - invoked when the request completes
         *
         * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
         *
         * @memberof TumblrClient
         */
        unlikePost: ['/v2/user/unlike', ['id', 'reblog_key']],
    },
};

/**
 * Turns a blog name to a full blog URL
 *
 * @param  {string} blogUrl - blog name or URL
 *
 * @return {string} full blog URL
 *
 * @private
 */
function forceFullBlogUrl(blogUrl) {
    if (blogUrl.indexOf('.') < 0) {
        blogUrl += '.tumblr.com';
    }
    return blogUrl;
}

/**
 * Creates a named function with the desired signature
 *
 * @param  {string} name - function name
 * @param  {Array} [args] - array of argument names
 * @param  {Function} fn - function that contains the logic that should run
 *
 * @return {Function} a named function that takes the desired arguments
 *
 * @private
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
 * Take a callback-based function and returns a Promise instead
 *
 * @param  {Function} requestMethod - callback-based method to promisify
 *
 * @return {Function} function that returns a Promise that resolves with the response body or
 *         rejects with the error message
 *
 * @private
 */
function promisifyRequest(requestMethod) {
    return function(apiPath, params, callback) {
        const promise = new Promise(function(resolve, reject) {
            requestMethod.call(this, apiPath, params, function(err, resp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        }.bind(this));

        if (callback) {
            promise
                .then(function(body) {
                    callback(null, body);
                })
                .catch(function(err) {
                    callback(err, null);
                });
        }

        return promise;
    };
}

/**
 * Wraps a function for use as a request callback
 *
 * @param  {TumblrClient~callback} callback - function to wrap
 *
 * @return {TumblrClient~callback} request callback
 *
 * @private
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
            const errString = body.meta ? body.meta.msg : body.error;
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
 * Make a get request
 *
 * @param  {Function} requestGet - function that performs a get request
 * @param  {Object} credentials - OAuth credentials
 * @param  {string} baseUrl - base URL for the request
 * @param  {string} apiPath - URL path for the request
 * @param  {Object} requestOptions - additional request options
 * @param  {Object} params - query parameters
 * @param  {TumblrClient~callback} callback - request callback
 *
 * @return {Request} Request object
 *
 * @private
 */
function getRequest(requestGet, credentials, baseUrl, apiPath, requestOptions, params, callback) {
    params = params || {};

    if (credentials.consumer_key) {
        params.api_key = credentials.consumer_key;
    }

    // if the apiPath already has query params, use them
    let existingQueryIndex = apiPath.indexOf('?');
    if (existingQueryIndex !== -1) {
        let existingParams = qs.parse(apiPath.substr(existingQueryIndex));

        // extend the existing params with the given params
        extend(existingParams, params);

        // reset the given apiPath to remove those query params for clean reassembly
        apiPath = apiPath.substring(0, existingQueryIndex);
    }

    return requestGet(extend({
        url: baseUrl + apiPath + '?' + qs.stringify(params),
        oauth: credentials,
        json: true,
    }, requestOptions), requestCallback(callback));
}

/**
 * Create a function to make POST requests to the Tumblr API
 *
 * @param  {Function} requestPost - function that performs a get request
 * @param  {Object} credentials - OAuth credentials
 * @param  {string} baseUrl - base URL for the request
 * @param  {string} apiPath - URL path for the request
 * @param  {Object} requestOptions - additional request options
 * @param  {Object} params - form data
 * @param  {TumblrClient~callback} callback - request callback
 *
 * @return {Request} Request object
 *
 * @private
 */
function postRequest(requestPost, credentials, baseUrl, apiPath, requestOptions, params, callback) {
    params = params || {};

    // Sign without multipart data
    const currentRequest = requestPost(extend({
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
    const dataKeys = ['data'];
    currentRequest.form(omit(params, dataKeys));
    currentRequest.oauth(credentials);

    // Clear the side effects from form(param)
    delete currentRequest.headers['content-type'];
    delete currentRequest.body;

    // if 'data' is an array, rename it with indices
    if ('data' in params && Array.isArray(params.data)) {
        for (let i = 0; i < params.data.length; ++i) {
            params['data[' + i + ']'] = params.data[i];
        }
        delete params.data;
    }

    // And then add the full body
    const form = currentRequest.form();
    for (const key in params) {
        form.append(key, params[key]);
    }

    // Add the form header back
    extend(currentRequest.headers, form.getHeaders());

    return currentRequest;
}

/**
 * Adds a request method to the client
 *
 * @param  {Object} client - add the method to this object
 * @param  {string} methodName - the name of the method
 * @param  {string} apiPath - the API route, which uses any colon-prefixed segments as arguments
 * @param  {Array} paramNames - ordered list of required request parameters used as arguments
 * @param  {String|Function} requestType - the request type or a function that makes the request
 *
 * @private
 */
function addMethod(client, methodName, apiPath, paramNames, requestType) {
    const apiPathSplit = apiPath.split('/');
    const apiPathParamsCount = apiPath.split(/\/:[^\/]+/).length - 1;

    const buildApiPath = function(args) {
        let pathParamIndex = 0;
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

    const namedParams = (apiPath.match(/\/:[^\/]+/g) || []).map(function(param) {
        return param.substr(2);
    }).concat(paramNames, 'params', 'callback');

    const methodBody = function() {
        const argsLength = arguments.length;
        const args = new Array(argsLength);
        for (let i = 0; i < argsLength; i++) {
            args[i] = arguments[i];
        }

        const requiredParamsStart = apiPathParamsCount;
        const requiredParamsEnd = requiredParamsStart + paramNames.length;
        const requiredParamArgs = args.slice(requiredParamsStart, requiredParamsEnd);

        // Callback is at the end
        const callback = isFunction(args[args.length - 1]) ? args.pop() : null;

        // Required Parmas
        const params = zipObject(paramNames, requiredParamArgs);
        extend(params, isPlainObject(args[args.length - 1]) ? args.pop() : {});

        // Path arguments are determined after required parameters
        const apiPathArgs = args.slice(0, apiPathParamsCount);

        let request = requestType;
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
 * Adds methods to the client
 *
 * @param  {TumblrClient} client - an instance of the `tumblr.js` API client
 * @param  {Object} methods - mapping of method names to endpoints. Endpoints can be a string or an
 *         array of format `[apiPathString, requireParamsArray]`
 * @param  {String|Function} requestType - the request type or a function that makes the request
 *
 * @private
 */
function addMethods(client, methods, requestType) {
    let apiPath, paramNames;
    for (const methodName in methods) {
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
 * Wraps createPost to specify `type` and validate the parameters
 *
 * @param  {string} type - post type
 * @param  {Function} [validate] - returns `true` if the parameters validate
 *
 * @return {Function} wrapped function
 *
 * @private
 */
function wrapCreatePost(type, validate) {
    return function(blogIdentifier, params, callback) {
        params = extend({type: type}, params);

        if (isArray(validate)) {
            validate = partial(function(params, requireKeys) {
                if (requireKeys.length) {
                    const keyIntersection = intersection(keys(params), requireKeys);
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
 * Creates a Tumblr API client using the given options
 *
 * @param  {Object} [options] - client options
 * @param  {Object} [options.credentials] - OAuth credentials
 * @param  {string} [options.baseUrl] - API base URL
 * @param  {Object} [options.request] - library to use for making requests
 *
 * @constructor
 */
function TumblrClient(options) {
    // Support for `TumblrClient(credentials, baseUrl, requestLibrary)`
    if (arguments.length > 1) {
        options = {
            credentials: arguments[0],
            baseUrl: arguments[1],
            request: arguments[2],
            returnPromises: false,
        };
    }

    options = options || {};

    this.version = CLIENT_VERSION;
    this.credentials = get(options, 'credentials', omit(options, 'baseUrl', 'request'));
    this.baseUrl = get(options, 'baseUrl', API_BASE_URL);

    // if someone is providing a custom baseUrl with a path, show a message
    // to help them debug if they run into errors.
    if (this.baseUrl !== API_BASE_URL && this.baseUrl !== '') {
        const baseUrl = new URL(this.baseUrl);
        if (baseUrl.pathname !== '/') {
            /* eslint-disable no-console */
            console.warn('WARNING! Path detected in your custom baseUrl!');
            console.warn('As of version 3.0.0, tumblr.js no longer includes a path in the baseUrl.');
            console.warn('If you encounter errors, please try to omit the path.');
            /* eslint-enable no-console */
        }
    }

    this.request = get(options, 'request', request);
    this.requestOptions = {
        followRedirect: false,
        headers: {
            'User-Agent': 'tumblr.js/' + CLIENT_VERSION,
        },
    };

    this.addGetMethods(API_METHODS.GET);
    this.addPostMethods(API_METHODS.POST);

    /**
     * Creates a text post on the given blog
     *
     * @see {@link https://www.tumblr.com/docs/api/v2#ptext-posts|API docs}
     *
     * @method createTextPost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {string} [params.title] - post title text
     * @param  {string} params.body - post body text
     * @param  {TumblrClient~callback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    this.createTextPost = wrapCreatePost('text', ['body']);

    /**
     * Creates a photo post on the given blog
     *
     * @see {@link https://www.tumblr.com/docs/api/v2#pphoto-posts|API docs}
     *
     * @method createPhotoPost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {string} params.source - image source URL
     * @param  {Stream|Array} params.data - an image or array of images
     * @param  {string} params.data64 - base64-encoded image data
     * @param  {string} [params.caption] - post caption text
     * @param  {TumblrClient~callback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    this.createPhotoPost = wrapCreatePost('photo', ['data', 'data64', 'source']);

    /**
     * Creates a quote post on the given blog
     *
     * @see {@link https://www.tumblr.com/docs/api/v2#pquote-posts|API docs}
     *
     * @method createQuotePost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {string} params.quote - quote text
     * @param  {string} [params.source] - quote source
     * @param  {TumblrClient~callback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    this.createQuotePost = wrapCreatePost('quote', ['quote']);

    /**
     * Creates a link post on the given blog
     *
     * @see {@link https://www.tumblr.com/docs/api/v2#plink-posts|API docs}
     *
     * @method createLinkPost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {string} [params.title] - post title text
     * @param  {string} params.url - the link URL
     * @param  {string} [params.thumbnail] - the URL of an image to use as the thumbnail
     * @param  {string} [params.excerpt] - an excerpt from the page the link points to
     * @param  {string} [params.author] - the name of the author of the page the link points to
     * @param  {string} [params.description] - post caption text
     * @param  {TumblrClient~callback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    this.createLinkPost = wrapCreatePost('link', ['url']);

    /**
     * Creates a chat post on the given blog
     *
     * @see {@link https://www.tumblr.com/docs/api/v2#pchat-posts|API docs}
     *
     * @method createChatPost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {string} [params.title] - post title text
     * @param  {string} params.conversation - chat text
     * @param  {TumblrClient~callback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    this.createChatPost = wrapCreatePost('chat', ['conversation']);

    /**
     * Creates an audio post on the given blog
     *
     * @see {@link https://www.tumblr.com/docs/api/v2#paudio-posts|API docs}
     *
     * @method createAudioPost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {string} params.external_url - image source URL
     * @param  {Stream} params.data - an audio file
     * @param  {string} [params.caption] - post caption text
     * @param  {TumblrClient~callback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    this.createAudioPost = wrapCreatePost('audio', ['data', 'data64', 'external_url']);

    /**
     * Creates a video post on the given blog
     *
     * @see {@link https://www.tumblr.com/docs/api/v2#pvideo-posts|API docs}
     *
     * @method createVideoPost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {string} params.embed - embed code or a video URL
     * @param  {Stream} params.data - a video file
     * @param  {string} [params.caption] - post caption text
     * @param  {TumblrClient~callback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    this.createVideoPost = wrapCreatePost('video', ['data', 'data64', 'embed']);

    // Enable Promise mode
    if (get(options, 'returnPromises', false)) {
        this.returnPromises();
    }
}

/**
 * Performs a GET request
 *
 * @param  {string} apiPath - URL path for the request
 * @param  {Object} params - query parameters
 * @param  {TumblrClient~callback} [callback] - request callback
 *
 * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
 */
TumblrClient.prototype.getRequest = function(apiPath, params, callback) {
    if (isFunction(params)) {
        callback = params;
        params = {};
    }
    return getRequest(this.request.get, this.credentials, this.baseUrl, apiPath, this.requestOptions, params, callback);
};

/**
 * Performs a POST request
 *
 * @param  {string} apiPath - URL path for the request
 * @param  {Object} params - form parameters
 * @param  {TumblrClient~callback} [callback] - request callback
 *
 * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
 */
TumblrClient.prototype.postRequest = function(apiPath, params, callback) {
    if (isFunction(params)) {
        callback = params;
        params = {};
    }
    return postRequest(this.request.post, this.credentials, this.baseUrl, apiPath, this.requestOptions, params, callback);
};

/**
 * Sets the client to return Promises instead of Request objects by patching the `getRequest` and
 * `postRequest` methods on the client
 */
TumblrClient.prototype.returnPromises = function() {
    this.getRequest = promisifyRequest(this.getRequest);
    this.postRequest = promisifyRequest(this.postRequest);
};

/**
 * Adds GET methods to the client
 *
 * @param  {Object} methods - mapping of method names to endpoints
 */
TumblrClient.prototype.addGetMethods = function(methods) {
    addMethods(this, methods, 'GET');
};

/**
 * Adds POST methods to the client
 *
 * @param  {Object} methods - mapping of method names to endpoints
 */
TumblrClient.prototype.addPostMethods = function(methods) {
    addMethods(this, methods, 'POST');
};

/**
 * Handles the response from a client reuest
 *
 * @callback TumblrClient~callback
 * @param {?Error} err - error message
 * @param {?Object} resp - response body
 * @param {?string} [response] - raw response
 */

/*
 * Please, enjoy our luxurious exports.
 */
module.exports = {
    /**
     * Passthrough for the {@link TumblrClient} class
     *
     * @memberof tumblr
     * @see {@link TumblrClient}
     */
    Client: TumblrClient,

    /**
     * Creates a Tumblr Client
     *
     * @param  {Object} [options] - client options
     * @param  {Object} [options.credentials] - OAuth credentials
     * @param  {string} [options.baseUrl] - API base URL
     * @param  {Object} [options.request] - library to use for making requests
     *
     * @return {TumblrClient} {@link TumblrClient} instance
     *
     * @memberof tumblr
     * @see {@link TumblrClient}
     */
    createClient: function(options) {
        // Support for `TumblrClient(credentials, baseUrl, requestLibrary)`
        if (arguments.length > 1) {
            options = {
                credentials: arguments[0],
                baseUrl: arguments[1],
                request: arguments[2],
                returnPromises: false,
            };
        }

        // Create the Tumblr Client
        const client = new TumblrClient(options);

        return client;
    },
};
