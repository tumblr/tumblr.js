require('mocha');

const fs = require('fs');
const path = require('path');

// @ts-expect-error
const Request = require('request').Request;
const JSON5 = require('json5');

const assert = require('chai').assert;
const nock = require('nock');

nock.disableNetConnect();

const DUMMY_CREDENTIALS = {
  consumer_key: 'Mario',
  consumer_secret: 'Luigi',
  token: 'Toad',
  token_secret: 'Princess Toadstool',
};

const DUMMY_API_URL = 'https://example.com';

const URL_PARAM_REGEX = /\/:([^/]+)/g;

describe('tumblr.js', function () {
  it('can be included without throwing', function () {
    assert.doesNotThrow(function () {
      require('../lib/tumblr.js');
    });
  });

  describe('createClient', function () {
    const tumblr = require('../lib/tumblr.js');

    it('creates a TumblrClient instance', function () {
      assert.isFunction(tumblr.createClient);
      const client = tumblr.createClient({ consumer_key: 'abc123' });
      assert.isTrue(client instanceof tumblr.Client);
      assert.equal(client.credentials.consumer_key, 'abc123');
    });

    it('passes credentials to the client', function () {
      const credentials = DUMMY_CREDENTIALS;

      const client = tumblr.createClient(credentials);
      assert.equal(client.credentials.consumer_key, credentials.consumer_key);
      assert.equal(client.credentials.consumer_secret, credentials.consumer_secret);
      assert.equal(client.credentials.token, credentials.token);
      assert.equal(client.credentials.token_secret, credentials.token_secret);
    });

    it('passes baseUrl to the client', function () {
      const baseUrl = 'https://example.com/';
      assert.equal(tumblr.createClient({ consumer_key: 'abc123', baseUrl }).baseUrl, baseUrl);

      const baseUrlNoSlash = 'https://example.com';
      assert.equal(
        tumblr.createClient({ consumer_key: 'abc123', baseUrl: baseUrlNoSlash }).baseUrl,
        baseUrl,
      );
    });

    it('throws on baseUrl with path', function () {
      assert.throws(
        () => tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://example.com/v2' }),
        'baseUrl option must not include a pathname.',
      );
    });

    it('throws on baseUrl with search', function () {
      assert.throws(
        () =>
          tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://example.com/?params' }),
        'baseUrl option must not include search params (query).',
      );
    });

    it('throws on baseUrl with username', function () {
      assert.throws(
        () => tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://user@example.com/' }),
        'baseUrl option must not include username.',
      );
    });

    it('throws on baseUrl with password', function () {
      assert.throws(
        () => tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://:pw@example.com/' }),
        'baseUrl option must not include password.',
      );
    });

    it('throws on baseUrl with hash', function () {
      assert.throws(
        () => tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://example.com/#hash' }),
        'baseUrl option must not include hash.',
      );
    });
  });

  describe('Client', function () {
    const tumblr = require('../lib/tumblr.js');
    const TumblrClient = tumblr.Client;

    describe('constructor', function () {
      it('creates a TumblrClient instance', function () {
        const client = new TumblrClient(DUMMY_CREDENTIALS);
        assert.isTrue(client instanceof TumblrClient);
      });

      it('uses the supplied credentials', function () {
        const credentials = DUMMY_CREDENTIALS;

        const client = new TumblrClient(credentials);
        assert.equal(client.credentials.consumer_key, credentials.consumer_key);
        assert.equal(client.credentials.consumer_secret, credentials.consumer_secret);
        assert.equal(client.credentials.token, credentials.token);
        assert.equal(client.credentials.token_secret, credentials.token_secret);
      });

      it('uses the supplied baseUrl', function () {
        const client = tumblr.createClient({ ...DUMMY_CREDENTIALS, baseUrl: DUMMY_API_URL });
        assert.equal(client.baseUrl, DUMMY_API_URL.replace(/\/?$/, '/'));
      });

      describe('default options', function () {
        it('uses the default Tumblr API base URL', function () {
          const client = tumblr.createClient(DUMMY_CREDENTIALS);
          assert.equal(client.baseUrl, 'https://api.tumblr.com/');
        });

        it('does not return Promises', function () {
          const client = tumblr.createClient(DUMMY_CREDENTIALS);
          assert.equal(client.getRequest, tumblr.Client.prototype.getRequest);
          assert.equal(client.postRequest, tumblr.Client.prototype.postRequest);
        });
      });
    });

    describe('#returnPromises', function () {
      it('modifies getRequest and postRequest', function () {
        const client = new TumblrClient(DUMMY_CREDENTIALS);
        const getRequestBefore = client.getRequest;
        const postRequestBefore = client.postRequest;
        client.returnPromises();
        assert.notEqual(getRequestBefore, client.getRequest);
        assert.notEqual(postRequestBefore, client.postRequest);
      });
    });

    /** @type {import('../lib/tumblr.js').Client} */
    let client;
    beforeEach(function () {
      client = new TumblrClient({
        ...DUMMY_CREDENTIALS,
        baseUrl: DUMMY_API_URL,
      });
    });

    /**
     * ## Default methods
     *
     * Test the out of the box Tumblr API methods that come with the client
     */

    describe('default methods', function () {
      /** @type {const} */ ([
        'blogInfo',
        'blogAvatar',
        'blogLikes',
        'blogFollowers',
        'blogPosts',
        'blogQueue',
        'blogDrafts',
        'blogSubmissions',
        'userInfo',
        'userDashboard',
        'userFollowing',
        'userLikes',
        'taggedPosts',
        'createPost',
        'editPost',
        'reblogPost',
        'deletePost',
        'followBlog',
        'unfollowBlog',
        'likePost',
        'unlikePost',
        'createTextPost',
        'createPhotoPost',
        'createQuotePost',
        'createLinkPost',
        'createChatPost',
        'createAudioPost',
        'createVideoPost',
      ]).forEach(function (methodName) {
        it('has #' + methodName, function () {
          assert.isFunction(client[methodName]);
        });
      });
    });

    /**
     * ## Request methods
     *
     * Test the methods that do generic requests:
     *
     * - TumblrClient#getRequest
     * - TumblrClient#postRequest
     */

    /**
     * @param {'get'|'post'} httpMethod
     * @param {any} data
     * @param {string} apiPath
     */
    function setupNockBeforeAfter(httpMethod, data, apiPath) {
      before(function () {
        nock(client.baseUrl)[httpMethod](apiPath).reply(data.body.meta.status, data.body).persist();
      });

      after(function () {
        nock.cleanAll();
      });
    }

    it('get request expected headers', async () => {
      client.returnPromises();
      const scope = nock(client.baseUrl, {
        reqheaders: {
          'user-agent': `tumblr.js/${client.version}`,
          accept: 'application/json',
          authorization: (value) => {
            return [
              value.startsWith('OAuth '),
              value.includes('oauth_signature_method="HMAC-SHA1"'),
              value.includes('oauth_version="1.0"'),
              value.includes(`oauth_consumer_key="${DUMMY_CREDENTIALS.consumer_key}"`),
              value.includes(`oauth_token="${DUMMY_CREDENTIALS.token}"`),
              /oauth_nonce="[^"]+"/.test(value),
              /oauth_timestamp="[^"]+"/.test(value),
              /oauth_signature="[^"]+"/.test(value),
            ].every((passes) => passes);
          },
        },
      })
        .get('/')
        .reply(200, { meta: {}, response: {} });

      // @ts-expect-error Promise request with no params, this is OK.
      assert.isOk(await client.getRequest('/'));
      scope.done();
    });

    it('get request sends api_key when all creds are not provided', async () => {
      const client = new TumblrClient({ consumer_key: 'abc123' });
      client.returnPromises();
      const scope = nock(client.baseUrl, {
        badheaders: ['authorization'],
      })
        .get('/')
        .query({ api_key: 'abc123' })
        .reply(200, { meta: {}, response: {} });

      // @ts-expect-error Promise request with no params, this is OK.
      assert.isOk(await client.getRequest('/'));
      scope.done();
    });

    it('post request expected headers', async () => {
      client.returnPromises();
      const scope = nock(client.baseUrl, {
        reqheaders: {
          'user-agent': `tumblr.js/${client.version}`,
          'content-type': /^multipart\/form-data; ?boundary=-*\d+/,
          'content-length': /^\d+/,
          authorization: (value) => {
            return [
              value.startsWith('OAuth '),
              value.includes('oauth_signature_method="HMAC-SHA1"'),
              value.includes('oauth_version="1.0"'),
              value.includes(`oauth_consumer_key="${DUMMY_CREDENTIALS.consumer_key}"`),
              value.includes(`oauth_token="${DUMMY_CREDENTIALS.token}"`),
              /oauth_nonce="[^"]+"/.test(value),
              /oauth_timestamp="[^"]+"/.test(value),
              /oauth_signature="[^"]+"/.test(value),
            ].every((passes) => passes);
          },
        },
      })
        .post('/')
        .reply(200, { meta: {}, response: {} });

      // @ts-expect-error Promise request with no params, this is OK.
      assert.isOk(await client.postRequest('/'));
      scope.done();
    });

    it('get request sends api_key when all creds are not provided', async () => {
      const client = new TumblrClient({ consumer_key: 'abc123' });
      client.returnPromises();
      const scope = nock(client.baseUrl, {
        badheaders: ['authorization'],
      })
        .post('/')
        .query({ api_key: 'abc123' })
        .reply(200, { meta: {}, response: {} });

      // @ts-expect-error Promise request with no params, this is OK.
      assert.isOk(await client.postRequest('/'));
      scope.done();
    });

    /** @type {const} */ ([
      ['get', 'getRequest'],
      ['post', 'postRequest'],
    ]).forEach(function ([httpMethod, clientMethod]) {
      describe('#' + clientMethod, function () {
        const fixtures = JSON5.parse(
          fs.readFileSync(path.join(__dirname, 'fixtures/' + httpMethod + '.json5')).toString(),
        );

        /**
         * ### Callback
         */

        describe('returnPromises disabled', function () {
          Object.entries(fixtures).forEach(function ([apiPath, data]) {
            describe(apiPath, function () {
              let callbackInvoked, requestError, requestResponse, returnValue;
              const params = {};

              const callback = function (err, resp) {
                callbackInvoked = true;
                requestError = err;
                requestResponse = resp;
              };

              setupNockBeforeAfter(httpMethod, data, apiPath);

              describe('params and callback', function () {
                before(function (done) {
                  callbackInvoked = false;
                  requestError = false;
                  requestResponse = false;

                  returnValue = client[clientMethod](
                    apiPath,
                    params,
                    /** @param {any} args */
                    function (...args) {
                      callback.call(client, ...args);
                      done();
                    },
                  );
                });

                if (httpMethod === 'post') {
                  // Nock seems to cause the POST request to return a Promise,
                  // making this difficult to properly test.
                  it('returns a Request');
                } else {
                  it('returns a Request', function () {
                    assert.isTrue(returnValue instanceof Request);
                  });
                }

                it('invokes the callback', function () {
                  assert.isTrue(callbackInvoked);
                });

                it('gets a successful response', function () {
                  assert.isNull(requestError, 'err is falsy');
                  assert.isDefined(requestResponse);
                });
              });

              describe('callback only', function () {
                before(function (done) {
                  callbackInvoked = false;
                  requestError = false;
                  requestResponse = false;

                  // @ts-expect-error This is a bad function signature - optionals in middle @TODO
                  client[clientMethod](
                    apiPath,
                    /** @param {any} args */
                    function (...args) {
                      callback.call(client, ...args);
                      done();
                    },
                  );
                });

                it('invokes the callback', function () {
                  assert.isTrue(callbackInvoked);
                });

                it('gets a successful response', function () {
                  assert.isNull(requestError, 'err is falsy');
                  assert.isDefined(requestResponse);
                });
              });
            });
          });
        });

        /**
         * ### Promises
         */

        describe('returnPromises enabled', function () {
          beforeEach(function () {
            client.returnPromises();
          });

          /** @type {const} */ ([
            ['get', 'getRequest'],
            ['post', 'postRequest'],
          ]).forEach(function ([httpMethod, clientMethod]) {
            describe('#' + clientMethod, function () {
              Object.entries(fixtures).forEach(function ([apiPath, data]) {
                describe(apiPath, function () {
                  let callbackInvoked, requestError, requestResponse, returnValue;
                  const params = {};
                  const callback = function (err, resp) {
                    callbackInvoked = true;
                    requestError = err;
                    requestResponse = resp;
                  };

                  setupNockBeforeAfter(httpMethod, data, apiPath);

                  beforeEach(function (done) {
                    callbackInvoked = false;
                    requestError = false;
                    requestResponse = false;

                    // @ts-expect-error It's promises, no callback
                    returnValue = client[clientMethod](apiPath, params);
                    // Invoke the callback when the Promise resolves or rejects
                    returnValue.then(
                      function (resp) {
                        callback(null, resp);
                        done();
                      },
                      function (err) {
                        callback(err, null);
                        done();
                      },
                    );
                  });

                  it('returns a Promise', function () {
                    assert.isTrue(returnValue instanceof Promise);
                  });

                  it('invokes the callback', function () {
                    assert.isTrue(callbackInvoked);
                  });

                  it('gets a successful response', function () {
                    assert.isNull(requestError, 'err is falsy');
                    assert.isDefined(requestResponse);
                  });
                });
              });
            });
          });
        });
      });
    });

    /**
     * ## Request methods
     *
     * Test the methods that add methods to the client
     *
     * - TumblrClient#addGetMethods
     * - TumblrClient#addPostMethods
     */

    /** @type {const} */ ([
      ['get', 'addGetMethods'],
      ['post', 'addPostMethods'],
    ]).forEach(function ([httpMethod, clientMethod]) {
      describe('#' + clientMethod, function () {
        const data = {
          meta: {
            status: 200,
            msg: 'k',
          },
          body: {
            response: {
              ayy: 'lmao',
            },
          },
        };

        const addMethods =
          /** @type {Record<string, readonly [string, ReadonlyArray<string>]>} */ ({
            noPathParameters: ['/no/params', []],
            onePathParameter: ['/one/:url/param', []],
            twoPathParameters: ['/one/:url/param', []],
            requiredParams: ['/query/params', ['id']],
            pathAndRequiredParams: ['/query/:url/params', ['id']],
          });

        beforeEach(function () {
          client[clientMethod](addMethods);
        });

        Object.entries(addMethods).forEach(function ([methodName, [apiPath, params]]) {
          describe(methodName, function () {
            let callbackInvoked, requestError, requestResponse;
            const callback = function (err, resp) {
              callbackInvoked = true;
              requestError = err;
              requestResponse = resp;
            };
            const queryParams = {};
            const args = [];

            apiPath.match(URL_PARAM_REGEX)?.forEach(function (apiPathParam) {
              args.push(apiPathParam.replace(URL_PARAM_REGEX, '$1'));
            });
            params.forEach(function (param) {
              queryParams[param] = param + ' value';
              args.push(queryParams[param]);
            });
            apiPath = apiPath.replace(URL_PARAM_REGEX, '/$1');

            beforeEach(function (done) {
              callbackInvoked = false;
              requestError = false;
              requestResponse = false;

              if (client.credentials.consumer_key) {
                queryParams.api_key = client.credentials.consumer_key;
              }

              const scope = nock(client.baseUrl)[httpMethod](apiPath);
              if (params.length) {
                scope.query(true);
              }

              scope.reply(data.meta.status, data.body).persist();

              return client[methodName].apply(
                client,
                args.concat(function (...args) {
                  callback.call(client, ...args);
                  done();
                }),
              );
            });

            afterEach(function () {
              nock.cleanAll();
            });

            it('method is a function', function () {
              assert.isFunction(client[methodName]);
            });

            it('invokes the callback', function () {
              assert.isTrue(callbackInvoked);
            });

            it('gets a successful response', function () {
              assert.isNull(requestError, 'err is falsy');
              assert.isDefined(requestResponse);
            });
          });
        });
      });
    });

    /**
     * ~fin~
     */
  });
});
