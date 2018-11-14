import { create } from 'free-style'
import { quote, url, objectify, merge, registerStyleSheet, StyleSheetRegistry } from './index'

describe('style helper', () => {
  it('should quote a string', () => {
    expect(quote('testing')).toEqual('"testing"')
    expect(quote('"')).toEqual('"\\""')
  })

  it('should handle urls', () => {
    expect(url('/path.png')).toEqual('url("/path.png")')
  })

  it('should turn styles into an object', () => {
    expect(objectify([['padding', 10]])).toEqual({
      padding: 10
    })
  })

  it('should support objectifying keys as arrays', () => {
    const key = ['.a', '.b']

    expect(objectify([[key, { margin: 10 }]])).toEqual({
      '.a': { margin: 10 },
      '.b': { margin: 10 }
    })
  })

  it('should merge css object together', () => {
    expect(merge(
      {
        margin: 5,
        padding: 10
      },
      {
        '@media print': {
          margin: 0,
          padding: 0
        }
      },
      {
        '@media print': {
          padding: 5
        }
      }
    )).toEqual({
      margin: 5,
      padding: 10,
      '@media print': {
        margin: 0,
        padding: 5
      }
    })
  })

  it('should register style sheets', () => {
    const Style = create()

    const styles = registerStyleSheet(Style, {
      button: {
        color: 'red'
      }
    }, {
      html: {
        margin: 0
      }
    })

    expect(Object.keys(styles)).toEqual(['button'])
    expect(Style.getStyles()).toEqual(`.${styles.button}{color:red}html{margin:0}`)
  })

  it('should register style sheets with functions', () => {
    const Style = create()
    let keyframesHash: string | undefined

    const styles = registerStyleSheet(Style, {
      link: {
        color: 'red'
      },
      input: () => ({
        color: 'green'
      }),
      button: (registry: StyleSheetRegistry) => {
        keyframesHash = registry.registerKeyframes({
          from: { color: 'red' },
          to: { color: 'blue' }
        })

        return {
          animation: `${keyframesHash} 1s infinite`
        }
      }
    })

    expect(Object.keys(styles)).toEqual(['link', 'input', 'button'])

    expect(Style.getStyles()).toEqual(
      `.${styles.link}{color:red}.${styles.input}{color:green}` +
      `@keyframes ${keyframesHash}{from{color:red}to{color:blue}}` +
      `.${styles.button}{animation:${keyframesHash} 1s infinite}`
    )
  })
})
