const ESCAPES: { [key: string]: string } = {
  '"': '\\"',
  '\\': '\\\\',
  '\n': '\\A'
}

const ESCAPE_REGEXP = new RegExp(`[${Object.keys(ESCAPES).join('|')}]`, 'g')

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
 * CSS Style object.
 */
export interface Style {
  [selector: string]: string | number | null | undefined | (string | number)[] | Style
}

/**
 * Turn a list of styles into an object.
 */
export function objectify <T extends string, U extends Style[T]> (
  ...styles: Array<[T | T[], U]>
) {
  const obj: Record<T, U> = Object.create(null)

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
 * Repeats the same style for multiple selectors.
 *
 * Reference: https://github.com/blakeembrey/free-style/issues/72.
 */
export function multi <T extends string, U extends Style> (
  selectors: T[],
  style: U
) {
  const obj: Record<T, U> = Object.create(null)
  for (const selector of selectors) obj[selector] = style
  return obj
}

/**
 * Check if an object looks like a style.
 */
export function isStyle (value: any): value is Style {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Recursive object merge type.
 */
export type Merge <T, U> = [T, U] extends [object, object]
  ? {
      [K in keyof T | keyof U]: K extends keyof (T | U)
        ? Merge<T[K], U[K]>
        : K extends keyof T
        ? T[K]
        : K extends keyof U
        ? U[K]
        : never
    }
  : U

/**
 * Merge CSS styles recursively.
 */
export function merge <T1 extends Style> (s1: T1): T1
export function merge <T1 extends Style, T2 extends Style> (s1: T1, s2: T2): Merge<T1, T2>
export function merge <T1 extends Style, T2 extends Style, T3 extends Style> (s1: T1, s2: T2, s3: T3): Merge<Merge<T1, T2>, T3>
export function merge <T1 extends Style, T2 extends Style, T3 extends Style, T4 extends Style> (s1: T1, s2: T2, s3: T3, s4: T4): Merge<Merge<Merge<T1, T2>, T3>, T4>
export function merge <T1 extends Style, T2 extends Style, T3 extends Style, T4 extends Style, T5 extends Style> (s1: T1, s2: T2, s3: T3, s4: T4, s5: T5): Merge<Merge<Merge<Merge<T1, T2>, T3>, T4>, T5>
export function merge <T extends Style, U extends Style> (...args: any[]) {
  const result: any = Object.create(null)

  for (const style of args) {
    for (const key of Object.keys(style)) {
      if (isStyle(result[key]) && isStyle(style[key])) {
        result[key] = merge(result[key] as Style, style[key] as Style)
      } else {
        result[key] = style[key]
      }
    }
  }

  return result
}
