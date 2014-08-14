# Stockpiler [![Build Status](https://travis-ci.org/thalmic/stockpiler.svg)](https://travis-ci.org/thalmic/stockpiler)

[![NPM](https://nodei.co/npm/stockpiler.png)](https://nodei.co/npm/stockpiler/)

Stockpiler is designed to be the easiest way to manage your [node.js](http://nodejs.org) project configuration. Aggregate options from environment-specific JSON files, environment variables, and CLI arguments, and easily define project-level defaults.

All configuration is merged into a single object to eliminate the need to know
beforehand in which form your configuration will be supplied.

## Installation

```bash
$ npm install stockpiler
```

## Usage

By default, Stockpiler looks for a `config` directory at your project's root. To
set defaults, add a `default.json` file populated with whatever you need.

```javascript
// All options passed to the stockpiler module are defaults and can be excluded
var config = require("stockpiler")({
    configDir: __dirname + "/../../config",
    envPrefix: "STOCKPILER",
    cacheConfig: true
});
```

## JSON Files

Stockpiler loads environment-specific JSON files based on your current
`process.env.NODE_ENV`.

## Environment Variables

Stockpiler searches your environment for variables prefixed with your
`envPrefix` plus a double underscore ("\_\_"). Nested levels are represented as
double underscores ("\_\_"), and variable camel casing is represented using single
underscores ("\_").

### Example

Calling your application with `STOCKPILER__DB__ENGINE-TYPE=postgres node index.js` will result in your `config` being
populated as so:

```javascript
{
    db: {
        engineType: "postgres"
    }
}
```

*NOTE: Stockpiler will perform type inferrence on passed config (eg. to string,
number, or boolean).*

## CLI Arguments

Stockpiler uses the [minimist](https://github.com/substack/minimist) library to
parse arguments. No prefix is necessary when working with arguments, and as they
are parsed case-sensitively no special syntax is necessary for proper casing.
Nested levels are represented by hyphens ("-");

### Example

Calling your application with `node index.js --argOne --nested-argTwo 42` will
result in your `config` being populated as so:

```javascript
{
    argOne: true,
    nested: {
        argTwo: 42
    }
}
```

## Precedence

Duplicate configuration options are merged in the following order:

1. default.json
2. &lt;`processs.env.NODE_ENV`&gt;.json
3. environment variables
4. CLI arguments

## Segmented Configuration

If you'd like to access configuration based on its source (though we recommend
against this in most circumstances), we also include `config._default`, `config._file`, `config._env`, and `config._arg`.

## License

The MIT License (MIT)

Copyright (c) 2014 Thalmic Labs Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

