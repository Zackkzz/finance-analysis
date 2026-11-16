import { useEffect, useId, useRef, useState } from 'react'
import { searchStocks } from '../api'
import type { StockMatch } from '../types'

export function StockSearch({ onSelect }: { onSelect: (stock: StockMatch) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockMatch[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [attempt, setAttempt] = useState(0)
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const term = query.trim()

  useEffect(() => {
    if (!term) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const matches = await searchStocks(term, controller.signal)
        if (!controller.signal.aborted) {
          setResults(matches)
          setStatus('ready')
        }
      } catch {
        if (!controller.signal.aborted) setStatus('error')
      } finally {
        window.clearTimeout(timeout)
      }
    }, 300)
    const timeout = window.setTimeout(() => {
      controller.abort()
      setStatus('error')
    }, 15_000)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
      window.clearTimeout(timeout)
    }
  }, [term, query, attempt])

  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, id, open])

  function choose(match: StockMatch) {
    setOpen(false)
    onSelect(match)
  }

  return (
    <div className="stock-search" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <label className="sr-only" htmlFor={id}>Find a stock or ETF</label>
      <div className="search-field">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
        <input
          ref={input} id={id} type="text" role="combobox" autoComplete="off" spellCheck={false}
          placeholder="Search company or symbol"
          value={query} aria-expanded={open && !!term} aria-controls={`${id}-results`}
          aria-autocomplete="list" aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setResults([])
            setActive(-1)
            setStatus(event.target.value.trim() ? 'loading' : 'idle')
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') { setOpen(false); setActive(-1) }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              setOpen(true)
              setActive((previous) => results.length ? (previous < 0 ? (event.key === 'ArrowDown' ? 0 : results.length - 1) : (previous + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length) : -1)
            }
            if (event.key === 'Enter' && open && active >= 0 && results[active]) {
              event.preventDefault()
              choose(results[active])
            }
          }}
        />
        {query && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => {
          setQuery(''); setResults([]); setStatus('idle'); setActive(-1); input.current?.focus()
        }}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg></button>}
      </div>
      {open && term && <div className="search-popover">
        <div className="search-caption">{status === 'ready' ? `${results.length} matching securities` : 'Symbol lookup'}</div>
        <ul id={`${id}-results`} role="listbox" aria-label="Matching securities" aria-busy={status === 'loading'}>
          {results.map((match, index) => <li key={match.symbol} id={`${id}-${index}`} role="option" aria-selected={active === index}
            className={`search-result ${active === index ? 'is-active' : ''}`}
            onPointerMove={() => setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(match)}>
            <span className="search-symbol">{match.symbol}</span>
            <span className="search-name">{match.name}<span className="search-exchange">{[match.exchange, match.type].filter(Boolean).join(' · ')}</span></span>
            <svg className="search-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
          </li>)}
        </ul>
        <div role="status" className="search-message">
          {status === 'loading' && 'Searching securities…'}
          {status === 'ready' && results.length === 0 && <>No matches for “{term}”. Try a company name or ticker.</>}
          {status === 'error' && <>Search is unavailable. <button type="button" onClick={() => { setStatus('loading'); setAttempt((value) => value + 1) }}>Try again</button></>}
        </div>
        {status === 'ready' && results.length > 0 && <p className="search-hint">Use ↑ ↓ to browse · Enter to select</p>}
      </div>}
    </div>
  )
}
