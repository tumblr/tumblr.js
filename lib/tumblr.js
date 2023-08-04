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

const CLIENT_VERSION = '4.0.0-alpha.0';
const API_BASE_URL = 'https://api.tumblr.com'; // deliberately no trailing slash

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

/**
 * Handles the response from a client reuest
 *
 * @callback TumblrClientCallback
 * @param {?Error} err - error message
 * @param {?Object} resp - response body
 * @param {?http.IncomingMessage} [response] - raw response
 * @returns {void}
 */

class TumblrClient {
  /**
   * @typedef {Map<string, ReadonlyArray<string>|string>} RequestData
   *
   * @typedef {'text'|'quote'|'link'|'answer'|'video'|'audio'|'photo'|'chat'} PostType
   *
   * @typedef {'text'|'raw'} PostFormatFilter
   *
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

    // Deprecated, let it show its warning.
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
   * @template {TumblrClientCallback|undefined} CB
   *
   * @param {URL} url
   * @param {'GET'|'POST'} method request method
   * @param {null|RequestData} data
   * @param {CB} providedCallback
   *
   * @returns {CB extends undefined ? Promise<any> : undefined}
   *
   * @private
   */
  makeRequest(url, method, data, providedCallback) {
    /** @type {TumblrClientCallback} */
    let callback;

    /** @type {Promise<any>|undefined} */
    let promise;
    if (!providedCallback) {
      /** @type {(value: any) => void} */
      let resolve;
      /** @type {(reason?: any) => void} */
      let reject;

      promise = new Promise((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;
      });

      callback = (err, resp) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(resp);
      };
    } else {
      callback = providedCallback;
    }

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

    let responseData = '';
    let callbackCalled = false;

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
    return /** @type {CB extends undefined ? Promise<any> : undefined} */ (promise);
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
   * @deprecated Promises are returned if no callback is provided
   */
  returnPromises() {
    console.warn('returnPromises is deprecated. Promises are returned if no callback is provided.');
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

  /**
   * Follows a blog as the authenticating user
   *
   * @param  {{url: string}|{email:string}} params - parameters sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  followBlog(params, callback) {
    return this.postRequest('/v2/user/follow', params, callback);
  }

  /**
   * Unfollows a blog as the authenticating user
   *
   * @param  {{url: string}} params - parameters sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  unfollowBlog(params, callback) {
    return this.postRequest('/v2/user/unfollow', params, callback);
  }

  /**
   * Deletes a given post
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{id:string}} params
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  deletePost(blogIdentifier, params, callback) {
    return this.postRequest(`/v2/blog/${blogIdentifier}/post/delete`, params, callback);
  }

  /**
   * Reblogs a given post
   *
   * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {Record<string,any>} params - parameters sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  reblogPost(blogIdentifier, params, callback) {
    return this.postRequest(`/v2/blog/${blogIdentifier}/post/reblog`, params, callback);
  }

  /**
   * Gets information about a given blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{'fields[blogs]'?: string}|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  blogInfo(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/info`, paramsOrCallback, callback);
  }

  /**
   * Gets the likes for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{limit?: number; offset?: number; before?: number; after?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  blogLikes(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/likes`, paramsOrCallback, callback);
  }

  /**
   * Gets the followers for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{limit?: number; offset?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  blogFollowers(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/followers`, paramsOrCallback, callback);
  }

  /**
   * Gets a list of posts for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{type?:PostType; limit?: number; offset?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   */
  blogPosts(blogIdentifier, paramsOrCallback, callback) {
    let type = undefined;
    if (paramsOrCallback && typeof paramsOrCallback !== 'function') {
      type = paramsOrCallback.type;
      delete paramsOrCallback.type;
    }
    return this.getRequest(`/v2/blog/${blogIdentifier}/posts/${type}`, paramsOrCallback, callback);
  }

  /**
   * Gets the queue for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{limit?: number; offset?: number; filter?: 'text'|'raw'}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  blogQueue(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/posts/queue`, paramsOrCallback, callback);
  }

  /**
   * Gets the drafts for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{before_id?: number; filter?: PostFormatFilter}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  blogDrafts(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/posts/draft`, paramsOrCallback, callback);
  }

  /**
   * Gets the submissions for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{offset?: number; filter?: PostFormatFilter}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  blogSubmissions(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(
      `/v2/blog/${blogIdentifier}/posts/submission`,
      paramsOrCallback,
      callback,
    );
  }

  /**
   * Gets the avatar URL for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{size?: 16|24|30|40|48|64|96|128|512}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [maybeCallback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  blogAvatar(blogIdentifier, paramsOrCallback, maybeCallback) {
    const size = typeof paramsOrCallback === 'function' ? undefined : paramsOrCallback?.size;
    const callback = typeof paramsOrCallback === 'function' ? paramsOrCallback : maybeCallback;
    return this.getRequest(`/v2/blog/${blogIdentifier}/avatar/${size}`, undefined, callback);
  }

  /**
   * Gets information about the authenticating user and their blogs
   *
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  userInfo(callback) {
    return this.getRequest('/v2/user/info', undefined, callback);
  }

  /**
   * Gets the dashboard posts for the authenticating user
   *
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  userDashboard(paramsOrCallback, callback) {
    return this.getRequest('/v2/user/dashboard', paramsOrCallback, callback);
  }

  /**
   * Gets the blogs the authenticating user follows
   *
   * @param  {{limit?: number; offset?: number;}|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  userFollowing(paramsOrCallback, callback) {
    return this.getRequest('/v2/user/following', paramsOrCallback, callback);
  }

  /**
   * Gets the likes for the authenticating user
   *
   * @param  {{limit?: number; offset?: number; before?: number; after?: number}|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  userLikes(paramsOrCallback, callback) {
    return this.getRequest('/v2/user/likes', paramsOrCallback, callback);
  }

  /**
   * Gets posts tagged with the specified tag
   *
   * @param  {{tag:string; [param:string]: string|number}} params - optional parameters sent with the request
   * @param  {TumblrClientCallback} [callback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
   */
  taggedPosts(params, callback) {
    return this.getRequest('/v2/tagged', params, callback);
  }
}

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
