import { Fragment, useEffect, useState } from 'react'
import { formatDate } from '../format'
import type { StockMatch } from '../types'
import { fetchIncomeStatement, type Frequency, type Period } from './api'

const groups = [
  { title: 'Revenue and operations', metrics: ['Total Revenue', 'Operating Revenue', 'Cost Of Revenue', 'Gross Profit', 'Operating Expense', 'Operating Income'] },
  { title: 'Earnings and taxes', metrics: ['EBITDA', 'EBIT', 'Net Interest Income', 'Pretax Income', 'Tax Provision', 'Net Income', 'Net Income Common Stockholders'] },
  { title: 'Per share and share counts', metrics: ['Basic EPS', 'Diluted EPS', 'Basic Average Shares', 'Diluted Average Shares'] },
]
const headlineMetrics = new Set(['Total Revenue', 'Gross Profit', 'Operating Income', 'Net Income'])
const number = new Intl.NumberFormat('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const retryStyle = 'min-h-11 cursor-pointer rounded-sm border border-rule bg-paper px-4 text-sm font-bold hover:bg-ticker'
const sectionLabels = { yearly: 'Annual', quarterly: 'Quarterly' } as const
const frequencies = ['yearly', 'quarterly'] as const

type StatementState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; periods: Period[] }

export function StockFinancials({ selection }: { selection: StockMatch }) {
  const [{ frequency, openedPeriods }, setPeriod] = useState<{
    frequency: Frequency
    openedPeriods: Frequency[]
  }>({ frequency: 'yearly', openedPeriods: ['yearly'] })

  function selectPeriod(option: Frequency) {
    setPeriod((previous) => ({
      frequency: option,
      openedPeriods: previous.openedPeriods.includes(option)
        ? previous.openedPeriods
        : [...previous.openedPeriods, option],
    }))
  }

  return (
    <main className="page-width pb-8">
      <div className="pt-[43px] pb-[30px] handset:pt-[26px] handset:pb-[22px]">
        <h1 className="text-[3.5rem]/[1.06] wrap-anywhere tracking-[-0.02em] handset:text-[2.55rem]/[1.06]">Financials</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
          <span className="rounded-sm bg-ticker px-2 py-1 font-bold text-ink">{selection.symbol}</span>
          {selection.name !== selection.symbol && <span>{selection.name}</span>}
          {selection.exchange && <span>{selection.exchange}</span>}
        </p>
      </div>
      <section className="overflow-hidden rounded-panel border border-rule bg-paper" aria-labelledby="income-statement-heading">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 handset:px-4">
          <div>
            <h2 id="income-statement-heading">Income statement</h2>
            <p className="mt-1.5 text-label text-muted">Figures in millions, except per-share amounts and rates.</p>
            <p className="mt-1 text-label text-muted">Reporting currency is unavailable.</p>
          </div>
          <div role="group" aria-label="Reporting period" className="flex gap-[3px] rounded-md bg-canvas p-[3px]">
            {frequencies.map((option) => (
              <button key={option} type="button" aria-pressed={frequency === option}
                className="min-h-11 cursor-pointer rounded-sm px-4 text-label font-bold hover:bg-ticker aria-pressed:bg-navy aria-pressed:text-on-navy"
                onClick={() => selectPeriod(option)}>
                {sectionLabels[option]}
              </button>
            ))}
          </div>
        </div>
        {openedPeriods.map((period) => (
          <div key={period} hidden={frequency !== period}>
            <StatementBody symbol={selection.symbol} frequency={period} />
          </div>
        ))}
      </section>
      <footer className="pt-4 text-label text-muted">
        Source{' '}
        <a className="underline underline-offset-[0.2em] hover:text-focus"
          href={`https://finance.yahoo.com/quote/${encodeURIComponent(selection.symbol)}/financials/`}>Yahoo Finance</a>
      </footer>
    </main>
  )
}

function StatementBody({ symbol, frequency }: { symbol: string; frequency: Frequency }) {
  const [state, setState] = useState<StatementState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = AbortSignal.timeout(30_000)
    const signal = AbortSignal.any([controller.signal, timeout])
    void fetchIncomeStatement(symbol, frequency, signal).then(
      (periods) => { if (!controller.signal.aborted) setState({ status: 'ready', periods }) },
      () => { if (!controller.signal.aborted) setState({ status: 'error' }) },
    )
    return () => controller.abort()
  }, [symbol, frequency, attempt])

  if (state.status === 'loading') {
    return <p className="border-t border-rule px-6 py-12 text-sm text-muted handset:px-4" role="status">Loading {sectionLabels[frequency].toLowerCase()} figures…</p>
  }
  if (state.status === 'error') {
    return (
      <div className="border-t border-rule px-6 py-10 handset:px-4">
        <p className="mb-3 text-sm text-muted" role="alert">The income statement could not be loaded for {symbol}.</p>
        <button type="button" className={retryStyle} onClick={() => {
          setState({ status: 'loading' })
          setAttempt((previous) => previous + 1)
        }}>Try again</button>
      </div>
    )
  }
  if (state.periods.length === 0) {
    return <p className="border-t border-rule px-6 py-12 text-sm text-muted handset:px-4" role="status">
      No {sectionLabels[frequency].toLowerCase()} income statement is available for {symbol}. Try changing the reporting period.
    </p>
  }
  return <StatementTable periods={state.periods} />
}

function StatementTable({ periods }: { periods: Period[] }) {
  const available = new Set(periods.flatMap(({ metrics }) => [...metrics.keys()]))
  const listed = new Set(groups.flatMap(({ metrics }) => metrics))
  const sections = [...groups, { title: 'Other line items', metrics: [...available].filter((metric) => !listed.has(metric)) }]
  return (
    <>
      {periods.length > 1 && <p className="hidden border-t border-rule px-4 py-2 text-label text-muted handset:block">Scroll across to compare periods.</p>}
      <div className="statement-scroll" role="region" aria-label="Income statement table" tabIndex={0}>
        <table className="statement-table">
          <caption className="sr-only">Income statement by period end date. A dash indicates an unavailable value.</caption>
          <thead>
            <tr>
              <th scope="col">Period ending</th>
              {periods.map(({ date }) => <th scope="col" key={date}><time dateTime={date}>{formatDate(date)}</time></th>)}
            </tr>
          </thead>
          {sections.map(({ title, metrics }) => {
            const visibleMetrics = metrics.filter((metric) => available.has(metric))
            if (visibleMetrics.length === 0) return null
            return (
              <tbody key={title}>
                <tr className="statement-group">
                  <th scope="rowgroup">{title}</th>
                  <td colSpan={periods.length} />
                </tr>
                {visibleMetrics.map((metric) => (
                  <tr key={metric} className={headlineMetrics.has(metric) ? 'statement-total' : undefined}>
                    <th scope="row">{metric}</th>
                    {periods.map(({ date, metrics: values }) => (
                      <td key={date}>
                        {values.has(metric)
                          ? formatFigure(metric, values.get(metric)!)
                          : <Fragment><span aria-hidden="true" className="text-muted">—</span><span className="sr-only">Unavailable</span></Fragment>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )
          })}
        </table>
      </div>
    </>
  )
}

function formatFigure(metric: string, value: number) {
  const isRate = metric === 'Tax Rate For Calcs'
  const scaled = isRate ? value * 100 : metric.endsWith('EPS') ? value : value / 1_000_000
  const magnitude = Math.abs(scaled)
  const display = magnitude > 0 && magnitude < 0.01 ? '<0.01' : number.format(magnitude)
  return `${scaled < 0 ? '−' : ''}${display}${isRate ? '%' : ''}`
}
