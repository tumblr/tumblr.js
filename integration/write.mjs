import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { env } from 'node:process';
import { Client } from 'tumblr.js';
import { assert } from 'chai';
import { test } from 'mocha';

describe('oauth1 write requests', () => {
  /** @type {import('tumblr.js').Client} */
  let client;

  /** @type {string} */
  let blogName;

  before(async function () {
    if (
      !env['TUMBLR_OAUTH_CONSUMER_KEY'] ||
      !env['TUMBLR_OAUTH_CONSUMER_SECRET'] ||
      !env['TUMBLR_OAUTH_TOKEN'] ||
      !env['TUMBLR_OAUTH_TOKEN_SECRET']
    ) {
      console.log('Must provide all Oauth1 environment variables');
      this.skip();
    }

    if (!env['CI']) {
      console.warn(
        'This test suite uses the API to make changes. Modify the test suite to enabled it.',
      );
      this.skip();
    }

    client = new Client({
      consumer_key: env['TUMBLR_OAUTH_CONSUMER_KEY'],
      consumer_secret: env['TUMBLR_OAUTH_CONSUMER_SECRET'],
      token: env['TUMBLR_OAUTH_TOKEN'],
      token_secret: env['TUMBLR_OAUTH_TOKEN_SECRET'],
    });

    const userResp = await client.userInfo();
    blogName = userResp.user.blogs[0].name;
  });

  // Wait a bit between tests to not spam API.
  afterEach(function () {
    return new Promise((resolve) => setTimeout(() => resolve(undefined), this.timeout() - 100));
  });

  describe('post creation', () => {
    test('creates a simple post', async () => {
      assert.isOk(
        await client.createPost(blogName, {
          content: [
            {
              type: 'text',
              text: `Automated test post ${new Date().toISOString()}`,
            },
            {
              type: 'text',
              text: 'This post was automatically generated by the tumblr.js tests.',
            },
            {
              type: 'link',
              title: 'The official JavaScript client library for the Tumblr API.',
              url: 'https://github.com/tumblr/tumblr.js',
              author: 'Tumblr',
            },
          ],
          tags: ['tumblr.js-test', `tumblr.js-version-${client.version}`, 'test-npf-text'],
        }),
      );
    });

    test.skip('creates a post with media', () => {
      // Blocked on https://github.com/tumblr/docs/issues/88
    });
  });

  describe('legacy post creation', () => {
    test('creates a text post', async () => {
      assert.isOk(
        await client.createLegacyPost(blogName, {
          type: 'text',
          format: 'markdown',
          title: `Automated test post ${new Date().toISOString()}`,
          body: 'This post was automatically generated by the tumblr.js tests.\n\n[The official JavaScript client library for the Tumblr API.](https://github.com/tumblr/tumblr.js)',
          tags: `tumblr.js-test,tumblr.js-version-${client.version},test-legacy-text`,
        }),
      );
    });

    describe('create photo post', () => {
      it('via data', async () => {
        const data = await readFile(new URL('../test/fixtures/image.jpg', import.meta.url));

        const res = await client.createLegacyPost(blogName, {
          type: 'photo',
          caption: `Arches National Park || Automated test post ${new Date().toISOString()}`,
          link: 'https://openverse.org/en-gb/image/38b9b781-390f-4fc4-929d-0ecb4a2985e3',
          tags: `tumblr.js-test,tumblr.js-version-${client.version},test-legacy-photo-data`,
          data: data,
        });
        assert.isOk(res);
      });

      it('via data[]', async () => {
        const data = await readFile(new URL('../test/fixtures/image.jpg', import.meta.url));

        const res = await client.createLegacyPost(blogName, {
          type: 'photo',
          caption: `Arches National Park || Automated test post ${new Date().toISOString()}`,
          link: 'https://openverse.org/en-gb/image/38b9b781-390f-4fc4-929d-0ecb4a2985e3',
          tags: `tumblr.js-test,tumblr.js-version-${client.version},test-legacy-photo-data[]`,
          data: [data, data],
        });
        assert.isOk(res);
      });

      it('via data64', async () => {
        const data = await readFile(new URL('../test/fixtures/image.jpg', import.meta.url), {
          encoding: 'base64',
        });

        const res = await client.createLegacyPost(blogName, {
          type: 'photo',
          caption: `Arches National Park || Automated test post ${new Date().toISOString()}`,
          link: 'https://openverse.org/en-gb/image/38b9b781-390f-4fc4-929d-0ecb4a2985e3',
          tags: `tumblr.js-test,tumblr.js-version-${client.version},test-legacy-photo-data64`,
          data64: data,
        });
        assert.isOk(res);
      });
    });

    it('creates an audio post with data', async () => {
      const data = await readFile(new URL('../test/fixtures/audio.mp3', import.meta.url));

      const res = await client.createLegacyPost(blogName, {
        type: 'audio',
        caption: `Multiple Dog Barks (King Charles Spaniel) || Automated test post ${new Date().toISOString()}`,
        tags: `tumblr.js-test,tumblr.js-version-${client.version},test-legacy-audio`,
        data: data,
      });
      assert.isOk(res);
    });
  });
});
