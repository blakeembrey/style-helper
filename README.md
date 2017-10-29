# Style Helper

[![NPM version](https://img.shields.io/npm/v/style-helper.svg?style=flat)](https://npmjs.org/package/style-helper)
[![NPM downloads](https://img.shields.io/npm/dm/style-helper.svg?style=flat)](https://npmjs.org/package/style-helper)
[![Build status](https://img.shields.io/travis/blakeembrey/style-helper.svg?style=flat)](https://travis-ci.org/blakeembrey/style-helper)
[![Test coverage](https://img.shields.io/coveralls/blakeembrey/style-helper.svg?style=flat)](https://coveralls.io/r/blakeembrey/style-helper?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/blakeembrey/style-helper.svg)](https://greenkeeper.io/)

> **Style Helper** is a small utility for CSS-in-JS functions.

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
    content: quote('Hello World')
  }
})
```

### URL

Wrap a string in the CSS `url()` function.

```js
registerStyle({
  backgroundImage: url('image.png')
})
```

### Objectify

Turn a list of arguments into an object.

```js
registerStyle(objectify('padding', 10))
```

### Merge

Merge CSS objects recursively.

```js
import { ellipsis } from './styles'

registerStyle(merge({ padding: 10 }, ellipsis))
```

### Register Style Sheet

Utility for registering a map of styles onto a `Style` object (e.g. `free-style`). The styles can be objects or functions that return objects. The third `options` object argument supports `css`, `keyframes` and `rules` objects to also register.

```js
import { create } from 'free-style'

const Style = create()

registerStyleSheet(Style, {
  button: {
    color: 'red'
  }
}, {
  css: {
    html: {
      margin: 0
    }
  }
})
```

**Note:** Mirroring the underlying implementation, a fourth argument can be provided for the "debug prefix" (e.g. used for component names).

## License

MIT license
