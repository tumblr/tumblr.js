# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Integration test suites using the Tumblr API.

### Changed

- **Breaking** Support Node.js versions `>=16`.
- **Breaking** `Client` constructor accepts single options argument.
- **Breaking** Credentials should be provided directly as options, not nested under the
  `credentials` property.
- **Breaking** The (optional) `baseUrl` option should be of the form `https://example.com` with no
  pathname, search, hash, etc. Bad `baseUrl` options will throw.
- Some API methods had documented signatures that were probably wrong. These have been updated.
- Bundled type declarations are now generated from source and should be improved.
- Dependencies have changed, notably `request` (deprecated) and `lodash` have been removed.

### Deprecated

- The following legacy post methods are deprecated. Prefer NPF methods (`/posts` endpoint)
  - `createPost`
  - `editPost`
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
  - `createAudioPost`: use `createPost` with `{type: "audio"}`.
  - `createChatPost`: use `createPost` with `{type: "chat"}`.
  - `createLinkPost`: use `createPost` with `{type: "link"}`.
  - `createPhotoPost`: use `createPost` with `{type: "photo"}`.
  - `createQuotePost`: use `createPost` with `{type: "quote"}`.
  - `createTextPost`: use `createPost` with `{type: "text"}`.
  - `createVideoPost`: use `createPost` with `{type: "video"}`.
- **Breaking** The `request` option has been removed.
- Request objects are no longer returned from API methods.

## [3.0.0] - 2020-07-28

## [2.0.0] - 2018-06-13

## [1.0.0] - 2016-05-09

[unreleased]: https://github.com/tumblr/tumblr.js/compare/v3.0.1...HEAD
[3.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/3.0.0
[2.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/2.0.0
[1.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/1.0.0
