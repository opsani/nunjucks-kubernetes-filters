# nunjucks-kubernetes-filters

Nunjucks filters for rendering templated Kubernetes manifests.

## Overview

Kubernetes imposes constraints around how resources are named. There are three common commonly used constraints for resource names: DNS Subdomain Names, DNS Label Names, and Path Segment Names. Naming constraints are detailed in the Kubernetes [Object Names and IDs](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/) documentation.

Implementing these constraints correctly within templates is non-trivial due to the character set, length, and character boundary constraints.

This library provides simple, well-tested implementations of
filters that will transform arbitrary input strings into valid names within your Kubernetes manifest templates.

## Installation

`npm install @opsani/nunjucks-kubernetes-filters`

Once installed, proceed to [Usage](#Usage).

## Filters

There are three filters available:

* `dnsSubdomainify` - Transforms the input string into an [RFC 1123](https://tools.ietf.org/html/rfc1123) DNS Subdomain Name representation.
* `dnsLabelize` - Transforms the input string into an [RFC 1123](https://tools.ietf.org/html/rfc1123) DNS Label Name representation.
* `escapeRegExp` - Escapes characters in a regular expression string. This is not strictly tied to Kubernetes itself but is useful in common `ConfigMap` manifests such as Prometheus configuration files.

## Support functions

In addition to the filters, the package exports some ancillary support functions:

* `validateDnsSubdomain` - Throws a detailed error if the input string is not a valid DNS Subdomain Name.
* `isValidDnsSubdomain` - Returns a boolean value indicating if the input string is or is not a valid DNS Subdomain Name.

## Usage

The following code creates a Nunjucks environment and adds the filters using the same names as the exported functions.

```js
require('@opsani/nunjucks-kubernetes-filters');

let nunjucksEnv = new nunjucks.Environment(
    new nunjucks.FileSystemLoader('templates'),
    { throwOnUndefined: true }
);
nunjucksEnv.addFilter('dnsSubdomainify', dnsSubdomainify);
nunjucksEnv.addFilter('dnsLabelize', dnsLabelize);
nunjucksEnv.addFilter('escapeRegExp', escapeRegExp);
```

Then with your manifest template (where `optimizerId` is an arbitrary string that you wish to derive identifiers from):

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ optimizerId | dnsSubdomainify }}
  labels:
      app.kubernetes.io/name: my-app
      servo.opsani.com/optimizer: {{ optimizerId | dnsLabelize }}
```

## Running tests

If [Jest](https://jestjs.io/) is installed globally, run `jest`.

Otherwise, run `npm test`.

## License

Distributed under the terms of the Apache 2.0 Open Source license.

A copy of the license is provided in the [LICENSE](LICENSE) file at the root of
the repository.
