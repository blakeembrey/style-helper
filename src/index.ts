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
export function objectify <T extends string> (
  styles: Array<[T | T[], Style[T]]>
) {
  const obj: Record<T, Style[T]> = Object.create(null)

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
