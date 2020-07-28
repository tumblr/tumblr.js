# tumblr.js

[![Build Status](https://travis-ci.org/tumblr/tumblr.js.svg?branch=master)](https://travis-ci.org/tumblr/tumblr.js)

The official JavaScript client library for the [Tumblr API](http://www.tumblr.com/docs/api/v2). Check out the [detailed documentation here](https://tumblr.github.io/tumblr.js/index.html).

## Installation

Install this package from [npm](https://www.npmjs.com/package/tumblr.js):

```bash
npm install --save tumblr.js
```

## Usage

### Authentication

Different API methods use different kinds of authentication.

Most of them require at least an API key, which will require you to [register an application](https://www.tumblr.com/oauth/apps). The **OAuth Consumer Key** is your API key.

For methods that require a fully signed request, you'll need OAuth tokens as well, which you get from authenticating as a Tumblr user and allowing access to your API application. Here's the easy way to do it with our own account:

1. Visit the [OAuth applications page](https://www.tumblr.com/oauth/apps)
2. Click "Explore API" on the application you want to authorize
3. Click the "Allow" button, which will take you to the [API console](https://api.tumblr.com/console)
4. Click the "Show keys" button, which will show you the credentials you can use to make signed requests.

If you're building an application of your own for users out in the world, you'll need to go through the 3-legged OAuth flow. See the [help docs](https://www.tumblr.com/docs/api/v2#auth) for more info.

### In Node.js

```js
const tumblr = require('tumblr.js');
const client = tumblr.createClient({
  consumer_key: '<consumer key>',
  consumer_secret: '<consumer secret>',
  token: '<oauth token>',
  token_secret: '<oauth token secret>'
});
```

Or, if you prefer:

```js
const tumblr = require('tumblr.js');
const client = new tumblr.Client({
  // ...
});
```

The request methods return `Request` objects by default, but you can have it return `Promise` objects instead, if that's more your thing. Pass `returnPromises: true` in the options to `createClient`:

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

Due to CORS restrictions, you're going to have a really hard time using this library in the browser. Although GET endpoints on the Tumblr API support JSONP, this library is not intended for in-browser use. Sorry!

## Example

```js
// Show user's blog names
client.userInfo(function(err, data) {
  data.user.blogs.forEach(function(blog) {
    console.log(blog.name);
  });
});
```

## Supported Methods

Below is a list of available methods and their purpose. Available options are documented in the [API Docs](https://www.tumblr.com/docs/api/v2) and are specified as a JavaScript object.

```js
client.blogPosts('blogName', {type: 'photo', tag: ['multiple','tags','likethis']}, function(err, resp) {
  resp.posts; // use them for something
});
```

In most cases, since options are optional (heh) they are also an optional argument, so there is no need to pass an empty object when supplying no options, like:

```js
client.blogPosts('blogName', function(err, resp) {
  resp.posts; // now we've got all kinds of posts
});
```

If you're using Promises, use `then` and/or `catch` instead of a callback:

```js
client.blogPosts('blogName')
  .then(function(resp) {
    resp.posts;
  })
  .catch(function(err) {
    // oops
  });
```

### User Methods

```js
// Get information about the authenticating user & their blogs
client.userInfo(callback);

// Get dashboard for authenticating user
client.userDashboard(options, callback);
client.userDashboard(callback);

// Get likes for authenticating user
client.userLikes(options, callback);
client.userLikes(callback);

// Get followings for authenticating user
client.userFollowing(options, callback);
client.userFollowing(callback);

// Follow or unfollow a given blog
client.followBlog(blogURL, callback);
client.unfollowBlog(blogURL, callback);

// Like or unlike a given post
client.likePost(id, reblogKey, callback);
client.unlikePost(id, reblogKey, callback);
```

### Blog Methods

```js
// Get information about a given blog
client.blogInfo(blogName, callback);

// Get a list of posts for a blog (with optional filtering)
client.blogPosts(blogName, options, callback);
client.blogPosts(blogName, callback);

// Get the avatar URL for a blog
client.blogAvatar(blogName, size, callback);
client.blogAvatar(blogName, callback);

// Get the likes for a blog
client.blogLikes(blogName, options, callback);
client.blogLikes(blogName, callback);

// Get the followers for a blog
client.blogFollowers(blogName, options, callback);
client.blogFollowers(blogName, callback);

// Get the queue for a blog
client.blogQueue(blogName, options, callback);
client.blogQueue(blogName, callback);

// Get the drafts for a blog
client.blogDrafts(blogName, options, callback);
client.blogDrafts(blogName, callback);

// Get the submissions for a blog
client.blogSubmissions(blogName, options, callback);
client.blogSubmissions(blogName, callback);
```

### Post Methods

```js
// Edit a given post
client.editPost(blogName, options, callback);

// Reblog a given post
client.reblogPost(blogName, options, callback);

// Delete a given post
client.deletePost(blogName, id, callback);

// Convenience methods for creating post types
client.createTextPost(blogName, options, callback);
client.createPhotoPost(blogName, options, callback);
client.createQuotePost(blogName, options, callback);
client.createLinkPost(blogName, options, callback);
client.createChatPost(blogName, options, callback);
client.createAudioPost(blogName, options, callback);
client.createVideoPost(blogName, options, callback);
```

### Tagged Methods

```js
// View posts tagged with a certain tag
client.taggedPosts(tag, options, callback);
client.taggedPosts(tag, callback);
```

## Unsupported Methods

You can make GET and POST requests to any endpoint directly. These methods are used internally by the methods listed above:

```js
// GET requests
client.getRequest(apiPath, params, callback);

// POST requests
client.postRequest(apiPath, params, callback);
```

In the unlikely event that we add a bunch of methods to the API docs and don't update this client, you can map new client methods to API endpoints. URL and query parameters are automatically turned into arguments to these methods. It's a little weird to explain, so just look at these examples:

```js
// GET methods
client.addGetMethods({
  // creates client.userInfo(params, callback)
  userInfo: '/v2/user/info',
  // client.blogInfo(blogIdentifier, params, callback)
  blogInfo: '/v2/blog/:blogIdentifier/info',
  // Creates client.taggedPosts(tag, params, callback)
  taggedPosts: ['/v2/tagged', ['tag']],
});

// POST methods
client.addPostMethods({
  // client.deletePost(blogIdentifier, id, params, callback)
  deletePost: ['/v2/blog/:blogIdentifier/post/delete', ['id']],
  // Creates client.likePost(tag, id, reblog_key, params, callback)
  likePost: ['/v2/user/like', ['id', 'reblog_key']],
});
```

---

## Running Tests

```bash
npm test # linter and tests
npm run lint # linter
npm run mocha # just the tests
```

---

## Copyright and license

Copyright 2013-2019 Tumblr, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this work except in compliance with the License. You may obtain a copy of
the License in the [LICENSE](LICENSE) file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations.
