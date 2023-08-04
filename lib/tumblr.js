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
const extend = require('lodash/extend');
const reduce = require('lodash/reduce');
const zipObject = require('lodash/zipObject');
const isString = require('lodash/isString');
const isFunction = require('lodash/isFunction');
const isPlainObject = require('lodash/isPlainObject');

const CLIENT_VERSION = '4.0.0-alpha.0';
const API_BASE_URL = 'https://api.tumblr.com'; // deliberately no trailing slash

const API_METHODS = {
  GET: {
    /**
     * Gets information about a given blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} [params] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogInfo: '/v2/blog/:blogIdentifier/info',

    /**
     * Gets the avatar URL for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {number} [size] - avatar size, in pixels
     * @param  {Object} [params] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogAvatar: '/v2/blog/:blogIdentifier/avatar/:size',

    /**
     * Gets the likes for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} [params] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogLikes: '/v2/blog/:blogIdentifier/likes',

    /**
     * Gets the followers for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} [params] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogFollowers: '/v2/blog/:blogIdentifier/followers',

    /**
     * Gets a list of posts for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {string} [type] - filters returned posts to the specified type
     * @param  {Object} [params] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     */
    blogPosts: '/v2/blog/:blogIdentifier/posts/:type',

    /**
     * Gets the queue for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} [params] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogQueue: '/v2/blog/:blogIdentifier/posts/queue',

    /**
     * Gets the drafts for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} [params] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogDrafts: '/v2/blog/:blogIdentifier/posts/draft',

    /**
     * Gets the submissions for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} [params] - optional parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogSubmissions: '/v2/blog/:blogIdentifier/posts/submission',

    /**
     * Gets information about the authenticating user and their blogs
     *
     * @param  {Object} [params] - optional parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    userInfo: '/v2/user/info',

    /**
     * Gets the dashboard posts for the authenticating user
     *
     * @param  {Object} [params] - optional parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    userDashboard: '/v2/user/dashboard',

    /**
     * Gets the blogs the authenticating user follows
     *
     * @param  {Object} [params] - optional parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    userFollowing: '/v2/user/following',

    /**
     * Gets the likes for the authenticating user
     *
     * @param  {Object} [params] - optional parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    userLikes: '/v2/user/likes',

    /**
     * Gets posts tagged with the specified tag
     *
     * @param  {string} [tag] - tag to search for
     * @param  {Object} [params] - optional parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    taggedPosts: ['/v2/tagged', ['tag']],
  },

  POST: {
    /**
     * Reblogs a given post
     *
     * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    reblogPost: '/v2/blog/:blogIdentifier/post/reblog',

    /**
     * Deletes a given post
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Object} params - parameters sent with the request
     * @param  {Object} params.id - ID of the post to delete
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    deletePost: ['/v2/blog/:blogIdentifier/post/delete', ['id']],

    /**
     * Follows a blog as the authenticating user
     *
     * @param  {Object} params - parameters sent with the request
     * @param  {Object} params.url - URL of the blog to follow
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    followBlog: ['/v2/user/follow', ['url']],

    /**
     * Unfollows a blog as the authenticating user
     *
     * @param  {Object} params - parameters sent with the request
     * @param  {Object} params.url - URL of the blog to unfollow
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    unfollowBlog: ['/v2/user/unfollow', ['url']],
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
   * @typedef {Map<string, ReadonlyArray<string>|string>} RequestData
   *
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

    // Enable Promise mode
    if (options?.returnPromises) {
      this.returnPromises();
    }
  }

  /**
   * Performs a GET request
   *
   * @param  {string} apiPath - URL path for the request
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] - request callback
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  getRequest(apiPath, paramsOrCallback, callback) {
    let params = paramsOrCallback;
    if (typeof params === 'function') {
      callback = /** @type {TumblrClientCallback} */ (params);
      params = undefined;
    }

    const url = new URL(apiPath, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    return this.makeRequest(url, 'GET', null, callback);
  }

  /**
   * @param {URL} url
   * @param {'GET'|'POST'} method request method
   * @param {null|RequestData} data
   * @param {TumblrClientCallback} [callback]
   *
   * @returns {Promise<any>|undefined}
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

      const isLegacyPhotoPost = url.pathname.endsWith('/post') && data.get('type') === 'photo';

      for (const [key, value] of data.entries()) {
        // Legacy photo post creation has a special case to accept `data`.
        if (isLegacyPhotoPost && key === 'data') {
          (Array.isArray(value) ? value : [value]).forEach((arrValue, index) => {
            form.append(`${key}[${index}]`, arrValue);
          });
          continue;
        }
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
    return;
  }

  /**
   * Performs a POST request
   *
   * @param  {string} apiPath - URL path for the request
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback]
   * @param  {TumblrClientCallback} [callback]
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  postRequest(apiPath, paramsOrCallback, callback) {
    let params = paramsOrCallback;
    if (typeof params === 'function') {
      callback = /** @type {TumblrClientCallback} */ (params);
      params = undefined;
    }

    const url = new URL(apiPath, this.baseUrl);

    const requestData = new Map(params ? Object.entries(params) : undefined);

    // Move URL search params to send them in the request body
    for (const [key, value] of url.searchParams.entries()) {
      if (!requestData.has(key)) {
        requestData.set(key, value);
      }
    }
    // Clear the search params
    url.search = '';

    return this.makeRequest(url, 'POST', requestData.size ? requestData : null, callback);
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

  /**
   * Creates a post on the given blog.
   *
   * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
   *
   * @see {@link https://www.tumblr.com/docs/api/v2#posting|API Docs}
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback]
   * @param  {TumblrClientCallback} [callback]
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  createPost(blogIdentifier, paramsOrCallback, callback) {
    return this.postRequest(`/v2/blog/${blogIdentifier}/post`, paramsOrCallback, callback);
  }

  /**
   * Edits a given post
   *
   * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback]
   * @param  {TumblrClientCallback} [callback]
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  editPost(blogIdentifier, paramsOrCallback, callback) {
    return this.postRequest(`/v2/blog/${blogIdentifier}/post/edit`, paramsOrCallback, callback);
  }

  /**
   * Likes a post as the authenticating user
   *
   * @param  {{ id: string; reblog_key: string }} params - parameters sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  likePost(params, callback) {
    return this.postRequest('/v2/user/like', params, callback);
  }

  /**
   * Unlikes a post as the authenticating user
   *
   * @param  {{ id: string; reblog_key: string }} params - parameters sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  unlikePost(params, callback) {
    return this.postRequest('/v2/user/unlike', params, callback);
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
   * @see {@link TumblrClient}
   * @type {typeof TumblrClient}
   */
  Client: TumblrClient,

  /**
   * Creates a Tumblr Client
   *
   * @param  {Options} [options] - client options
   *
   * @return {TumblrClient} {@link TumblrClient} instance
   *
   * @see {@link TumblrClient}
   */
  createClient: function (options) {
    return new TumblrClient(options);
  },
};
