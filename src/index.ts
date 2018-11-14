import { PropertiesFallback } from 'csstype'

const ESCAPES: { [key: string]: string } = {
  '"': '\\"',
  '\\': '\\\\',
  '\n': '\\A'
}

const ESCAPE_REGEXP = new RegExp(`[${Object.keys(ESCAPES).join('|')}]`, 'g')

/**
 * Typed style object.
 *
 * Based on https://github.com/typestyle/typestyle/pull/245/files
 */
export interface Style extends PropertiesFallback<string | number> {
  /** State selector */
  '&:active'?: Style
  '&:any'?: Style
  '&:checked'?: Style
  '&:default'?: Style
  '&:disabled'?: Style
  '&:empty'?: Style
  '&:enabled'?: Style
  '&:first'?: Style
  '&:first-child'?: Style
  '&:first-of-type'?: Style
  '&:fullscreen'?: Style
  '&:focus'?: Style
  '&:hover'?: Style
  '&:indeterminate'?: Style
  '&:in-range'?: Style
  '&:invalid'?: Style
  '&:last-child'?: Style
  '&:last-of-type'?: Style
  '&:left'?: Style
  '&:link'?: Style
  '&:only-child'?: Style
  '&:only-of-type'?: Style
  '&:optional'?: Style
  '&:out-of-range'?: Style
  '&:read-only'?: Style
  '&:read-write'?: Style
  '&:required'?: Style
  '&:right'?: Style
  '&:root'?: Style
  '&:scope'?: Style
  '&:target'?: Style
  '&:valid'?: Style
  '&:visited'?: Style
  /**
   * Pseudo-elements
   * https://developer.mozilla.org/en/docs/Web/CSS/Pseudo-elements
   */
  '&::after'?: Style
  '&::before'?: Style
  '&::first-letter'?: Style
  '&::first-line'?: Style
  '&::selection'?: Style
  '&::backdrop'?: Style
  '&::placeholder'?: Style
  '&::marker'?: Style
  '&::spelling-error'?: Style
  '&::grammar-error'?: Style

  /** Children */
  '&>*'?: Style

  /**
   * Mobile first media query example
   */
  '@media screen and (min-width: 700px)'?: Style

  /**
   * Desktop first media query example
   */
  '@media screen and (max-width: 700px)'?: Style

  [selector: string]: string | number | (string | number)[] | Style | undefined
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
export function objectify <T extends keyof Style> (
  styles: Array<[T | T[], Style[T]]>
) {
  const obj: Pick<Style, T> = Object.create(null)

  for (const [key, value] of styles) {
    if (Array.isArray(key)) {
      for (const k of key) obj[k] = value
    } else {
      obj[key] = value
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
 * Internal registry wrapper.
 */
export class StyleSheetRegistry implements Registry {
  constructor (public registry: Registry, public prefix: string) {}

  registerStyle (style: Style, key = '') {
    return this.registry.registerStyle(style, this.prefix + key)
  }

  registerKeyframes (style: Style, key = '') {
    return this.registry.registerKeyframes(style, key)
  }

  registerHashRule (rule: string, style: Style, key = '') {
    return this.registry.registerHashRule(rule, style, this.prefix + key)
  }

  registerRule (rule: string, style: Style) {
    return this.registry.registerRule(rule, style)
  }

  registerCss (style: Style) {
    return this.registry.registerCss(style)
  }
}

/**
 * Types allowed for style objects.
 */
export type StyleValue = ((registry: StyleSheetRegistry) => Style) | Style

/**
 * Input object for registering a style sheet.
 */
export type StyleSheet <T extends string> = Record<T, StyleValue>

/**
 * Register a style sheet object with support for functions.
 */
export function registerStyleSheet <S extends string> (
  Style: Registry,
  sheet?: { [K in S]: StyleValue },
  css?: StyleValue,
  registeredName?: string
): Record<S, string> {
  const styles: Record<S, string> = Object.create(null)
  const prefix = registeredName ? `${registeredName}_` : ''
  const registry = new StyleSheetRegistry(Style, prefix)

  function toStyle (style: StyleValue) {
    return typeof style === 'function' ? style(registry) : style
  }

  // Register style properties.
  if (typeof sheet === 'object') {
    for (const key of Object.keys(sheet) as S[]) {
      styles[key] = Style.registerStyle(toStyle(sheet[key]))
    }
  }

  // Register global css when provided.
  if (typeof css === 'object') Style.registerCss(toStyle(css))

  return styles
}
