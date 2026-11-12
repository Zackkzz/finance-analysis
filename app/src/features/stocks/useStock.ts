import { useEffect, useState } from 'react'
import { fetchStock } from './api'
import type { StockSnapshot } from './types'

type StockState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; stock: StockSnapshot }

export function useStock() {
  const [state, setState] = useState<StockState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      setState({ status: 'error', message: 'The stock request timed out. Please try again.' })
      controller.abort()
    }, 30_000)

    async function loadStock() {
      try {
        const stock = await fetchStock(controller.signal)
        if (!controller.signal.aborted) setState({ status: 'ready', stock })
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Stock data could not be loaded. Please try again.',
          })
        }
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
