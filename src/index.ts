const ESCAPES: { [key: string]: string } = {
  '"': '\\"',
  '\\': '\\\\',
  '\n': '\\A'
}

const ESCAPE_REGEXP = new RegExp(`[${Object.keys(ESCAPES).join('|')}]`, 'g')

/**
 * Valid property values.
 */
export type PropertyValue = null | undefined | number | boolean | string | Array<null | undefined | number | boolean | string>

/**
 * Valid style object.
 */
export interface Style {
  [selector: string]: PropertyValue | Style
}

/**
 * Escape a string for use in double quotes.
 */
export function escape (value: string) {
  return value.replace(ESCAPE_REGEXP, x => ESCAPES[x])
}

/**
 * Quote a string for use in CSS.
 */
export function quote (value: string) {
  return `"${escape(value)}"`
}

/**
 * Wrap a string in a CSS `url()` function.
 */
export function url (value: string) {
  return `url(${quote(value)})`
}

/**
 * Turn a list of styles into an object.
 */
export function objectify (...args: (PropertyValue | Style)[]) {
  const obj: Style = Object.create(null)

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]
    const value = args[i + 1]

    if (Array.isArray(key)) {
      for (let j = 0; j < key.length; j++) {
        obj[String(key[j])] = value
      }
    } else {
      obj[String(key)] = value
    }
  }

  return obj
}

/**
 * Check if an object looks like a style.
 */
export function isStyle (value: any): value is Style {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Merge a list of styles together.
 */
export function merge (...styles: Style[]) {
  const result: Style = Object.create(null)

  for (const style of styles) {
    for (const key of Object.keys(style)) {
      const value = style[key]

      if (isStyle(value) && isStyle(result[key])) {
        result[key] = merge(result[key] as Style, value)
      } else {
        result[key] = value
      }
    }
  }

  return result
}

/**
 * Style sheet compatible object.
 */
export interface Registry {
  registerStyle (style: Style, displayName?: string): string
  registerKeyframes (style: Style, displayName?: string): string
  registerHashRule (prefix: string, style: Style, displayName?: string): string
  registerRule (rule: string, style: Style): void
  registerCss (style: Style): void
}

/**
 * Types allowed for style objects.
 */
export type StyleValue <S extends string> = StyleFn<S> | Style

/**
 * Input object for registering a style sheet.
 */
export type StyleSheet <T extends string> = {
  [P in T]: StyleValue<T>
}

/**
 * Styles as a map.
 */
export type StyleMap <T extends string> = {
  [K in T]: string
}

/**
 * Immediately invoked style functions.
 */
export type StyleFn <T extends string> = (
  styles: StyleMap<T>,
  keyframes: StyleMap<string>,
  hashRules: StyleMap<string>
) => Style

/**
 * Options available for `registerStyleSheet`.
 */
export interface Options <S extends string> {
  lazy?: boolean
  keyframes?: {
    [key: string]: StyleValue<S>
  }
  rules?: Array<[string, StyleValue<S>]>
  hashRules?: {
    [key: string]: [string, StyleValue<S>]
  }
  css?: StyleValue<S>
}

/**
 * Register a style sheet object with support for functions.
 */
export function registerStyleSheet <T extends string> (
  Style: Registry,
  sheet?: StyleSheet<T>,
  options: Options<T> = {},
  registeredName?: string
): StyleMap<T> {
  const styles: StyleMap<T> = Object.create(null)
  const keyframes: StyleMap<string> = Object.create(null)
  const hashRules: StyleMap<string> = Object.create(null)
  const prefix = registeredName ? `${registeredName}_` : ''

  function invoke (style: StyleValue<T>) {
    if (typeof style === 'function') return style(styles, keyframes, hashRules)

    return style
  }

  function register (obj: StyleMap<string>, key: string, compute: () => string) {
    if (!options.lazy) {
      const value = compute()
      return Object.defineProperty(obj, key, { enumerable: true, value })
    }

    return Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        const value = compute()
        Object.defineProperty(obj, key, { enumerable: true, value })
        return value
      }
    })
  }

  if (typeof options.keyframes === 'object') {
    for (const key of Object.keys(options.keyframes)) {
      const keyframe = options.keyframes[key]

      register(keyframes, key, () => {
        return Style.registerKeyframes(invoke(keyframe), prefix + key)
      })
    }
  }

  if (typeof options.hashRules === 'object') {
    for (const key of Object.keys(options.hashRules)) {
      const [hashKey, hashRule] = options.hashRules[key]

      register(hashRules, key, () => {
        return Style.registerHashRule(hashKey, invoke(hashRule), prefix + key)
      })
    }
  }

  if (typeof sheet === 'object') {
    for (const key of Object.keys(sheet) as T[]) {
      const style = sheet[key]

      register(styles, key, () => {
        return Style.registerStyle(invoke(style), prefix + key)
      })
    }
  }

  if (Array.isArray(options.rules)) {
    for (const [key, value] of options.rules) {
      Style.registerRule(key, invoke(value))
    }
  }

  if (typeof options.css === 'object') {
    Style.registerCss(invoke(options.css))
  }

  return styles
}
