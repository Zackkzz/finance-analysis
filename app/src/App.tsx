import { useEffect, useState, type MouseEvent } from 'react'
import { STOCK_SYMBOL } from './features/stocks/api'
import { StockSearch } from './features/stocks/components/StockSearch'
import { StockFinancials } from './features/stocks/financials/StockFinancials'
import { StockOverview } from './features/stocks/StockOverview'
import type { StockMatch } from './features/stocks/types'

const defaultSelection: StockMatch = {
  symbol: STOCK_SYMBOL,
  name: 'WiseTech Global',
  exchange: 'Australian Securities Exchange',
  type: 'Equity',
}
const views = ['Overview', 'Financials'] as const
type View = typeof views[number]

function readLocation() {
  const params = new URLSearchParams(window.location.search)
  const symbol = params.get('symbol')?.trim().toUpperCase() || STOCK_SYMBOL
  const saved: StockMatch | undefined = window.history.state?.selection
  const selection = saved?.symbol === symbol
    ? saved
    : symbol === STOCK_SYMBOL ? defaultSelection : { symbol, name: symbol, exchange: '', type: '' }
  const view: View = params.get('view') === 'financials' ? 'Financials' : 'Overview'
  return { selection, view }
}

function tickerUrl(symbol: string, view: View) {
  const params = new URLSearchParams({ symbol })
  if (view === 'Financials') params.set('view', 'financials')
  return `?${params}`
}

export default function App() {
  const [{ selection, view }, setLocation] = useState(readLocation)

  useEffect(() => {
    function restoreLocation() { setLocation(readLocation()) }
    window.addEventListener('popstate', restoreLocation)
    return () => window.removeEventListener('popstate', restoreLocation)
  }, [])

  useEffect(() => {
    const identity = selection.name === selection.symbol ? selection.symbol : `${selection.name} (${selection.symbol})`
    document.title = `${identity}${view === 'Financials' ? ' Financials' : ''} | Market brief`
  }, [selection, view])

  function navigate(next: StockMatch, nextView: View) {
    const url = tickerUrl(next.symbol, nextView)
    if (next.symbol === selection.symbol && nextView === view) {
      window.history.replaceState({ selection: next }, '', url)
    } else {
      window.history.pushState({ selection: next }, '', url)
    }
    setLocation({ selection: next, view: nextView })
  }

  function followTab(event: MouseEvent<HTMLAnchorElement>, tab: View) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    event.preventDefault()
    if (view !== tab) navigate(selection, tab)
  }

  return (
    <>
      <header className="border-b border-rule bg-paper">
        <div className="page-width flex min-h-16 items-center justify-between gap-5 py-3 handset:flex-wrap handset:gap-3">
          <div className="flex items-center gap-2.5 font-[750]">
            <svg className="size-6 text-focus" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 18h18M4 13l5-5 5 3 6-6M15 5h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Market brief
          </div>
          <StockSearch onSelect={(next) => navigate(next, view)} />
        </div>
      </header>
      <div className="border-b border-rule bg-paper">
        <nav className="page-width flex gap-5" aria-label="Ticker pages">
          {views.map((tab) => (
            <a key={tab} href={tickerUrl(selection.symbol, tab)} onClick={(event) => followTab(event, tab)}
              aria-current={view === tab ? 'page' : undefined}
              className="flex min-h-11 items-center border-b-2 border-transparent px-1 text-sm font-bold text-muted hover:text-focus aria-[current=page]:border-focus aria-[current=page]:text-focus">
              {tab}
            </a>
          ))}
        </nav>
      </div>
      {view === 'Overview'
        ? <StockOverview key={selection.symbol} selection={selection} />
        : <StockFinancials key={selection.symbol} selection={selection} />}
    </>
  )
}
