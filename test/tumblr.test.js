require('mocha');

const fs = require('fs');
const path = require('path');

const JSON5 = require('json5');
const qs = require('query-string');
const forEach = require('lodash/forEach');
const lowerCase = require('lodash/lowerCase');

const assert = require('chai').assert;
const nock = require('nock');

const DUMMY_CREDENTIALS = {
  consumer_key: 'Mario',
  consumer_secret: 'Luigi',
  token: 'Toad',
  token_secret: 'Princess Toadstool',
};

const DUMMY_API_URL = 'https://example.com';

const URL_PARAM_REGEX = /\/:([^/]+)/g;

function createQueryString(obj) {
  const queryString = qs.stringify(obj);
  return queryString ? '?' + queryString : '';
}

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
      // @ts-expect-error Maybe undefined
      assert.equal(client.credentials.consumer_secret, credentials.consumer_secret);
      // @ts-expect-error Maybe undefined
      assert.equal(client.credentials.token, credentials.token);
      // @ts-expect-error Maybe undefined
      assert.equal(client.credentials.token_secret, credentials.token_secret);
    });

    it('passes baseUrl to the client', function () {
      const baseUrl = 'https://example.com/';
      assert.equal(tumblr.createClient({ consumer_key: 'abc123', baseUrl }).baseUrl, baseUrl);

      const baseUrlNoSlash = 'https://example.com';
      assert.equal(
        tumblr.createClient({ consumer_key: 'abc123', baseUrl: baseUrlNoSlash }).baseUrl,
        baseUrl
      );
    });

    it('throws baseUrl with path', function () {
      assert.throws(
        () => tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://example.com/v2' }),
        'baseUrl option must not include a pathname.'
      );
    });

    it('throws baseUrl with search', function () {
      assert.throws(
        () =>
          tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://example.com/?params' }),
        'baseUrl option must not include search params (query).'
      );
    });

    it('throws baseUrl with username', function () {
      assert.throws(
        () => tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://user@example.com/' }),
        'baseUrl option must not include username.'
      );
    });

    it('throws baseUrl with password', function () {
      assert.throws(
        () => tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://:pw@example.com/' }),
        'baseUrl option must not include password.'
      );
    });

    it('throws baseUrl with hash', function () {
      assert.throws(
        () => tumblr.createClient({ consumer_key: 'abc123', baseUrl: 'https://example.com/#hash' }),
        'baseUrl option must not include hash.'
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
        let client;
        const credentials = DUMMY_CREDENTIALS;

        // TumblrClient(credentials, baseUrl, requestLibrary)
        client = new TumblrClient(credentials);
        assert.equal(client.credentials.consumer_key, credentials.consumer_key);
        // @ts-expect-error May be undefined
        assert.equal(client.credentials.consumer_secret, credentials.consumer_secret);
        // @ts-expect-error May be undefined
        assert.equal(client.credentials.token, credentials.token);
        // @ts-expect-error May be undefined
        assert.equal(client.credentials.token_secret, credentials.token_secret);
      });

      it('uses the supplied baseUrl', function () {
        let client;

        client = tumblr.createClient({ ...DUMMY_CREDENTIALS, baseUrl: DUMMY_API_URL });
        assert.equal(client.baseUrl, DUMMY_API_URL.replace(/\/?$/, '/'));
      });

      describe('default options', function () {
        it('uses the default Tumblr API base URL', function () {
          const client = tumblr.createClient(DUMMY_CREDENTIALS);
          assert.equal(client.baseUrl, 'https://api.tumblr.com/');
        });
      });
    });

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
      const defaulthMethods = [
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
      ];

      forEach(defaulthMethods, function (methodName) {
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
      let scope;

      before(function () {
        scope = nock(client.baseUrl)
          [httpMethod](apiPath)
          .query(true)
          .reply(data.body.meta.status, data.body);
        scope.persist();
      });

      after(function () {
        nock.cleanAll();
      });
    }

    forEach(
      {
        get: 'getRequest',
        post: 'postRequest',
      },
      function (clientMethod, httpMethod) {
        describe('#' + clientMethod, function () {
          const fixtures = JSON5.parse(
            fs.readFileSync(path.join(__dirname, 'fixtures/' + httpMethod + '.json5')).toString()
          );

          /**
           * ### Callback
           */

          describe('returnPromises disabled', function () {
            forEach(fixtures, function (data, apiPath) {
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

                    returnValue = client[clientMethod](apiPath, params, function () {
                      callback.apply(this, arguments);
                      done();
                    });
                  });

                  if (httpMethod === 'post') {
                    // Nock seems to cause the POST request to return a Promise,
                    // making this difficult to properly test.
                    it('returns a Request');
                  } else {
                    it('returns a Request', function () {
                      assert.isTrue(returnValue instanceof client.request.Request);
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

                    client[clientMethod](apiPath, function () {
                      callback.apply(this, arguments);
                      done();
                    });
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

            forEach(
              {
                get: 'getRequest',
                post: 'postRequest',
              },

              /**
               * @param {string} clientMethod
               * @param {*} httpMethod
               */
              function (clientMethod, httpMethod) {
                describe('#' + clientMethod, function () {
                  const fixtures = JSON5.parse(
                    fs
                      .readFileSync(path.join(__dirname, 'fixtures/' + httpMethod + '.json5'))
                      .toString()
                  );

                  forEach(fixtures, function (data, apiPath) {
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

                        returnValue = client[clientMethod](apiPath, params);
                        // Invoke the callback when the Promise resolves or rejects
                        returnValue.then(
                          function (resp) {
                            callback(null, resp);
                            done();
                          },
                          function (err) {
                            console.error({ err });
                            callback(err, null);
                            done();
                          }
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
              }
            );
          });
        });
      }
    );

    /**
     * ## Request methods
     *
     * Test the methods that add methods to the client
     *
     * - TumblrClient#addGetMethods
     * - TumblrClient#addPostMethods
     */

    forEach(
      {
        get: 'addGetMethods',
        post: 'addPostMethods',
      },
      function (clientMethod, httpMethod) {
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
              testNoPathParameters: ['/no/params', []],
              testOnePathParameter: ['/one/:url/param', []],
              testTwoPathParameters: ['/one/:url/param', []],
              testRequiredParams: ['/query/params', ['id']],
              testPathAndRequiredParams: ['/query/:url/params', ['id']],
            });

          beforeEach(function () {
            client[clientMethod](addMethods);
          });

          forEach(addMethods, function ([apiPath, params], methodName) {
            describe(lowerCase(methodName).replace(/^test /i, ''), function () {
              let callbackInvoked, requestError, requestResponse;
              const callback = function (err, resp) {
                callbackInvoked = true;
                requestError = err;
                requestResponse = resp;
              };
              const queryParams = {};
              const args = [];

              forEach(apiPath.match(URL_PARAM_REGEX), function (apiPathParam) {
                args.push(apiPathParam.replace(URL_PARAM_REGEX, '$1'));
              });
              forEach(params, function (param) {
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

                nock(client.baseUrl)
                  [httpMethod](apiPath)
                  .query(true)
                  .reply(data.meta.status, data.body)
                  .persist();

                return client[methodName].apply(
                  client,
                  args.concat(function () {
                    callback.apply(this, arguments);
                    done();
                  })
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
      }
    );

    /**
     * ~fin~
     */
  });
});
