# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2024-02-22

### Changed

- **Breaking** Support Node.js versions `>=18`.

### Fixed

- Fix Content-Length header size in UTF-8.

## [4.0.1] - 2023-09-01

### Added

- Build updated docs site at https://tumblr.github.io/tumblr.js.

### Changed

- Some `@private` properties of `Client` have been changed to `#private` fields.

## [4.0.0] - 2023-08-28

The 4.0 release is a significant change that modernizes the library, adds NPF support, and removes a
dependency on the long-deprecated `request` library.

Some things to watch out for when migrating from v3:

The `createPost` and `editPost` methods were renamed to `createLegacyPost` and `editLegacyPost`.
`createPost` and `editPost` are now for working with NPF posts (via the `/posts` endpoint).

```js
// Before v4
createPost(blogName, params);
editPost(blogName, params);
// After v4
createLegacyPost(blogName, params);
editLegacyPost(blogName, params);
```

Some legacy post creation helper methods have been removed. For example:

```js
// Before v4
createPhotoPost(blogName, params);
// After v4
createLegacyPost(blogName, { type: 'photo', ...params });
```

Usage of `returnPromises` will now produce a warning. A promise will be returned if no callback is
provided.

### Added

- Integration test suites using the Tumblr API.
- Creation and edition of NPF posts is now supported via `createPost`/`editPost` 🎉

### Changed

- **Breaking** Support Node.js versions `>=16`.
- **Breaking** `Client` constructor accepts single options argument.
- **Breaking** Credentials should be provided directly as options, not nested under the
  `credentials` property.
- **Breaking** The (optional) `baseUrl` option should be of the form `https://example.com` with no
  pathname, search, hash, etc. Bad `baseUrl` options will throw.
- **Breaking** The `createPost` method has been renamed to `createLegacyPost`. `createPost` is now
  used for NPF post creation.
- Some API methods had documented signatures that were probably wrong. These have been updated.
- Bundled type declarations are now generated from source and should be improved.
- Dependencies have changed, notably `request` (deprecated) and `lodash` have been removed.

### Deprecated

- The following legacy post methods are deprecated. Prefer NPF methods (`/posts` endpoint)
  - `createLegacyPost`
  - `editLegacyPost`
  - `reblogPost`
- The callback API is considered deprecated in favor of the `Promise` API.

### Fixed

- `blogIdentifier` parameters will not have `.tumblr.com` automatically appended. Blog UUIDs can now
  be used as `blogIdentifiers`.

### Removed

- **Breaking** API methods return promises when no callback is provided. The `returnPromises` method
  and option have no effect.
- **Breaking** The `addGetMethods` and `addPostMethods` methods have been removed. Additional
  methods can be implemented using the `getRequest` or `postRequest` methods.
- **Breaking** The following legacy post creation methods have been removed.
  - `createAudioPost`: use `createLegacyPost` with `{type: "audio"}`.
  - `createChatPost`: use `createLegacyPost` with `{type: "chat"}`.
  - `createLinkPost`: use `createLegacyPost` with `{type: "link"}`.
  - `createPhotoPost`: use `createLegacyPost` with `{type: "photo"}`.
  - `createQuotePost`: use `createLegacyPost` with `{type: "quote"}`.
  - `createTextPost`: use `createLegacyPost` with `{type: "text"}`.
  - `createVideoPost`: use `createLegacyPost` with `{type: "video"}`.
- **Breaking** The `request` option has been removed.
- Request objects are no longer returned from API methods.

## [3.0.0] - 2020-07-28

## [2.0.0] - 2018-06-13

## [1.0.0] - 2016-05-09

[unreleased]: https://github.com/tumblr/tumblr.js/compare/v5.0.0...HEAD
[5.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/v5.0.0
[4.0.1]: https://github.com/tumblr/tumblr.js/releases/tag/v4.0.1
[4.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/v4.0.0
[3.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/v3.0.0
[2.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/2.0.0
[1.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/1.0.0
