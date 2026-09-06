import { act, renderHook } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  let listeners: Array<() => void>
  let matches: boolean

  beforeEach(() => {
    listeners = []
    matches = false

    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      get matches() {
        return matches
      },
      media: query,
      addEventListener: (_event: string, listener: () => void) => {
        listeners.push(listener)
      },
      removeEventListener: (_event: string, listener: () => void) => {
        listeners = listeners.filter((l) => l !== listener)
      },
    })) as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns the initial matches value from matchMedia', () => {
    matches = true
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(true)
  })

  it('updates when the media query change event fires', () => {
    matches = false
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(false)

    matches = true
    act(() => {
      listeners.forEach((listener) => listener())
    })

    expect(result.current).toBe(true)
  })
})
