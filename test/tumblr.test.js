const tumblr = require('../lib/tumblr.js');
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

describe('tumblr.js', function () {
  it('has matching version with the package version', () => {
    const version = require('../package.json').version;
    const client = new tumblr.Client();
    assert.strictEqual(version, client.version);
    assert.strictEqual(version, tumblr.Client.version);
  });

  /** @type {ReadonlyArray<[string, typeof tumblr.createClient]>} */ ([
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
        'blogAvatar',
        'blogDrafts',
        'blogFollowers',
        'blogInfo',
        'blogLikes',
        'blogPosts',
        'blogQueue',
        'blogSubmissions',
        'createLegacyPost',
        'createPost',
        'deletePost',
        'editLegacyPost',
        'editPost',
        'followBlog',
        'likePost',
        'reblogPost',
        'taggedPosts',
        'unfollowBlog',
        'unlikePost',
        'userDashboard',
        'userFollowing',
        'userInfo',
        'userLikes',
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

    describe('get request applies expected query params', () => {
      it('using url search params', async () => {
        const client = new TumblrClient({ baseUrl: DUMMY_API_URL });
        const scope = nock(client.baseUrl)
          .get('/')
          .query(new URLSearchParams([['search', 'string']]))
          .reply(200, { meta: {}, response: {} });

        assert.isOk(await client.getRequest('/?search=string'));
        scope.done();
      });

      it('applies string params', async () => {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
        });
        const scope = nock(client.baseUrl)
          .get('/')
          .query({ tag: 'foo' })
          .reply(200, { meta: {}, response: {} });

        assert.isOk(await client.getRequest('/', { tag: 'foo' }));
        scope.done();
      });

      it('combines search string and params', async () => {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
        });
        const scope = nock(client.baseUrl)
          .get('/')
          .query({ search: 'string', tag: 'foo' })
          .reply(200, { meta: {}, response: {} });

        assert.isOk(await client.getRequest('/?search=string', { tag: 'foo' }));
        scope.done();
      });

      it('transforms array params', async () => {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
        });
        const scope = nock(client.baseUrl)
          .get('/')
          .query({ 'tag[0]': 'foo', 'tag[1]': 'bar' })
          .reply(200, { meta: {}, response: {} });

        assert.isOk(await client.getRequest('/', { tag: ['foo', 'bar'] }));
        scope.done();
      });
    });

    it('get request expected headers', async () => {
      const client = new TumblrClient({
        ...DUMMY_CREDENTIALS,
        baseUrl: DUMMY_API_URL,
      });
      const scope = nock(client.baseUrl, {
        reqheaders: {
          accept: 'application/json',
          'user-agent': `tumblr.js/${tumblr.Client.version}`,
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
      const client = new TumblrClient({ consumer_key: 'abc123' });
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
        });
        const scope = nock(client.baseUrl, {
          reqheaders: {
            accept: 'application/json',
            'user-agent': `tumblr.js/${tumblr.Client.version}`,
            'content-type': 'application/json',
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
          .post('/', '{"foo":"bar"}')
          .reply(200, { meta: {}, response: {} });

        assert.isOk(await client.postRequest('/', { foo: 'bar' }));
        scope.done();
      });

      ['data', 'data64'].forEach((dataField) => {
        it(`with body and ${dataField}`, async () => {
          const client = new TumblrClient({
            ...DUMMY_CREDENTIALS,
            baseUrl: DUMMY_API_URL,
          });
          const scope = nock(client.baseUrl, {
            reqheaders: {
              accept: 'application/json',
              'user-agent': `tumblr.js/${tumblr.Client.version}`,
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
            .post('/', new RegExp(`^Content-Disposition: form-data; name="${dataField}"$`, 'm'))
            .reply(200, { meta: {}, response: {} });

          assert.isOk(await client.postRequest('/', { [dataField]: ':D' }));
          scope.done();
        });
      });

      it('serializes different types of form-data fiels', async () => {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
        });
        const scope = nock(client.baseUrl, {
          reqheaders: { 'content-type': /^multipart\/form-data;/ },
        })
          .post('/')
          .reply(200, { meta: {}, response: {} });

        assert.isOk(
          await client.postRequest('/', {
            data: Buffer.from(''),

            // Ensure common field types can be form-data serialized
            booleanField: true,
          }),
        );
        scope.done();
      });

      it('without body', async () => {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
        });
        const scope = nock(client.baseUrl, {
          badheaders: ['content-length', 'content-type'],
          reqheaders: {
            accept: 'application/json',
            'user-agent': `tumblr.js/${tumblr.Client.version}`,
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
      ['put', 'putRequest'],
    ]).forEach(function ([httpMethod, clientMethod]) {
      describe('#' + clientMethod, function () {
        const client = new TumblrClient({
          ...DUMMY_CREDENTIALS,
          baseUrl: DUMMY_API_URL,
        });

        /**
         * @param {'get'|'post'|'put'} httpMethod
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

        const fixtures = require('./fixtures/' + httpMethod + '.json');

        describe('with callbacks', function () {
          Object.entries(fixtures).forEach(function ([apiPath, data]) {
            describe(apiPath, function () {
              setupNockBeforeAfter(httpMethod, data, apiPath);

              it('returns undefined when a callback is provided', (done) => {
                const returnValue = client[clientMethod](apiPath, { foo: 'bar' }, () => {
                  done();
                });
                assert.isUndefined(returnValue);
              });

              it('callback is invoked with provided params', function (done) {
                client[clientMethod](apiPath, { foo: 'bar' }, (err, resp) => {
                  assert.isNull(err);
                  assert.isDefined(resp);
                  done();
                });
              });

              it('callback is invoked without params', function (done) {
                client[clientMethod](apiPath, (err, resp) => {
                  assert.isNull(err);
                  assert.isDefined(resp);
                  done();
                });
              });
            });
          });
        });

        describe('with promises', function () {
          Object.entries(fixtures).forEach(function ([apiPath, data]) {
            describe(apiPath, function () {
              setupNockBeforeAfter(httpMethod, data, apiPath);

              it('returns a Promise', async () => {
                const returnValue = client[clientMethod](apiPath, {});
                assert.isTrue(returnValue instanceof Promise);
                await returnValue;
              });

              it('gets a successful response', async () => {
                assert.isOk(await client[clientMethod](apiPath, {}));
              });
            });
          });
        });
      });
    });
  });
});
