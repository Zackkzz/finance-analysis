import { useEffect, useState } from 'react'
import type { StockSnapshot } from './types'

type StockState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; stock: StockSnapshot }

export function useStock() {
  const [state, setState] = useState<StockState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      setState({ status: 'error' })
      controller.abort()
    }, 30_000)

    async function loadStock() {
      try {
        const response = await fetch('/api/stock', { signal: controller.signal })
        if (!response.ok) throw new Error('Could not load stock data')
        const stock: StockSnapshot = await response.json()
        if (stock.prices.length === 0) throw new Error('No price history')
        if (!controller.signal.aborted) setState({ status: 'ready', stock })
      } catch {
        if (!controller.signal.aborted) setState({ status: 'error' })
      } finally {
        window.clearTimeout(timeout)
      }
    }

    void loadStock()
    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((previous) => previous + 1)
  }

  return { state, retry }
}
