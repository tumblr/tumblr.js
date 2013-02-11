# Tumblr.js
JavaScript client library for the
[Tumblr API](http://www.tumblr.com/docs/en/api/v2).

## Create a Client

``` javascript
var tumblr = require('tumblr');
var client = tumblr.createClient({
  consumer_key: '<consumer key>',
  consumer_secret: '<consumer secret>',
  token: '<oauth token>',
  token_secret: '<oauth token secret>'
});
```

Or, if you prefer:

``` javascript
var tumblr = require('tumblr');
var client = new tumblr.Client({
	// ...
});
```

## Supported Methods

### User Methods

``` javascript
client.userInfo(callback);

client.dashboard(options, callback);
client.dashboard(callback);

client.likes(options, callback);
client.likes(callback);

client.following(options, callback);
client.following(callback);

client.follow(blogURL, callback);
client.unfollow(blogURL, callback);

client.like(id, reblogKey, callback);
client.unlike(id, reblogKey, callback);
```

### Blog Methods

``` javascript
client.blogInfo(blogName, callback);

client.posts(blogName, options, callback);
client.posts(blogName, callback);

client.avatar(blocName, size, callback);
client.avatar(blocName, callback);

client.blogLikes(blogName, options, callback);
client.blogLikes(blogName, callback);

client.followers(blogName, options, callback);
client.followers(blogName, callback);

client.queue(blogName, options, callback);
client.queue(blogName, callback);

client.drafts(blogName, options, callback);
client.drafts(blogName, callback);

client.submissions(blogName, options, callback);
client.submissions(blogName, callback);
```

### Post Methods

``` javascript
client.edit(blogName, options, callback);

client.reblog(blogName, options, callback);

client.deletePost(blogName, id, callback);

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
client.tagged(tag, options, callback);
client.tagged(tag, callback);
```

---

## Running tests

``` bash
make # run tests
make coverage # run coverage report
```

# License

Available for use under the MIT license: [http://bryan.mit-license.org](http://bryan.mit-license.org)
