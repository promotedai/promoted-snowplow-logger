# [7.2.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v7.1.0...v7.2.0) (2023-12-15)


### Features

* adds capability for multiple snowplow trackers on a page ([#25](https://github.com/promotedai/promoted-snowplow-logger/issues/25)) ([83031f9](https://github.com/promotedai/promoted-snowplow-logger/commit/83031f9991e57441380dee4ce591406a14c4afd2))

# [7.1.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v7.0.0...v7.1.0) (2023-11-07)


### Features

* add Action.customActionType ([#24](https://github.com/promotedai/promoted-snowplow-logger/issues/24)) ([584fb54](https://github.com/promotedai/promoted-snowplow-logger/commit/584fb5458b4bac08735a5dd7caa4744352a54100))

# [7.0.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v6.1.1...v7.0.0) (2023-09-08)


### Features

* switch logUserId to anonUserId ([#22](https://github.com/promotedai/promoted-snowplow-logger/issues/22)) ([c3427da](https://github.com/promotedai/promoted-snowplow-logger/commit/c3427da721879377787ebe4fd962a35e0c1ced13))


### BREAKING CHANGES

* removes the logUserId field

TESTING=unit tests

## [6.1.1](https://github.com/promotedai/promoted-snowplow-logger/compare/v6.1.0...v6.1.1) (2023-02-24)


### Bug Fixes

* round micros ([#20](https://github.com/promotedai/promoted-snowplow-logger/issues/20)) ([05aeae6](https://github.com/promotedai/promoted-snowplow-logger/commit/05aeae6602a7052c88bbe69fcf913c83ae44ab11))
* semantic release github action ([#21](https://github.com/promotedai/promoted-snowplow-logger/issues/21)) ([350efd2](https://github.com/promotedai/promoted-snowplow-logger/commit/350efd26521527abc9944678ccb7b2bcd99a0171))

# [6.1.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v6.0.0...v6.1.0) (2022-08-10)


### Features

* add View.contentId ([#19](https://github.com/promotedai/promoted-snowplow-logger/issues/19)) ([6ded946](https://github.com/promotedai/promoted-snowplow-logger/commit/6ded946945e0e93907d631413e99b87ed5dbf094))

# [6.0.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v5.0.0...v6.0.0) (2022-07-13)


### Features

* support shopping cart on actions ([#18](https://github.com/promotedai/promoted-snowplow-logger/issues/18)) ([f505bd9](https://github.com/promotedai/promoted-snowplow-logger/commit/f505bd9bc498c3dfc8196b2c0a5a91bda05fc8fc))


### BREAKING CHANGES

* adds ErrorHandler again to the constructor for use in validation code.

TESTING=unit tests

* fix: test

# [5.0.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v4.2.0...v5.0.0) (2022-06-27)


### Features

* use Snowplow Tracker v3 ([#17](https://github.com/promotedai/promoted-snowplow-logger/issues/17)) ([a97764a](https://github.com/promotedai/promoted-snowplow-logger/commit/a97764abdb1a541e27e7cdac7124499f702c0089))


### BREAKING CHANGES

* Large changes to the interface.  Requires Snowplow Tracker v3.

Also includes some smaller clean-ups:
- Removes React.
- Removes logUser and fields that needed.

TESTING=Unit tests. Manual test.

* remove the explicit snowplow dep

It's not needed since we ask for the methods to be passed in.

* small tsconfig update

# [4.2.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v4.1.0...v4.2.0) (2022-06-15)


### Features

* loosen peer deps ([#16](https://github.com/promotedai/promoted-snowplow-logger/issues/16)) ([8a53399](https://github.com/promotedai/promoted-snowplow-logger/commit/8a53399914fc6770d6993583258f9be661c348c4))

# [4.1.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v4.0.0...v4.1.0) (2022-06-15)


### Features

* bump minor version ([#15](https://github.com/promotedai/promoted-snowplow-logger/issues/15)) ([9ff7cde](https://github.com/promotedai/promoted-snowplow-logger/commit/9ff7cde3d92ce9d258ddd9df772425ed93efa64c))

# [4.0.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v3.1.0...v4.0.0) (2022-06-15)


### Code Refactoring

* improve types, remove unused types; split ([#12](https://github.com/promotedai/promoted-snowplow-logger/issues/12)) ([0c41968](https://github.com/promotedai/promoted-snowplow-logger/commit/0c41968c8007536d42ef6247bebecbd608f380e0))


### BREAKING CHANGES

* Adds better types for inputs.  Removed unused Request and Insertion types.  If we want to add something like this back, we should add a DeliveryLog.

This PR also refactors index.ts into separate files.

TESTING=unit tests

* fix: make action.userinfo optional

* fix: the types in the test data

* add type to createEventLogger

# [3.1.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v3.0.0...v3.1.0) (2021-07-22)


### Features

* expose logAction ([111925e](https://github.com/promotedai/promoted-snowplow-logger/commit/111925e56698e0339aadda97fda4519c4148b99d))

# [3.0.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v2.2.0...v3.0.0) (2021-06-10)


* Another commit to force a breaking change. ([ccf103a](https://github.com/promotedai/promoted-snowplow-logger/commit/ccf103ac4d5d9746a941f01ae66ade844ee9c664))


### BREAKING CHANGES

* this syntax is very nitpicky

TESTING=none

# [2.2.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v2.1.0...v2.2.0) (2021-06-10)


### Features

* rename handleLogError to handleError ([50c1274](https://github.com/promotedai/promoted-snowplow-logger/commit/50c127479e78a042c4d0a8e3f8ea45707d634a26))

# [2.1.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v2.0.0...v2.1.0) (2021-05-28)


### Features

* support async loading of snowplow script ([19e60d9](https://github.com/promotedai/promoted-snowplow-logger/commit/19e60d97fd1674393f0cb56906e145bd7593076d))

# [2.0.0](https://github.com/promotedai/promoted-snowplow-logger/compare/v1.0.0...v2.0.0) (2021-03-27)


### Bug Fixes

* small tsx issue in previous commit ([b91cd0e](https://github.com/promotedai/promoted-snowplow-logger/commit/b91cd0ef147958895fb63808b892b2d5f1410e2a))
* try to fix github actions failure ([442a4d0](https://github.com/promotedai/promoted-snowplow-logger/commit/442a4d03c0c3710b4404a5017bd9eb9919bf0ce8))


### Features

* switch to new protos ([26ced1d](https://github.com/promotedai/promoted-snowplow-logger/commit/26ced1dbc8ede37610351f87036cf38f1ff1fec0))


### BREAKING CHANGES

* These protos change the interface.  The old libraries do not work.

TESTING=unit tests

# 1.0.0 (2021-02-28)
