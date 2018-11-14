# Style Helper

[![NPM version](https://img.shields.io/npm/v/style-helper.svg?style=flat)](https://npmjs.org/package/style-helper)
[![NPM downloads](https://img.shields.io/npm/dm/style-helper.svg?style=flat)](https://npmjs.org/package/style-helper)
[![Build status](https://img.shields.io/travis/blakeembrey/style-helper.svg?style=flat)](https://travis-ci.org/blakeembrey/style-helper)
[![Test coverage](https://img.shields.io/coveralls/blakeembrey/style-helper.svg?style=flat)](https://coveralls.io/r/blakeembrey/style-helper?branch=master)

> **Style Helper** is a small utility for CSS-in-JS functions.

Uses [`csstype`](https://github.com/frenic/csstype) for improve DX.

## Installation

```
npm install style-helper --save
```

## Usage

```js
import { quote, url, objectify, merge, registerStyleSheet } from 'style-helper'
```

### Quote

Wrap a string in quotes (useful for the psuedo-element `content` property).

```js
registerStyle({
  '&:before': {
    content: quote('Hello World') //=> `"Hello World"`
  }
})
```

### URL

Wrap a string in the CSS `url()` function.

```js
registerStyle({
  backgroundImage: url('image.png') //=> `url("image.png")`
})
```

### Objectify

Turn a list of arguments into an object (`[key, value, ...]`).

```js
// Simple properties.
registerStyle(objectify('padding', 10)) //=> { padding: 10 }

// Array key for repeating property values.
registerStyle(objectify([
  [
    '& .b',
    { margin: 20 }
  ],
  [
    '& .a',
    { margin: 10 }
  ]
])) //=> { '& .a': { margin: 10 }, '& .b': { margin: 10 } }
```

### Merge

Merge CSS objects recursively.

```js
import { ellipsis } from './styles'

registerStyle(merge({ padding: 10 }, ellipsis)) //=> { padding: 10, ... }
```

### Register Style Sheet

Utility for registering a map of styles onto a `Style` object, such as [Free Style](https://github.com/blakeembrey/free-style). The styles can be objects or functions that return objects. The third `options` object argument supports `keyframes`, `hashRules`, `rules` and `css` objects to register alongside the stylesheet.

```js
import { create } from 'free-style'

const Style = create()

registerStyleSheet(Style, {
  link: {
    color: 'red'
  },
  button: (registry) => {
    const name = registry.registerKeyframes({
      from: { color: 'red' },
      to: { color: 'green' }
    })

    return {
      '&:hover': {
        animationName: name,
        animationDuration: '1s'
      }
    }
  }
}, {
  html: {
    margin: 0
  }
})
```

**Tip:** A fourth argument can be provided for the "debug prefix" (e.g. "component name").

## License

MIT license
