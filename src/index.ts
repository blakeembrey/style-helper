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
export function objectify (...args: PropertyValue[]) {
  const obj: Style = Object.create(null)

  for (let i = 0; i < args.length; i += 2) {
    obj[String(args[i])] = args[i + 1]
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
export type StyleValue <S extends string> = Style | StyleFn<S>

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
  options: Options<T> = {}
): StyleMap<T> {
  const styles: StyleMap<T> = Object.create(null)
  const keyframes: StyleMap<string> = Object.create(null)
  const hashRules: StyleMap<string> = Object.create(null)

  function invoke (style: StyleValue<T>) {
    if (typeof style === 'function') return style(styles, keyframes, hashRules)

    return style
  }

  if (typeof options.keyframes === 'object') {
    for (const key of Object.keys(options.keyframes)) {
      keyframes[key] = Style.registerKeyframes(invoke(options.keyframes[key]), key)
    }
  }

  if (Array.isArray(options.rules)) {
    for (const rule of options.rules) {
      Style.registerRule(rule[0], invoke(rule[1]))
    }
  }

  if (typeof options.hashRules === 'object') {
    for (const key of Object.keys(options.hashRules)) {
      const rule = options.hashRules[key]

      hashRules[key] = Style.registerHashRule(rule[0], invoke(rule[1]), key)
    }
  }

  if (typeof sheet === 'object') {
    for (const key of Object.keys(sheet) as T[]) {
      styles[key] = Style.registerStyle(invoke(sheet[key]), key)
    }
  }

  if (typeof options.css === 'object') {
    Style.registerCss(invoke(options.css))
  }

  return styles
}
