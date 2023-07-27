# Contributing

We want to make contributing to `tumblr.js` as easy and transparent as possible. If you run into
problems, please open an issue. We also actively welcome pull requests.

## Pull Requests

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.

## License

By contributing to tumblr.js you agree that your contributions will be licensed under its Apache 2.0
license.

## Testing

First install dependencies by running `npm ci`.

### Unit tests

Run unit tests as follows:

```sh
npm run test
```

### Integration tests

To run the integration tests which will actually call the API, you'll need to get OAuth1 application
credentials. To get valid credentials, visit the
[Tumblr OAuth Applications page](https://www.tumblr.com/oauth/apps).

**Never share your credentials. They're secret!**

Part of the suite can be run with just the `consumer_key`, which is required:

```sh
TUMBLR_OAUTH_CONSUMER_KEY='--- valid consumer_key ---' \
npm run test:integration
```

To run the full suite, you must provide complete OAuth1 credentials. These full credentials can be
found by visiting the [Tumblr API Console](https://api.tumblr.com/console/calls/user/info) and
entering your OAuth Application consumer credentials. _Note:_ You may need to set
`https://api.tumblr.com/console/calls/user/info` as the default callback URL for you application.
It's recommended to create a dedicated application for testing this library.

Provide the full OAuth1 credentials as environment variables and run the integration test suite:

```sh
TUMBLR_OAUTH_CONSUMER_KEY='--- valid consumer_key ---' \
TUMBLR_OAUTH_CONSUMER_SECRET='--- valid consumer_secret ---' \
TUMBLR_OAUTH_TOKEN='--- valid token ---' \
TUMBLR_OAUTH_TOKEN_SECRET='--- valid token_key ---' \
npm run test:integration
```

The above tests query the API to read data, they won't make any changes.

There are additional tests that _will write or modify data_. Those tests are disabled by default and
need to be enabled by changes to the test file. Be careful when running those tests and be sure the
credentials are for a test account.
