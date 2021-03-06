import { quote, url, objectify, merge, multi } from './index'

describe('style helper', () => {
  it('should quote a string', () => {
    expect(quote('testing')).toEqual('"testing"')
    expect(quote('"')).toEqual('"\\""')
  })

  it('should handle urls', () => {
    expect(url('/path.png')).toEqual('url("/path.png")')
  })

  it('should turn styles into an object', () => {
    expect(objectify(['padding', 10])).toEqual({
      padding: 10
    })
  })

  it('should support objectifying keys as arrays', () => {
    const key = ['.a', '.b']

    expect(objectify([key, { margin: 10 }])).toEqual({
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

  it('should support multi style objects', () => {
    expect(multi(['& .a', '& .b'], { margin: 10 })).toEqual({
      '& .a': { margin: 10 },
      '& .b': { margin: 10 }
    })
  })
})
