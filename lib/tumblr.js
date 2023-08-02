/*!
 * https://www.npmjs.com/package/tumblr.js
 *
 * <3 always,
 *     Tumblr
 */

/**
 * @namespace tumblr
 */

const FormData = require('form-data');
const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');
const oauth = require('oauth');
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

const CLIENT_VERSION = '4.0.0-alpha.0';
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    editPost: '/v2/blog/:blogIdentifier/post/edit',

    /**
     * Reblogs a given post
     *
     * @method reblogPost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    reblogPost: '/v2/blog/:blogIdentifier/post/reblog',

    /**
     * Deletes a given post
     *
     * @method deletePost
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {Object} params.id - ID of the post to delete
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    unlikePost: ['/v2/user/unlike', ['id', 'reblog_key']],
  },
};

/**
 * Creates a named function with the desired signature
 *
 * @param  {string} name - function name
 * @param  {Array<string>} args - array of argument names
 * @param  {Function} fn - function that contains the logic that should run
 *
 * @return {Function} a named function that takes the desired arguments
 *
 * @private
 */
function createFunction(name, args, fn) {
  return new Function(
    'body',
    'return function ' +
      name +
      '(' +
      args.join(', ') +
      ') { return body.apply(this, arguments); };',
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
  /** @this {TumblrClient} */
  return function (apiPath, params, callback) {
    const promise = new Promise((resolve, reject) => {
      requestMethod.call(this, apiPath, params, function (err, resp) {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
    });

    if (callback) {
      promise
        .then(function (body) {
          callback(null, body);
        })
        .catch(function (err) {
          callback(err, null);
        });
    }

    return promise;
  };
}

/**
 * Wraps createPost to specify `type` and validate the parameters
 *
 * @param  {string} type - post type
 * @param  {Function} [validate] - returns `true` if the parameters validate
 *
 * @return {Function} wrapped function
 *
 */
function wrapCreatePost(type, validate) {
  /** @this {TumblrClient} */
  return function (blogIdentifier, params, callback) {
    params = extend({ type: type }, params);

    if (isArray(validate)) {
      validate = partial(
        function (params, requireKeys) {
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
        },
        params,
        validate,
      );
    }

    if (isFunction(validate)) {
      if (!validate(params)) {
        throw new Error('Error validating parameters');
      }
    }

    return this.createPost(blogIdentifier, params, callback);
  };
}

/**
 * @typedef Options
 * @property {string}  [consumer_key]    OAuth1 credential. Required for API key auth endpoints.
 * @property {string}  [consumer_secret] OAuth1 credential. Required for OAuth endpoints.
 * @property {string}  [token]           OAuth1 credential. Required for OAuth endpoints.
 * @property {string}  [token_secret]    OAuth1 credential. Required for Oauth endpoints.
 * @property {string}  [baseUrl]         (optional) The API url if different from the default.
 * @property {boolean} [returnPromises]  (optional) Use promises instead of callbacks.
 */

class TumblrClient {
  /**
   * @typedef {{readonly auth:'none'}} NoneAuthCredentials
   * @typedef {{readonly auth:'apiKey'; readonly apiKey:string}} ApiKeyCredentials
   * @typedef {{readonly auth:'oauth1'; readonly consumer_key: string; readonly consumer_secret: string; readonly token: string; readonly token_secret: string }} OAuth1Credentials
   * @typedef {NoneAuthCredentials|ApiKeyCredentials|OAuth1Credentials} Credentials
   */

  /**
   * Creates a Tumblr API client using the given options
   *
   * @param  {Options} [options] - client options
   *
   * @constructor
   */
  constructor(options) {
    /**
     * Package version
     * @type {typeof CLIENT_VERSION}
     */
    this.version = CLIENT_VERSION;

    try {
      const url = new URL(options?.baseUrl ?? API_BASE_URL);

      if (url.pathname !== '/') {
        throw 'pathname';
      }

      // url.searchParams.size is buggy in node 16, we have to look at keys
      if ([...url.searchParams.keys()].length) {
        throw 'search';
      }

      if (url.username) {
        throw 'username';
      }

      if (url.password) {
        throw 'password';
      }

      if (url.hash) {
        throw 'hash';
      }

      /**
       * Base URL to API requests
       * @type {string}
       */
      this.baseUrl = url.toString();
    } catch (err) {
      switch (err) {
        case 'pathname':
          throw new TypeError('baseUrl option must not include a pathname.');

        case 'search':
          throw new TypeError('baseUrl option must not include search params (query).');

        case 'username':
          throw new TypeError('baseUrl option must not include username.');

        case 'password':
          throw new TypeError('baseUrl option must not include password.');

        case 'hash':
          throw new TypeError('baseUrl option must not include hash.');

        default:
          throw new TypeError('Invalid baseUrl option provided.');
      }
    }

    /** @type {Credentials} */
    this.credentials = { auth: 'none' };

    if (options) {
      // If we have any of the optional credentials, we should have all of them.
      if (
        /** @type {const} */ (['consumer_secret', 'token_secret', 'token']).some((propertyName) =>
          Object.prototype.hasOwnProperty.call(options, propertyName),
        )
      ) {
        if (!options.consumer_key || typeof options.consumer_key !== 'string') {
          throw new TypeError(
            `Provide consumer_key or all oauth credentials. Invalid consumer_key provided.`,
          );
        }
        if (!options.consumer_secret || typeof options.consumer_secret !== 'string') {
          throw new TypeError(
            `Provide consumer_key or all oauth credentials. Invalid consumer_secret provided.`,
          );
        }
        if (!options.token || typeof options.token !== 'string') {
          throw new TypeError(
            `Provide consumer_key or all oauth credentials. Invalid token provided.`,
          );
        }
        if (!options.token_secret || typeof options.token_secret !== 'string') {
          throw new TypeError(
            `Provide consumer_key or all oauth credentials. Invalid token_secret provided.`,
          );
        }

        this.credentials = {
          auth: 'oauth1',
          consumer_key: options.consumer_key,
          consumer_secret: options.consumer_secret,
          token: options.token,
          token_secret: options.token_secret,
        };
      }

      // consumer_key can be provided alone to use for api_key authentication
      else if (options.consumer_key) {
        if (typeof options.consumer_key !== 'string') {
          throw new TypeError('You must provide a consumer_key.');
        }
        this.credentials = { auth: 'apiKey', apiKey: options.consumer_key };
      }
    }

    /** @type {oauth.OAuth | null} */
    this.oauthClient =
      this.credentials.auth === 'oauth1'
        ? new oauth.OAuth(
            '',
            '',
            this.credentials.consumer_key,
            this.credentials.consumer_secret,
            '1.0',
            null,
            'HMAC-SHA1',
          )
        : null;

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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
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
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
     *
     * @memberof TumblrClient
     */
    this.createVideoPost = wrapCreatePost('video', ['data', 'data64', 'embed']);

    // Enable Promise mode
    if (options?.returnPromises) {
      this.returnPromises();
    }
  }

  /**
   * Performs a GET request
   *
   * @param  {string} apiPath - URL path for the request
   * @param  {Record<string,any>} [params] - query parameters
   * @param  {TumblrClientCallback} [callback] - request callback
   *
   * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
   */
  getRequest(apiPath, params = {}, callback) {
    const url = new URL(apiPath, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    return this.makeRequest(url, 'GET', null, callback);
  }

  /**
   * @typedef RequestData
   * @property {'multipart/form-data'|'application/json'} encoding
   * @property {Record<any,any>} data
   */

  /**
   * @param {URL} url
   * @param {'GET'|'POST'} method request method
   * @param {null|RequestData} data
   * @param {TumblrClientCallback} [callback]
   *
   * @returns {http.ClientRequest}
   *
   * @private
   */
  makeRequest(url, method, data, callback) {
    const httpModel = url.protocol === 'http' ? http : https;

    if (this.credentials.auth === 'apiKey') {
      url.searchParams.set('api_key', this.credentials.apiKey);
    }

    const request = httpModel.request(url, { method });
    request.setHeader('User-Agent', 'tumblr.js/' + CLIENT_VERSION);
    request.setHeader('Accept', 'application/json');

    if (this.oauthClient && this.credentials.auth === 'oauth1') {
      const authHeader = this.oauthClient.authHeader(
        url.toString(),
        this.credentials.token,
        this.credentials.token_secret,
        method,
      );
      request.setHeader('Authorization', authHeader);
    }

    if (data) {
      const form = new FormData();
      for (const [key, value] of Object.entries(data.data)) {
        form.append(key, value);
      }

      for (const [key, value] of Object.entries(form.getHeaders())) {
        request.setHeader(key, value);
      }
      form.pipe(request);
    }

    var responseData = '';
    var callbackCalled = false;

    request.on('response', function (response) {
      if (!callback) {
        response.resume();
        return;
      }

      response.setEncoding('utf8');
      response.on('data', function (chunk) {
        responseData += chunk;
      });
      response.on('end', function () {
        if (callbackCalled) {
          return;
        }
        callbackCalled = true;

        /** @type {{} | undefined} */
        let parsedData;
        try {
          parsedData = JSON.parse(responseData);
        } catch (err) {
          callback(
            new Error(`API error (malformed API response): ${responseData}`),
            null,
            response,
          );
          return;
        }

        const statusCode = /** @type {number} */ (response.statusCode);
        if (statusCode < 200 || statusCode > 399) {
          // @ts-expect-error unknown shape of parsedData
          const errString = parsedData?.meta?.msg ?? parsedData?.error ?? 'unknown';
          return callback(
            new Error(`API error: ${response.statusCode} ${errString}`),
            null,
            response,
          );
        }

        // @ts-expect-error Unknown shape of parsedData
        if (parsedData && parsedData.response) {
          // @ts-expect-error Unknown shape of parsedData
          return callback(null, parsedData.response, response);
        } else {
          return callback(
            new Error('API error (malformed API response): ' + parsedData),
            null,
            response,
          );
        }
      });
    });

    request.on('error', function (err) {
      if (callbackCalled) {
        return;
      }
      callbackCalled = true;
      callback?.(err, null);
    });

    request.end();

    return request;
  }

  /**
   * Performs a POST request
   *
   * @param  {string} apiPath - URL path for the request
   * @param  {Record<string,any>} [params] - form parameters
   * @param  {TumblrClientCallback} [callback] - request callback
   *
   * @return {Request|Promise} Request object, or Promise if {@link returnPromises} was used
   */
  postRequest(apiPath, params = {}, callback) {
    const url = new URL(apiPath, this.baseUrl);

    const requestData = new Map(Object.entries(params));

    // Move URL search params to send them in the request body
    for (const [key, value] of url.searchParams.entries()) {
      if (!requestData.has(key)) {
        requestData.set(key, value);
      }
    }
    // Clear the search params
    url.search = '';

    return this.makeRequest(
      url,
      'POST',
      requestData.size
        ? { encoding: 'application/json', data: Object.fromEntries(requestData.entries()) }
        : null,
      callback,
    );
  }

  /**
   * Sets the client to return Promises instead of Request objects by patching the `getRequest` and
   * `postRequest` methods on the client
   */
  returnPromises() {
    this.getRequest = promisifyRequest(this.getRequest);
    this.postRequest = promisifyRequest(this.postRequest);
  }
  /**
   * Adds GET methods to the client
   *
   * @param  {Object} methods - mapping of method names to endpoints
   */
  addGetMethods(methods) {
    this.addMethods(methods, 'GET');
  }
  /**
   * Adds POST methods to the client
   *
   * @param  {Object} methods - mapping of method names to endpoints
   */
  addPostMethods(methods) {
    this.addMethods(methods, 'POST');
  }

  /**
   * Adds methods to the client
   *
   * @this  {TumblrClient}
   * @param  {Object} methods - mapping of method names to endpoints. Endpoints can be a string or an
   *         array of format `[apiPathString, requireParamsArray]`
   * @param  {'GET'|'POST'} [requestType] - the request type or a function that makes the request
   *
   * @private
   */
  addMethods(methods, requestType) {
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
      this.addMethod(methodName, apiPath, paramNames, requestType);
    }
  }

  /**
   * Adds a request method to the client
   *
   * @param  {string} methodName - the name of the method
   * @param  {string} apiPath - the API route, which uses any colon-prefixed segments as arguments
   * @param  {ReadonlyArray<string>} paramNames - ordered list of required request parameters used as arguments
   * @param  {'GET'|'POST'} [requestType] - the request type or a function that makes the request
   *
   * @private
   */
  addMethod(methodName, apiPath, paramNames, requestType) {
    const apiPathSplit = apiPath.split('/');
    const apiPathParamsCount = apiPath.split(/\/:[^/]+/).length - 1;

    const buildApiPath = function (args) {
      let pathParamIndex = 0;
      return reduce(
        apiPathSplit,
        function (apiPath, apiPathChunk) {
          // Parse arguments in the path
          if (apiPathChunk[0] === ':') {
            apiPathChunk = args[pathParamIndex++];
          }

          if (apiPathChunk) {
            return apiPath + '/' + apiPathChunk;
          } else {
            return apiPath;
          }
        },
        '',
      );
    };

    const namedParams = (apiPath.match(/\/:[^/]+/g) || [])
      .map(function (param) {
        return param.substr(2);
      })
      .concat(paramNames, 'params', 'callback');

    const methodBody =
      /** @this {TumblrClient} */
      function () {
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

        const requestMethod = requestType?.toUpperCase() === 'POST' ? 'postRequest' : 'getRequest';

        return this[requestMethod](buildApiPath(apiPathArgs), params, callback);
      }.bind(this);

    this[methodName] = createFunction(methodName, namedParams, methodBody);
  }
}

/**
 * Handles the response from a client reuest
 *
 * @callback TumblrClientCallback
 * @param {?Error} err - error message
 * @param {?Object} resp - response body
 * @param {?http.IncomingMessage} [response] - raw response
 * @returns {void}
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
   * @param  {Options} [options] - client options
   *
   * @return {TumblrClient} {@link TumblrClient} instance
   *
   * @memberof tumblr
   * @see {@link TumblrClient}
   */
  createClient: function (options) {
    return new TumblrClient(options);
  },
};
