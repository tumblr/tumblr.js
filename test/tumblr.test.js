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
const DUMMY_API_URL = 'https://t.umblr.com';

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
      const client = tumblr.createClient();
      assert.isTrue(client instanceof tumblr.Client);
    });

    it('passes credentials to the client', function () {
      const credentials = DUMMY_CREDENTIALS;

      // tumblr.createClient(credentials, baseUrl, requestLibrary)
      let client = tumblr.createClient(credentials);
      assert.equal(client.credentials.consumer_key, credentials.consumer_key);
      assert.equal(client.credentials.consumer_secret, credentials.consumer_secret);
      assert.equal(client.credentials.token, credentials.token);
      assert.equal(client.credentials.token_secret, credentials.token_secret);

      // tumblr.createClient(options)
      client = tumblr.createClient({ credentials: credentials });
      assert.equal(client.credentials.consumer_key, credentials.consumer_key);
      assert.equal(client.credentials.consumer_secret, credentials.consumer_secret);
      assert.equal(client.credentials.token, credentials.token);
      assert.equal(client.credentials.token_secret, credentials.token_secret);
    });

    it('passes baseUrl to the client', function () {
      const baseUrl = 'https://t.umblr.com/v2';

      // tumblr.createClient(credentials, baseUrl, requestLibrary)
      let client = tumblr.createClient({}, baseUrl);
      assert.equal(client.baseUrl, baseUrl);

      // tumblr.createClient(options)
      client = tumblr.createClient({ baseUrl: baseUrl });
      assert.equal(client.baseUrl, baseUrl);
    });

    it('passes requestLibrary to the client', function () {
      const requestLibrary = {
        get: function (options, callback) {
          return callback(options);
        },
        post: function (options, callback) {
          return callback(options);
        },
      };

      // TumblrClient(options)
      const client = tumblr.createClient({ request: requestLibrary });
      assert.equal(client.request, requestLibrary);
    });

    it('passes returnPromises to the client', function () {
      // tumblr.createClient(options)
      const client = tumblr.createClient({ returnPromises: true });
      assert.notEqual(client.getRequest, tumblr.Client.prototype.getRequest);
      assert.notEqual(client.postRequest, tumblr.Client.prototype.postRequest);
    });
  });

  describe('Client', function () {
    const tumblr = require('../lib/tumblr.js');
    const TumblrClient = tumblr.Client;

    describe('constructor', function () {
      it('creates a TumblrClient instance', function () {
        const client = new TumblrClient();
        assert.isTrue(client instanceof TumblrClient);
      });

      it('uses the supplied credentials', function () {
        let client;
        const credentials = DUMMY_CREDENTIALS;

        // TumblrClient(credentials, baseUrl, requestLibrary)
        client = new TumblrClient(credentials);
        assert.equal(client.credentials.consumer_key, credentials.consumer_key);
        assert.equal(client.credentials.consumer_secret, credentials.consumer_secret);
        assert.equal(client.credentials.token, credentials.token);
        assert.equal(client.credentials.token_secret, credentials.token_secret);

        // TumblrClient(options)
        client = new TumblrClient({ credentials: credentials });
        assert.equal(client.credentials.consumer_key, credentials.consumer_key);
        assert.equal(client.credentials.consumer_secret, credentials.consumer_secret);
        assert.equal(client.credentials.token, credentials.token);
        assert.equal(client.credentials.token_secret, credentials.token_secret);
      });

      it('uses the supplied baseUrl', function () {
        let client;
        const baseUrl = DUMMY_API_URL;

        // TumblrClient(credentials, baseUrl, requestLibrary)
        client = tumblr.createClient({}, baseUrl);
        assert.equal(client.baseUrl, baseUrl);

        // TumblrClient(options)
        client = tumblr.createClient({ baseUrl: baseUrl });
        assert.equal(client.baseUrl, baseUrl);
      });

      it('uses the supplied requestLibrary', function () {
        let client;
        const requestLibrary = {
          get: function (options, callback) {
            return callback(options);
          },
          post: function (options, callback) {
            return callback(options);
          },
        };

        // TumblrClient(credentials, baseUrl, requestLibrary)
        client = new TumblrClient({}, '', requestLibrary);
        assert.equal(client.request, requestLibrary);

        // TumblrClient(options)
        client = new TumblrClient({ request: requestLibrary });
        assert.equal(client.request, requestLibrary);
      });

      it('uses the supplied returnPromises value', function () {
        // tumblr.createClient(options)
        let client = tumblr.createClient({ returnPromises: false });
        assert.equal(client.getRequest, tumblr.Client.prototype.getRequest);
        assert.equal(client.postRequest, tumblr.Client.prototype.postRequest);

        // tumblr.createClient(options)
        client = tumblr.createClient({ returnPromises: true });
        assert.notEqual(client.getRequest, tumblr.Client.prototype.getRequest);
        assert.notEqual(client.postRequest, tumblr.Client.prototype.postRequest);
      });

      describe('default options', function () {
        it('uses the default Tumblr API base URL', function () {
          const client = tumblr.createClient();
          assert.equal(client.baseUrl, 'https://api.tumblr.com');
        });

        it('uses default request library', function () {
          const client = tumblr.createClient();
          assert.equal(client.request, require('request'));
        });

        it('does not return Promises', function () {
          const client = tumblr.createClient();
          assert.equal(client.getRequest, tumblr.Client.prototype.getRequest);
          assert.equal(client.postRequest, tumblr.Client.prototype.postRequest);
        });
      });
    });

    describe('#returnPromises', function () {
      it('modifies getRequest and postRequest', function () {
        const client = new TumblrClient();
        const getRequestBefore = client.getRequest;
        const postRequestBefore = client.postRequest;
        client.returnPromises();
        assert.notEqual(getRequestBefore, client.getRequest);
        assert.notEqual(postRequestBefore, client.postRequest);
      });
    });

    let client;
    beforeEach(function () {
      client = new TumblrClient({
        credentials: DUMMY_CREDENTIALS,
        baseUrl: DUMMY_API_URL,
        returnPromises: false,
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

    function setupNockBeforeAfter(httpMethod, data, apiPath) {
      let queryParams, testApiPath;

      before(function () {
        queryParams = {};

        if (client.credentials.consumer_key) {
          queryParams.api_key = client.credentials.consumer_key;
        }

        testApiPath = apiPath;
        if (httpMethod === 'get') {
          testApiPath += createQueryString(queryParams);
        }

        nock(client.baseUrl)
          .persist()
          [httpMethod](testApiPath)
          .reply(data.body.meta.status, data.body);
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
            fs.readFileSync(path.join(__dirname, 'fixtures/' + httpMethod + '.json5')).toString(),
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
                    assert.isNotOk(requestError, 'err is falsy');
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
                    assert.isNotOk(requestError, 'err is falsy');
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
              function (clientMethod, httpMethod) {
                describe('#' + clientMethod, function () {
                  const fixtures = JSON5.parse(
                    fs
                      .readFileSync(path.join(__dirname, 'fixtures/' + httpMethod + '.json5'))
                      .toString(),
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
                        returnValue
                          .then(function (resp) {
                            callback(null, resp);
                            done();
                          })
                          .catch(function (err) {
                            callback(err, null);
                            done();
                          });
                      });

                      it('returns a Promise', function () {
                        assert.isTrue(returnValue instanceof Promise);
                      });

                      it('invokes the callback', function () {
                        assert.isTrue(callbackInvoked);
                      });

                      it('gets a successful response', function () {
                        assert.isNotOk(requestError, 'err is falsy');
                        assert.isDefined(requestResponse);
                      });
                    });
                  });
                });
              },
            );
          });
        });
      },
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

          const addMethods = {
            testNoPathParameters: '/no/params',
            testOnePathParameter: '/one/:url/param',
            testTwoPathParameters: '/one/:url/param',
            testRequiredParams: ['/quert/params', ['id']],
            testPathAndRequiredParams: ['/query/:url/params', ['id']],
          };

          beforeEach(function () {
            client[clientMethod](addMethods);
          });

          forEach(addMethods, function (apiPath, methodName) {
            describe(lowerCase(methodName).replace(/^test /i, ''), function () {
              let callbackInvoked, requestError, requestResponse;
              const params = {};
              const callback = function (err, resp) {
                callbackInvoked = true;
                requestError = err;
                requestResponse = resp;
              };
              const queryParams = {};
              const args = [];

              if (typeof apiPath === 'string') {
                forEach(apiPath.match(URL_PARAM_REGEX), function (apiPathParam) {
                  args.push(apiPathParam.replace(URL_PARAM_REGEX, '$1'));
                });
                apiPath = apiPath.replace(URL_PARAM_REGEX, '/$1');
              } else {
                forEach(apiPath[0].match(URL_PARAM_REGEX), function (apiPathParam) {
                  args.push(apiPathParam.replace(URL_PARAM_REGEX, '$1'));
                });
                forEach(apiPath[1], function (param) {
                  queryParams[param] = param + ' value';
                  args.push(queryParams[param]);
                });
                apiPath = apiPath[0].replace(URL_PARAM_REGEX, '/$1');
              }

              args.push(params);

              beforeEach(function (done) {
                callbackInvoked = false;
                requestError = false;
                requestResponse = false;

                if (client.credentials.consumer_key) {
                  queryParams.api_key = client.credentials.consumer_key;
                }

                let testApiPath = apiPath;
                if (httpMethod === 'get') {
                  testApiPath += createQueryString(queryParams);
                }

                nock(client.baseUrl)
                  .persist()
                  [httpMethod](testApiPath)
                  .reply(data.meta.status, data.body);

                return client[methodName].apply(
                  client,
                  args.concat(function () {
                    callback.apply(this, arguments);
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
                assert.isNotOk(requestError, 'err is falsy');
                assert.isDefined(requestResponse);
              });
            });
          });
        });
      },
    );

    /**
     * ~fin~
     */
  });
});
