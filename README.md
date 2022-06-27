# promoted-snowplow-logger

This event logger (tracker) library is used to simplify browser-side logging.  It relies on the browser-side JS having the Snowplow tracker library installed.  This library uses the Promoted Metrics Snowplow-compatible API.  See the [web integration guide](https://docs.promoted.ai/docs/how-to-your-web-events-with-promoted-metrics) to learn how to use this library.

## Features

Uses
- [TypeScript](https://www.typescriptlang.org/) support
- [ESLint](https://eslint.org/) (with [Prettier](https://prettier.io/))
- Unit tests ([Jest](https://jestjs.io/)
- Minified output with [Terser](https://terser.org/)
- Bundle size validation with [size-limit](https://github.com/ai/size-limit)
- Flexible builds with [Rollup](https://www.rollupjs.org/)
- [CHANGELOG.md](https://keepachangelog.com/en/1.0.0/) template

## Scripts

- Run most commands: `npm run finish`
- Build the project: `npm run build`
  - Validate output bundle size with `npm run size`
- Lint the project: `npm run lint`
- Run unit tests: `npm test` or `npm test`

## When developing locally

If you want to test local changes in an actual deployment, use `npm link`.

1. Run `npm run updateLink`.
4. Go to client directory and run `npm link promoted-snowplow-logger`.

When you update `promoted-snowplow-logger`, run `npm run updateLink`.

When you want to undo, use `npm unlink` in `promoted-snowplow-logger/dist` and `npm unlink promoted-snowplow-logger` in the client directory.

## Deploy

We use a GitHub action that runs semantic-release to determine how to update versions.  Just do a normal code review and this should work.  Depending on the message prefixes (e.g. `feat: `, `fix: `, `clean: `, `docs: `), it'll update the version appropriately.

# Resources

The base of this repository is a combination of the following repos:
- https://github.com/DenysVuika/react-lib
- https://github.com/Alexandrshy/como-north and https://dev.to/alexandrshy/creating-a-template-repository-in-github-1d05
