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
