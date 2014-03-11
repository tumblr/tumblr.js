# tumblr.js

[![Build Status](https://secure.travis-ci.org/tumblr/tumblr.js.png)](http://travis-ci.org/tumblr/tumblr.js)

JavaScript client library for the
[Tumblr API](http://www.tumblr.com/docs/en/api/v2) /
npm: https://npmjs.org/package/tumblr.js

## Create a Client

``` javascript
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: '<consumer key>',
  consumer_secret: '<consumer secret>',
  token: '<oauth token>',
  token_secret: '<oauth token secret>'
});
```

Or, if you prefer:

``` javascript
var tumblr = require('tumblr.js');
var client = new tumblr.Client({
	// ...
});
```

## Example

``` javascript
// Show user's blog names
client.userInfo(function (err, data) {
	data.user.blogs.forEach(function (blog) {
		console.log(blog.name);
	});
});
```

## Supported Methods

Below is a list of available methods and their purpose.  Available options
are documented on http://www.tumblr.com/docs/en/api/v2 and are specified as
a JavaScript object, for example:

``` javascript
client.posts('seejohnrun', { type: 'photo' }, function (err, resp) {
  resp.posts; // use them for something
});
```

In most cases, since options are optional (heh) they are also an optional
argument, so there is no need to pass an empty object when supplying no options,
like:

``` javascript
client.posts('seejohnrun', function (err, resp) {
  resp.posts; // now we've got all kinds of posts
});
```


### User Methods

``` javascript
// Get information about the authenticating user & their blogs
client.userInfo(callback);

// Get dashboard for authenticating user
client.dashboard(options, callback);
client.dashboard(callback);

// Get likes for authenticating user
client.likes(options, callback);
client.likes(callback);

// Get followings for authenticating user
client.following(options, callback);
client.following(callback);

// Follow or unfollow a given blog
client.follow(blogURL, callback);
client.unfollow(blogURL, callback);

// Like or unlike a given post
client.like(id, reblogKey, callback);
client.unlike(id, reblogKey, callback);
```

### Blog Methods

``` javascript
// Get information about a given blog
client.blogInfo(blogName, callback);

// Get a list of posts for a blog (with optional filtering)
client.posts(blogName, options, callback);
client.posts(blogName, callback);

// Get the avatar URL for a blog
client.avatar(blogName, size, callback);
client.avatar(blogName, callback);

// Get the likes for a blog
client.blogLikes(blogName, options, callback);
client.blogLikes(blogName, callback);

// Get the followers for a blog
client.followers(blogName, options, callback);
client.followers(blogName, callback);

// Get the queue for a blog
client.queue(blogName, options, callback);
client.queue(blogName, callback);

// Get the drafts for a blog
client.drafts(blogName, options, callback);
client.drafts(blogName, callback);

// Get the submissions for a blog
client.submissions(blogName, options, callback);
client.submissions(blogName, callback);
```

### Post Methods

``` javascript
// Edit a given post
client.edit(blogName, options, callback);

// Reblog a given post
client.reblog(blogName, options, callback);

// Delete a given psot
client.deletePost(blogName, id, callback);

// Convenience methods for creating post types
client.photo(blogName, options, callback);
client.quote(blogName, options, callback);
client.text(blogName, options, callback);
client.link(blogName, options, callback);
client.chat(blogName, options, callback);
client.audio(blogName, options, callback);
client.video(blogName, options, callback);
```

### Tagged Methods

``` javascript
// View posts tagged with a certain tag
client.tagged(tag, options, callback);
client.tagged(tag, callback);
```

---

## Running tests

``` bash
make # run tests
make coverage # run coverage report
```

# Copyright and license

Copyright 2013 Tumblr, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this work except in compliance with the License. You may obtain a copy of
the License in the LICENSE file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations.
