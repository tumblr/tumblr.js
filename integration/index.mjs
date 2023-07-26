import { env } from 'node:process';
import { Client } from 'tumblr.js';
import { assert } from 'chai';
import { test } from 'mocha';

if (!env.TUMBLR_OAUTH_CONSUMER_KEY) {
  throw new Error('Must provide TUMBLR_OAUTH_CONSUMER_KEY environment variable');
}

describe('consumer_key only request', () => {
  /** @type {Client} */
  let c;
  before(() => {
    c = new Client({ consumer_key: env.TUMBLR_OAUTH_CONSUMER_KEY });
    c.returnPromises();
  });

  test('fetches staff blog', async () => {
    const {
      blog: { uuid, name },
    } = await c.blogInfo('staff');
    assert.equal(name, 'staff');
    assert.equal(uuid, 't:0aY0xL2Fi1OFJg4YxpmegQ');
  });
});
