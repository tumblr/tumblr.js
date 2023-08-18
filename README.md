# tumblr.js

[![CI](https://github.com/tumblr/tumblr.js/actions/workflows/ci.yaml/badge.svg)](https://github.com/tumblr/tumblr.js/actions/workflows/ci.yaml)

The official JavaScript client library for the [Tumblr API](http://www.tumblr.com/docs/api/v2).
Check out the [detailed documentation here](https://tumblr.github.io/tumblr.js/index.html).

## Installation

Install this package from [npm](https://www.npmjs.com/package/tumblr.js):

```bash
npm install --save tumblr.js
```

## Usage

### Authentication

Different API methods use different kinds of authentication.

Most of them require at least an API key, which will require you to
[register an application](https://www.tumblr.com/oauth/apps). The **OAuth Consumer Key** is your API
key.

For methods that require a fully signed request, you'll need OAuth tokens as well, which you get
from authenticating as a Tumblr user and allowing access to your API application. Here's the easy
way to do it with our own account:

1. Visit the [OAuth applications page](https://www.tumblr.com/oauth/apps)
2. Click "Explore API" on the application you want to authorize
3. Click the "Allow" button, which will take you to the
   [API console](https://api.tumblr.com/console)
4. Click the "Show keys" button, which will show you the credentials you can use to make signed
   requests.

If you're building an application of your own for users out in the world, you'll need to go through
the 3-legged OAuth flow. See the [help docs](https://www.tumblr.com/docs/api/v2#auth) for more info.

### In Node.js

```js
const tumblr = require('tumblr.js');
const client = tumblr.createClient({
  consumer_key: '<consumer key>',
  consumer_secret: '<consumer secret>',
  token: '<oauth token>',
  token_secret: '<oauth token secret>',
});
```

Or, if you prefer:

```js
const tumblr = require('tumblr.js');
const client = new tumblr.Client({
  // ...
});
```

The request methods return `Request` objects by default, but you can have it return `Promise`
objects instead, if that's more your thing. Pass `returnPromises: true` in the options to
`createClient`:

```js
const tumblr = require('tumblr.js');
const client = tumblr.createClient({
  credentials: {
    // ...
  },
  returnPromises: true,
});
```

### In the Browser

Due to CORS restrictions, you're going to have a really hard time using this library in the browser.
Although GET endpoints on the Tumblr API support JSONP, this library is not intended for in-browser
use. Sorry!

## Example

```js
// Show user's blog names
client.userInfo(function (err, data) {
  data.user.blogs.forEach(function (blog) {
    console.log(blog.name);
  });
});
```

## Supported Methods

Below is a list of available methods and their purpose. Available options are documented in the
[API Docs](https://www.tumblr.com/docs/api/v2) and are specified as a JavaScript object.

```js
const response = await client.blogPosts('blogName', {
  type: 'photo',
  tag: ['multiple', 'tags', 'likethis'],
});
```

In most cases, since options are optional (heh) they are also an optional argument, so there is no
need to pass an empty object when supplying no options, like:

```js
const response = await client.blogPosts('blogName');
```

### User Methods

```js
// Get information about the authenticating user & their blogs
const userInfo = await client.userInfo();

// Get dashboard for authenticating user
const userDashboard = await client.userDashboard(options);

// Get likes for authenticating user
const userLikes = await client.userLikes(options);

// Get followings for authenticating user
const userFollowing = await client.userFollowing(options);

// Follow or unfollow a given blog
await client.followBlog(blogURL);
await client.unfollowBlog(blogURL);

// Like or unlike a given post
await client.likePost(postId, reblogKey);
await client.unlikePost(postId, reblogKey);
```

### Blog Methods

```js
// Get information about a given blog
const blogInfo = await client.blogInfo(blogName);

// Get a list of posts for a blog (with optional filtering)
const blogPosts = await client.blogPosts(blogName, options);

// Get the avatar URL for a blog
const blogAvatar = await client.blogAvatar(blogName);

// Get the likes for a blog
const blogLikes = await client.blogLikes(blogName, options);

// Get the followers for a blog
const blogFollowers = await client.blogFollowers(blogName, options);

// Get the queue for a blog
const blogQueue = await client.blogQueue(blogName, options);

// Get the drafts for a blog
const blogDrafts = await client.blogDrafts(blogName, options);

// Get the submissions for a blog
const blogSubmissions = await client.blogSubmissions(blogName, options);
```

### Post Methods

```js
// Create or reblog a post
await client.createPost(blogName, options);

// Edit a post
await client.editPost(blogName, postId, options);

// Delete a given post
await client.deletePost(blogName, postId);
```

### Legacy Post Methods (deprecated)

```js
// Create a legacy post
const createdPost = await client.createLegacyPost(blogName, options);

// Edit a legacy post
await client.editLegacyPost(blogName, options);

// Reblog a legacy post
await client.reblogPost(blogName, options);
```

### Tagged Methods

```js
// View posts tagged with a certain tag
client.taggedPosts(tag, options);
client.taggedPosts(tag);
```

## Unsupported Methods

You can make arbitrary requests via the following methods.

```js
// GET requests
client.getRequest(apiPath, params);

// POST requests
client.postRequest(apiPath, params);

// PUT requests
client.postRequest(apiPath, params);
```

---

## Running Tests

```bash
# Run tests
npm run test

# Lint
npm run lint

# Typecheck
npm run typecheck
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details including the integration tests.

---

## Copyright and license

Copyright 2013-2019 Tumblr, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in
compliance with the License. You may obtain a copy of the License in the [LICENSE](LICENSE) file, or
at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is
distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing permissions and limitations.
