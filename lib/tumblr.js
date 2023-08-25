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
const { ReadStream } = require('node:fs');

const CLIENT_VERSION = '4.0.0-alpha.1';
const API_BASE_URL = 'https://api.tumblr.com'; // deliberately no trailing slash

class TumblrClient {
  /**
   * @typedef {import('./types').TumblrClientCallback} TumblrClientCallback
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
   * @param  {import('./types').Options} [options] - client options
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
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  getRequest(apiPath, paramsOrCallback, callback) {
    let params = paramsOrCallback;
    if (typeof params === 'function') {
      callback = /** @type {TumblrClientCallback} */ (params);
      params = undefined;
    }

    const [url, requestData] = this.#prepareRequestUrlAndRequestData(apiPath, 'GET', params);

    return this.#makeRequest(url, 'GET', requestData, callback);
  }

  /**
   * @template {TumblrClientCallback|undefined} CB
   *
   * @param {URL} url
   * @param {'GET'|'POST'|'PUT'} method request method
   * @param {null|RequestData} data
   * @param {CB} providedCallback
   *
   * @returns {CB extends undefined ? Promise<any> : undefined}
   */
  #makeRequest(url, method, data, providedCallback) {
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

    /** @type {undefined|FormData} */
    let form;

    if (data) {
      // We use multipart/form-data if we have media to upload
      // We may also send JSON data in a multipart/form-data JSON field
      if (data.has('data') || data.has('data64') || data.has('json')) {
        form = new FormData();

        // Legacy photo posts may need special handling to transform the data array of images so form-data can handle it
        let isLegacyPhotoPost = false;
        if (data.get('type') === 'photo') {
          // Check for `/v2/blog/BLOG_ID/post`
          const pathParts = (
            url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname
          ).split('/');

          isLegacyPhotoPost =
            pathParts.length === 5 &&
            pathParts[1].toLowerCase() === 'v2' &&
            pathParts[2].toLowerCase() === 'blog' &&
            pathParts[4].toLowerCase() === 'post';
        }

        for (const [key, value] of data.entries()) {
          // Legacy photo post creation has a special case to accept `data`.
          if (isLegacyPhotoPost && key === 'data') {
            for (const [index, arrValue] of (Array.isArray(value) ? value : [value]).entries()) {
              form.append(`${key}[${index}]`, arrValue);
            }
            continue;
          }

          // NPF endpoints use a special "json" field
          if (key === 'json' && typeof value === 'string') {
            form.append(key, value, { contentType: 'application/json' });
            continue;
          }

          // Some types of of values error when form-data appends them
          // or when they're piped into the request buffer.
          if (typeof value === 'boolean') {
            form.append(key, JSON.stringify(value));
            continue;
          }

          form.append(key, value);
        }

        for (const [key, value] of Object.entries(form.getHeaders())) {
          request.setHeader(key, value);
        }

        form.pipe(request);
      } else {
        // Otherwise, we'll JSON encode the body
        const requestBody = JSON.stringify(Object.fromEntries(data.entries()));
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Content-Length', requestBody.length);
        request.write(requestBody);
      }
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

    if (form) {
      form.on('end', () => {
        request.end();
      });
    } else {
      request.end();
    }
    return /** @type {CB extends undefined ? Promise<any> : undefined} */ (promise);
  }

  /**
   * Prepare request URL and data
   *
   * GET requests move all data into URL search.
   * Other requests move data to the request body.
   *
   * @param  {string} apiPath - URL path for the request
   * @param {'GET'|'POST'|'PUT'} method request method
   * @param  {Record<string,any>} [params]
   *
   * @returns {[URL, null | Map<string,any>]}
   */
  #prepareRequestUrlAndRequestData(apiPath, method, params) {
    const url = new URL(apiPath, this.baseUrl);

    const requestData = new Map(params ? Object.entries(params) : undefined);

    if (method === 'GET') {
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }
      }
    } else {
      for (const [key, value] of url.searchParams.entries()) {
        if (!requestData.has(key)) {
          requestData.set(key, value);
        }
      }
      // Clear the search params
      url.search = '';
    }

    return [url, requestData.size ? requestData : null];
  }

  /**
   * Performs a POST request
   *
   * @param  {string} apiPath - URL path for the request
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback]
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback was provided
   */
  postRequest(apiPath, paramsOrCallback, callback) {
    let params = paramsOrCallback;
    if (typeof params === 'function') {
      callback = /** @type {TumblrClientCallback} */ (params);
      params = undefined;
    }

    const [url, requestData] = this.#prepareRequestUrlAndRequestData(apiPath, 'POST', params);

    return this.#makeRequest(url, 'POST', requestData, callback);
  }

  /**
   * Performs a PUT request
   *
   * @param  {string} apiPath - URL path for the request
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback]
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback was provided
   */
  putRequest(apiPath, paramsOrCallback, callback) {
    let params = paramsOrCallback;
    if (typeof params === 'function') {
      callback = /** @type {TumblrClientCallback} */ (params);
      params = undefined;
    }

    const [url, requestData] = this.#prepareRequestUrlAndRequestData(apiPath, 'PUT', params);

    return this.#makeRequest(url, 'PUT', requestData, callback);
  }

  /**
   * @deprecated Promises are returned if no callback is provided
   */
  returnPromises() {
    // eslint-disable-next-line no-console
    console.warn('returnPromises is deprecated. Promises are returned if no callback is provided.');
  }

  /**
   * Create or reblog an NPF post
   *
   * @see {@link https://www.tumblr.com/docs/en/api/v2#posts---createreblog-a-post-neue-post-format|API Docs}
   *
   * @example
   * await client.createPost(blogName, {
   *   content: [
   *     {
   *       type: 'image',
   *       // Node's fs module, e.g. `import fs from 'node:fs';`
   *       media: fs.createReadStream(new URL('./image.jpg', import.meta.url)),
   *       alt_text: '…',
   *     },
   *   ],
   * });
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {import('./types').NpfReblogParams | import('./types').NpfPostParams } params
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  createPost(blogIdentifier, params, callback) {
    const data = this.#transformNpfParams(params);
    return this.postRequest(`/v2/blog/${blogIdentifier}/posts`, data, callback);
  }

  /**
   * Edit an NPF post
   *
   * @see {@link https://www.tumblr.com/docs/en/api/v2#postspost-id---editing-a-post-neue-post-format|API Docs}
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {string} postId - Post ID
   * @param  {import('./types').NpfReblogParams | import('./types').NpfPostParams } params
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  editPost(blogIdentifier, postId, params, callback) {
    const data = this.#transformNpfParams(params);
    return this.putRequest(`/v2/blog/${blogIdentifier}/posts/${postId}`, data, callback);
  }

  /**
   * @param  {import('./types').NpfReblogParams | import('./types').NpfPostParams } params
   */
  #transformNpfParams({ tags, content, ...params }) {
    /** @type {Map<string, ReadStream>} */
    const mediaStreams = new Map();

    const transformedContent = content.map((block, index) => {
      if (block.media && block.media instanceof ReadStream) {
        mediaStreams.set(String(index), block.media);
        return {
          ...block,
          media: { identifier: String(index) },
        };
      }
      return block;
    });

    const transformedTags = Array.isArray(tags) && { tags: tags.join(',') };

    const transformedParams = {
      ...params,
      ...transformedTags,
      content: transformedContent,
    };

    const transformed = mediaStreams.size
      ? {
          json: JSON.stringify(transformedParams),
          ...Object.fromEntries(mediaStreams.entries()),
        }
      : transformedParams;

    return transformed;
  }

  /**
   * Creates a post on the given blog.
   *
   * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
   *
   * @see {@link https://www.tumblr.com/docs/api/v2#posting|API Docs}
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {Record<string,any>} params
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  createLegacyPost(blogIdentifier, params, callback) {
    return this.postRequest(`/v2/blog/${blogIdentifier}/post`, params, callback);
  }

  /**
   * Edits a given post
   *
   * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {Record<string,any>} params
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  editLegacyPost(blogIdentifier, params, callback) {
    return this.postRequest(`/v2/blog/${blogIdentifier}/post/edit`, params, callback);
  }

  /**
   * Likes a post as the authenticating user
   *
   * @param  {string} postId - ID of post to like
   * @param  {string} reblogKey - Reblog key of post to like
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  likePost(postId, reblogKey, callback) {
    return this.postRequest('/v2/user/like', { id: postId, reblog_key: reblogKey }, callback);
  }

  /**
   * Unlikes a post as the authenticating user
   *
   * @param  {string} postId - ID of post to like
   * @param  {string} reblogKey - Reblog key of post to like
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  unlikePost(postId, reblogKey, callback) {
    return this.postRequest('/v2/user/unlike', { id: postId, reblog_key: reblogKey }, callback);
  }

  /**
   * Follows a blog as the authenticating user
   *
   * @param  {{url: string}|{email:string}} params - parameters sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  followBlog(params, callback) {
    return this.postRequest('/v2/user/follow', params, callback);
  }

  /**
   * Unfollows a blog as the authenticating user
   *
   * @param  {{url: string}} params - parameters sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  unfollowBlog(params, callback) {
    return this.postRequest('/v2/user/unfollow', params, callback);
  }

  /**
   * Deletes a given post
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {string} postId - Post ID to delete
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  deletePost(blogIdentifier, postId, callback) {
    return this.postRequest(`/v2/blog/${blogIdentifier}/post/delete`, { id: postId }, callback);
  }

  /**
   * Reblogs a given post
   *
   * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {Record<string,any>} params - parameters sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  reblogPost(blogIdentifier, params, callback) {
    return this.postRequest(`/v2/blog/${blogIdentifier}/post/reblog`, params, callback);
  }

  /**
   * Gets information about a given blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{'fields[blogs]'?: string}|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  blogInfo(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/info`, paramsOrCallback, callback);
  }

  /**
   * Gets the likes for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{limit?: number; offset?: number; before?: number; after?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  blogLikes(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/likes`, paramsOrCallback, callback);
  }

  /**
   * Gets the followers for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{limit?: number; offset?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  blogFollowers(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/followers`, paramsOrCallback, callback);
  }

  /**
   * Gets a list of posts for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{type?:PostType; limit?: number; offset?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   */
  blogPosts(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/posts`, paramsOrCallback, callback);
  }

  /**
   * Gets the queue for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{limit?: number; offset?: number; filter?: 'text'|'raw'}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  blogQueue(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/posts/queue`, paramsOrCallback, callback);
  }

  /**
   * Gets the drafts for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{before_id?: number; filter?: PostFormatFilter}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  blogDrafts(blogIdentifier, paramsOrCallback, callback) {
    return this.getRequest(`/v2/blog/${blogIdentifier}/posts/draft`, paramsOrCallback, callback);
  }

  /**
   * Gets the submissions for a blog
   *
   * @param  {string} blogIdentifier - blog name or URL
   * @param  {{offset?: number; filter?: PostFormatFilter}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
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
   * @param  {16|24|30|40|48|64|96|128|512|TumblrClientCallback} [sizeOrCallback] - optional data sent with the request
   * @param  {TumblrClientCallback} [maybeCallback] - invoked when the request completes
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  blogAvatar(blogIdentifier, sizeOrCallback, maybeCallback) {
    const size = typeof sizeOrCallback === 'function' ? undefined : sizeOrCallback;
    const callback = typeof sizeOrCallback === 'function' ? sizeOrCallback : maybeCallback;
    return this.getRequest(
      `/v2/blog/${blogIdentifier}/avatar${size ? `/${size}` : ''}`,
      undefined,
      callback,
    );
  }

  /**
   * Gets information about the authenticating user and their blogs
   *
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  userInfo(callback) {
    return this.getRequest('/v2/user/info', undefined, callback);
  }

  /**
   * Gets the dashboard posts for the authenticating user
   *
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  userDashboard(paramsOrCallback, callback) {
    return this.getRequest('/v2/user/dashboard', paramsOrCallback, callback);
  }

  /**
   * Gets the blogs the authenticating user follows
   *
   * @param  {{limit?: number; offset?: number;}|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  userFollowing(paramsOrCallback, callback) {
    return this.getRequest('/v2/user/following', paramsOrCallback, callback);
  }

  /**
   * Gets the likes for the authenticating user
   *
   * @param  {{limit?: number; offset?: number; before?: number; after?: number}|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  userLikes(paramsOrCallback, callback) {
    return this.getRequest('/v2/user/likes', paramsOrCallback, callback);
  }

  /**
   * Gets posts tagged with the specified tag
   *
   * @param  {string} tag - The tag on the posts you'd like to retrieve
   * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback] - query parameters
   * @param  {TumblrClientCallback} [callback] **Deprecated** Omit the callback and use the promise form
   *
   * @return {Promise<any>|undefined} Promise if no callback is provided
   */
  taggedPosts(tag, paramsOrCallback, callback) {
    const params = { tag };

    if (typeof paramsOrCallback === 'function') {
      callback = /** @type {TumblrClientCallback} */ (paramsOrCallback);
    } else if (typeof paramsOrCallback === 'object') {
      Object.assign(params, paramsOrCallback);
    }

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
   * @param  {import('./types').Options} [options] - client options
   *
   * @return {TumblrClient} {@link TumblrClient} instance
   *
   * @see {@link TumblrClient}
   */
  createClient: function (options) {
    return new TumblrClient(options);
  },
};
