# last-from-buildkite

Find the last build number of a build that has run a job with a particular label. Useful for finding the last thing deployed to production etc

# Installation

```
npm install -g last-from-buildkite
```

# Usage

The CLI tool requires 3 arguments.

* --token: Your buildkite token, requires GraphQL permissions.
* --slug: Your project slug (including organisation prefix)
* --command: The label of the command you wish to search for

These can also be set as environment variables instead, by prefixing them with _BUILDKITE_ (eg. _BUILDKITE\_TOKEN_)
