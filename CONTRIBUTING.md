# Contributing

## Setup

Dependencies can be installed with:

```sh
pnpm i
```

## Developing

The SDK Playground can be started with:

```sh
pnpm dev
```

Lint errors can be autofixed with:

```sh
pnpm fix
```

## Commit

Commit messages follow the
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.
After staging changes, commits can be authored using commitizen:

```sh
pnpm commit
```

## Release

This package uses [ReleaseIt](https://github.com/release-it/release-it) to
manage releases.

To release this package to npm use the `release` command.

```sh
pnpm release
```

Release It flags can be passed to this command to control how the version is
incremented. Use `-h` for details.
