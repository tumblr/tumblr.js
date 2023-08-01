import { env } from 'node:process';
import { Client } from 'tumblr.js';
import { assert } from 'chai';
import { test } from 'mocha';

describe('unauthorized requests', () => {
  /** @type {Client} */
  let client;
  before(() => {
    client = new Client();
    client.returnPromises();
  });

  ['staff', 'staff.tumblr.com', 't:0aY0xL2Fi1OFJg4YxpmegQ'].forEach((blogIdentifier) => {
    test(`fetches blogAvatar(${JSON.stringify(blogIdentifier)})`, async () => {
      const { avatar_url } = await client.blogAvatar(blogIdentifier);
      assert.isString(avatar_url);
    });
  });
});

describe('consumer_key (api_key) only requests', () => {
  /** @type {Client} */
  let client;
  before(function () {
    if (!env.TUMBLR_OAUTH_CONSUMER_KEY) {
      console.log('Provide TUMBLR_OAUTH_CONSUMER_KEY environment variable to run this block');
      this.skip();
    }

    client = new Client({
      consumer_key: env.TUMBLR_OAUTH_CONSUMER_KEY,
    });
    client.returnPromises();
  });

  ['staff', 'staff.tumblr.com', 't:0aY0xL2Fi1OFJg4YxpmegQ'].forEach((blogIdentifier) => {
    test(`fetches blogInfo(${JSON.stringify(blogIdentifier)})`, async () => {
      const resp = await client.blogInfo(blogIdentifier);
      assert.isOk(resp);
      assert.equal(resp.blog.name, 'staff');
      assert.equal(resp.blog.uuid, 't:0aY0xL2Fi1OFJg4YxpmegQ');
    });
  });
});

describe('oauth1 requests', () => {
  const OAUTH1_ENV_VARS = [
    'TUMBLR_OAUTH_CONSUMER_KEY',
    'TUMBLR_OAUTH_CONSUMER_SECRET',
    'TUMBLR_OAUTH_TOKEN',
    'TUMBLR_OAUTH_CONSUMER_SECRET',
  ];

  /** @type {Client} */
  let client;
  before(function () {
    if (!OAUTH1_ENV_VARS.every((envVarName) => Boolean(env[envVarName]))) {
      console.warn(
        `To run full oauth1 tests provide environment vars ${OAUTH1_ENV_VARS.join(', ')}`,
      );
      this.skip();
    }

    client = new Client({
      consumer_key: env.TUMBLR_OAUTH_CONSUMER_KEY,
      consumer_secret: env.TUMBLR_OAUTH_CONSUMER_SECRET,
      token: env.TUMBLR_OAUTH_TOKEN,
      token_secret: env.TUMBLR_OAUTH_TOKEN_SECRET,
    });
    client.returnPromises();
  });

  test('fetches userInfo()', async () => {
    const resp = await client.userInfo();
    assert.isOk(resp);
    assert.typeOf(resp.user.name, 'string');
    assert.typeOf(resp.user.blogs, 'array');
    assert.typeOf(resp.user.blogs[0].uuid, 'string');
  });
});
