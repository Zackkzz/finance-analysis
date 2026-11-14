import { useEffect, useState } from 'react'
import { fetchNews, fetchNewsAnalysis } from './api'
import type { StockNewsResponse } from './types'

type NewsState = {
  symbol: string
  status: 'loading' | 'analyzing' | 'ready' | 'error' | 'unavailable'
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
          setState({ symbol, status: data ? (data.articles.length > 0 ? 'analyzing' : 'ready') : 'unavailable', data })
        }
        if (data && data.articles.length > 0 && !controller.signal.aborted) {
          try {
            const analyzed = await fetchNewsAnalysis(symbol, data.articles, controller.signal)
            if (!controller.signal.aborted) {
              setState({ symbol, status: 'ready', data: analyzed })
            }
          } catch {
            // Analysis is optional; retain the already displayed news on failure.
            if (!controller.signal.aborted) {
              setState({ symbol, status: 'ready', data })
            }
          }
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


