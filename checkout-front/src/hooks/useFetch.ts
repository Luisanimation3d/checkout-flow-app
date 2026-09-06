import { useCallback, useRef, useState } from 'react'

type MethodOptions = 'GET' | 'POST' | 'PUT' | 'DELETE'

export const useFetch = <T = unknown>(baseUrl: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(
    async (url: string, method: MethodOptions, body: unknown = null) => {
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${baseUrl}${url}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })

        if (!response.ok) {
          // fetch no lanza error automáticamente en 4xx/5xx, hay que hacerlo manual
          const errorBody = await response.json().catch(() => null)
          throw new Error(errorBody?.message || `Error ${response.status}`)
        }

        const json = (await response.json()) as T
        setData(json)
        return json
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return undefined

        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        // solo la petición vigente puede apagar el loading; una abortada no debe pisar
        // el estado de la petición que la reemplazó
        if (abortControllerRef.current === controller) setLoading(false)
      }
    },
    [baseUrl],
  )

  const get = useCallback((url: string) => fetchData(url, 'GET'), [fetchData])
  const post = useCallback((url: string, body: unknown) => fetchData(url, 'POST', body), [fetchData])
  const put = useCallback((url: string, body: unknown) => fetchData(url, 'PUT', body), [fetchData])
  const del = useCallback((url: string) => fetchData(url, 'DELETE'), [fetchData])

  return { data, loading, error, get, post, put, del }
}
