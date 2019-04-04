# Style Helper

[![NPM version](https://img.shields.io/npm/v/style-helper.svg?style=flat)](https://npmjs.org/package/style-helper)
[![NPM downloads](https://img.shields.io/npm/dm/style-helper.svg?style=flat)](https://npmjs.org/package/style-helper)
[![Build status](https://img.shields.io/travis/blakeembrey/style-helper.svg?style=flat)](https://travis-ci.org/blakeembrey/style-helper)
[![Test coverage](https://img.shields.io/coveralls/blakeembrey/style-helper.svg?style=flat)](https://coveralls.io/r/blakeembrey/style-helper?branch=master)

> **Style Helper** is a small utility for CSS-in-JS functions.

## Installation

```
npm install style-helper --save
```

## Usage

```js
import { quote, url, objectify, merge } from 'style-helper'
```

### Quote

Wrap a string in quotes (useful for the psuedo-element `content` property).

```js
css({
  '&:before': {
    content: quote('Hello World') //=> `"Hello World"`
  }
})
```

### URL

Wrap a string in the CSS `url()` function.

```js
css({
  backgroundImage: url('image.png') //=> `url("image.png")`
})
```

### Merge

Merge CSS objects recursively.

```js
import { ellipsis } from './styles'

css(merge({ padding: 10 }, ellipsis)) //=> { padding: 10, ... }
```

### Multi

Repeats the same style for multiple selectors ([reference issue](https://github.com/blakeembrey/free-style/issues/72)).

```js
css(multi(['& .a', '& .b'], { margin: 10 }))
```

### Objectify

Turn a list of arguments into an object (`...[key, value]`).

```js
// Simple properties.
css(objectify(
  ['padding', 10],
  ['margin', 10]
)) //=> { padding: 10, margin: 10 }

// Array key for repeating property values.
css(objectify(
  [
    ['& .a', '& .b'],
    { margin: 10 }
  ]
)) //=> { '& .a': { margin: 10 }, '& .b': { margin: 10 } }
```

## License

MIT license
