import { useEffect, useState } from 'react'
import { fetchNews } from './api'
import type { StockNewsResponse } from './types'

type NewsState = {
  symbol: string
  status: 'loading' | 'ready' | 'error' | 'unavailable'
  data: StockNewsResponse | null
}

export function useStockNews(symbol: string) {
  const [state, setState] = useState<NewsState>({ symbol, status: 'loading', data: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const data = await fetchNews(symbol, controller.signal)
        if (!controller.signal.aborted) {
          setState({ symbol, status: data ? 'ready' : 'unavailable', data })
        }
      } catch {
        if (!controller.signal.aborted) {
          setState((previous) => ({
            symbol,
            status: 'error',
            data: previous.symbol === symbol ? previous.data : null,
          }))
        }
      }
    }

    void load()
    return () => {
      controller.abort()
    }
  }, [symbol, attempt])

  function refresh() {
    setState((previous) => ({
      symbol,
      status: 'loading',
      data: previous.symbol === symbol ? previous.data : null,
    }))
    setAttempt((previous) => previous + 1)
  }

  const current: NewsState = state.symbol === symbol
    ? state
    : { symbol, status: 'loading', data: null }

  return { ...current, refresh }
}
