const tumblr = require('../lib/tumblr.js');
const fs = require('fs');
const path = require('path');
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
  /** @type {const} */ ([
    ['createClient', (options) => tumblr.createClient(options)],
    ['constructor', (options) => new tumblr.Client(options)],
  ]).forEach(([name, factory]) => {
    describe(name, () => {
      it('createClient produces a Client instance', () => {
        const client = factory();
        assert.isTrue(client instanceof tumblr.Client);
      });

      it('handles no credentials', function () {
        const client = factory();
        assert.deepEqual(client.credentials, { auth: 'none' });
      });

      it('handles apiKey credentials', function () {
        const client = factory({ consumer_key: 'abc123' });
        assert.deepEqual(client.credentials, { auth: 'apiKey', apiKey: 'abc123' });
      });

      it('passes credentials to the client', function () {
        const client = factory(DUMMY_CREDENTIALS);
        assert.deepEqual(client.credentials, { auth: 'oauth1', ...DUMMY_CREDENTIALS });
      });

      it('passes baseUrl to the client', function () {
        const baseUrl = 'https://example.com/';
        assert.equal(factory({ baseUrl }).baseUrl, baseUrl);

        const baseUrlNoSlash = 'https://example.com';
        assert.equal(factory({ consumer_key: 'abc123', baseUrl: baseUrlNoSlash }).baseUrl, baseUrl);
      });

      it('throws on baseUrl with path', function () {
        assert.throws(
          () => factory({ consumer_key: 'abc123', baseUrl: 'https://example.com/v2' }),
          'baseUrl option must not include a pathname.',
        );
      });

      it('throws on baseUrl with search', function () {
        assert.throws(
          () =>
            factory({
              consumer_key: 'abc123',
              baseUrl: 'https://example.com/?params',
            }),
          'baseUrl option must not include search params (query).',
        );
      });

      it('throws on baseUrl with username', function () {
        assert.throws(
          () => factory({ consumer_key: 'abc123', baseUrl: 'https://user@example.com/' }),
          'baseUrl option must not include username.',
        );
      });

      it('throws on baseUrl with password', function () {
        assert.throws(
          () => factory({ consumer_key: 'abc123', baseUrl: 'https://:pw@example.com/' }),
          'baseUrl option must not include password.',
        );
      });

      it('throws on baseUrl with hash', function () {
        assert.throws(
          () => factory({ consumer_key: 'abc123', baseUrl: 'https://example.com/#hash' }),
          'baseUrl option must not include hash.',
        );
      });

      describe('default options', function () {
        it('uses the default Tumblr API base URL', function () {
          const client = factory();
          assert.equal(client.baseUrl, 'https://api.tumblr.com/');
        });
      });
    });
  });

  describe('Client', function () {
    const tumblr = require('../lib/tumblr.js');
    const TumblrClient = tumblr.Client;

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

    /**
     * ## Default methods
     *
     * Test the out of the box Tumblr API methods that come with the client
     */

    describe('default methods', function () {
      const client = new TumblrClient({
        ...DUMMY_CREDENTIALS,
        baseUrl: DUMMY_API_URL,
      });

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

    it('get request expected headers', async () => {
      const client = new TumblrClient({
        ...DUMMY_CREDENTIALS,
        baseUrl: DUMMY_API_URL,
        returnPromises: true,
      });
      const scope = nock(client.baseUrl, {
        reqheaders: {
          accept: 'application/json',
          'user-agent': `tumblr.js/${client.version}`,
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

      assert.isOk(await client.getRequest('/'));
      scope.done();
    });

    it('get request sends api_key when all creds are not provided', async () => {
      const client = new TumblrClient({ consumer_key: 'abc123', returnPromises: true });
      const scope = nock(client.baseUrl, {
        badheaders: ['authorization'],
      })
        .get('/')
        .query({ api_key: 'abc123' })
        .reply(200, { meta: {}, response: {} });

      assert.isOk(await client.getRequest('/'));
      scope.done();
    });

    describe('post request expected headers', () => {
      it('with body', async () => {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
          returnPromises: true,
        });
        const scope = nock(client.baseUrl, {
          reqheaders: {
            accept: 'application/json',
            'user-agent': `tumblr.js/${client.version}`,
            'content-type': /^multipart\/form-data;\s*boundary=/,
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
          .post('/', (body) => {
            return (
              /^Content-Disposition: form-data; name="foo"$/m.test(body) && /^bar$/m.test(body)
            );
          })
          .reply(200, { meta: {}, response: {} });

        assert.isOk(await client.postRequest('/', { foo: 'bar' }));
        scope.done();
      });

      it('without body', async () => {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
          returnPromises: true,
        });
        const scope = nock(client.baseUrl, {
          badheaders: ['content-length', 'content-type'],
          reqheaders: {
            accept: 'application/json',
            'user-agent': `tumblr.js/${client.version}`,
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

        assert.isOk(await client.postRequest('/'));
        scope.done();
      });
    });

    it('post request sends api_key when all creds are not provided', async () => {
      const client = new TumblrClient({ consumer_key: 'abc123' });
      client.returnPromises();
      const scope = nock(client.baseUrl, {
        badheaders: ['authorization'],
      })
        .post('/')
        .query({ api_key: 'abc123' })
        .reply(200, { meta: {}, response: {} });

      assert.isOk(await client.postRequest('/'));
      scope.done();
    });

    /** @type {const} */ ([
      ['get', 'getRequest'],
      ['post', 'postRequest'],
    ]).forEach(function ([httpMethod, clientMethod]) {
      describe('#' + clientMethod, function () {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
        });

        /**
         * @param {'get'|'post'} httpMethod
         * @param {any} data
         * @param {string} apiPath
         */
        function setupNockBeforeAfter(httpMethod, data, apiPath) {
          before(function () {
            nock(client.baseUrl)
              [httpMethod](apiPath)
              .query(true)
              .reply(data.body.meta.status, data.body)
              .persist();
          });

          after(function () {
            nock.cleanAll();
          });
        }

        const fixtures = JSON5.parse(
          fs.readFileSync(path.join(__dirname, 'fixtures/' + httpMethod + '.json5')).toString(),
        );

        describe('with callbacks', function () {
          Object.entries(fixtures).forEach(function ([apiPath, data]) {
            describe(apiPath, function () {
              setupNockBeforeAfter(httpMethod, data, apiPath);

              it('params and callback invokes callback with a successful response', function (done) {
                const returnValue = client[clientMethod](apiPath, { foo: 'bar' }, (err, resp) => {
                  assert.isNull(err);
                  assert.isDefined(resp);
                  done();
                });
                assert.isUndefined(returnValue);
              });

              it('callback only invokes callback with a successful response', function (done) {
                const returnValue = client[clientMethod](apiPath, (err, resp) => {
                  assert.isNull(err);
                  assert.isDefined(resp);
                  done();
                });
                assert.isUndefined(returnValue);
              });
            });
          });
        });

        describe('with promises', function () {
          const client = new TumblrClient({
            ...DUMMY_CREDENTIALS,
            baseUrl: DUMMY_API_URL,
            returnPromises: true,
          });

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
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
        });

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
