# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Integration test suites using real API.

### Changed

- **Breaking** Support Node.js versions `>=16`.
- **Breaking** `Client` constructor accepts single options argument.
- **Breaking** Credentials should be provided directly as options, not nested under the
  `credentials` property.
- **Breaking** The (optional) `baseUrl` option should be of the form `https://example.com` with no
  pathname, search, hash, etc. Bad `baseUrl` options will throw.

### Fixed

- `blogIdentifier` parameters will not have `.tumblr.com` automatically appended. Blog UUIDs can now
  be used as `blogIdentifiers`.

### Removed

- **Breaking** The `request` option has been removed.

## [3.0.0] - 2020-07-28

## [2.0.0] - 2018-06-13

## [1.0.0] - 2016-05-09

[unreleased]: https://github.com/tumblr/tumblr.js/compare/v3.0.1...HEAD
[3.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/3.0.0
[2.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/2.0.0
[1.0.0]: https://github.com/tumblr/tumblr.js/releases/tag/1.0.0
