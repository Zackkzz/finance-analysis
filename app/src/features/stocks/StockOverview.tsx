import { decimal, formatDate, signed } from './format'
import { PriceChart } from './components/PriceChart'
import type { StockSnapshot } from './types'
import { useStock } from './useStock'

const compact = new Intl.NumberFormat('en-AU', { notation: 'compact', maximumFractionDigits: 2 })
const missing = 'Unavailable'
const ledger = 'rounded-panel border border-rule bg-paper p-6 handset:p-[17px]'
const statusPanel = 'grid flex-1 place-content-center justify-items-center gap-4 text-center text-on-navy-muted'
const formatMoney = (value: number | null, currency: string | null) =>
  value === null || !currency ? missing : `${compact.format(value)} ${currency}`

function MarketMark() {
  return (
    <svg className="size-6 text-focus" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 18h18M4 13l5-5 5 3 6-6M15 5h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StockOverview() {
  const { state, retry } = useStock()

  return (
    <>
      <header className="border-b border-rule bg-paper">
        <div className="page-width flex min-h-16 items-center justify-between gap-3 handset:min-h-[54px]">
          <div className="flex items-center gap-2.5 font-[750]"><MarketMark /> Market brief</div>
          <div className="text-label text-muted">Australian equities</div>
        </div>
      </header>
      <main className="page-width">
        <div className="flex items-end justify-between gap-6 pt-[43px] pb-[30px] handset:grid handset:gap-5 handset:pt-[26px] handset:pb-[22px]">
          <div>
            <h1 className="text-[3.5rem]/[1.06] tracking-[-0.02em] handset:text-[2.55rem]/[1.06]">WiseTech Global</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-[7px] text-[0.85rem] text-muted">
              <span className="rounded-sm bg-ticker px-2 py-[3px] font-[730] tracking-[0.025em] text-ink">WTC.AX</span>
              <span>Australian Securities Exchange</span>
            </div>
          </div>
          {state.status === 'ready' && <Quote stock={state.stock} />}
        </div>
        {state.status === 'ready' ? <StockDetails stock={state.stock} /> : (
          <div className="stock-grid">
            <section className="chart-panel flex min-h-[407px] flex-col handset:min-h-80" aria-labelledby="chart-heading" aria-busy={state.status === 'loading'}>
              <h2 id="chart-heading">Price history</h2>
              {state.status === 'loading' ? (
                <div className={statusPanel} role="status"><p>Loading daily prices…</p></div>
              ) : (
                <div className={statusPanel}>
                  <p className="max-w-[35ch]" role="alert">Yahoo Finance data is unavailable. Check that the local stock API is running and try again.</p>
                  <button className="min-h-9 cursor-pointer rounded-sm bg-trace px-[11px] text-label font-bold text-navy hover:bg-retry-hover" type="button" onClick={retry}>Try again</button>
                </div>
              )}
            </section>
            <section className={ledger} aria-labelledby="market-heading">
              <h2 id="market-heading">Market snapshot</h2>
              <p className="mt-[13px] text-label text-muted">{state.status === 'loading' ? 'Loading market figures…' : 'Market figures are unavailable.'}</p>
            </section>
          </div>
        )}
        <footer className="flex flex-wrap justify-between gap-x-4 gap-y-1.5 pt-4 pb-7 text-[0.78rem] text-muted">
          <span>Source <a className="underline underline-offset-[0.2em] hover:text-focus" href="https://finance.yahoo.com/quote/WTC.AX/">Yahoo Finance</a></span>
          <span>Daily data may be delayed.</span>
        </footer>
      </main>
    </>
  )
}

function Quote({ stock }: { stock: StockSnapshot }) {
  const latest = stock.prices.at(-1)!
  const prior = stock.prices.at(-2)
  const change = prior ? latest.close - prior.close : null

  return (
    <div className="shrink-0 text-right text-label tabular-nums handset:text-left">
      <p className="text-muted">Daily price · <time dateTime={latest.date}>{formatDate(latest.date)}</time></p>
      <div className="text-[2.4rem]/[1.2] font-[740] tracking-[-0.035em] handset:text-[2rem]/[1.2]">{decimal.format(latest.close)} <span className="text-[0.86rem] tracking-normal text-muted">{stock.currency}</span></div>
      {change !== null && prior && (
        <p className={change > 0 ? 'text-gain' : change < 0 ? 'text-loss' : undefined}>
          {signed.format(change)}
          {prior.close !== 0 && ` (${signed.format(change / prior.close * 100)}%)`}
          <span className="text-muted"> vs previous session</span>
        </p>
      )}
    </div>
  )
}

function StockDetails({ stock }: { stock: StockSnapshot }) {
  const { currency, financialCurrency, metrics, prices } = stock
  const latest = prices.at(-1)!
  const low = metrics.fiftyTwoWeekLow
  const high = metrics.fiftyTwoWeekHigh
  const range = low !== null && high !== null
    ? `${decimal.format(low)}–${decimal.format(high)} ${currency}`
    : missing

  return (
    <>
      <div className="stock-grid">
        <PriceChart prices={prices} currency={currency} />
        <section className={ledger} aria-labelledby="market-heading">
          <h2 id="market-heading">Market snapshot</h2>
          <dl className="mt-5 border-t border-rule compact:grid compact:grid-cols-2 compact:gap-x-5 narrow:grid-cols-1">
            <Metric label="Market cap" value={formatMoney(metrics.marketCap, currency)} />
            <Metric label="P/E (trailing)" value={metrics.trailingPE === null ? missing : `${decimal.format(metrics.trailingPE)}×`} />
            <Metric label="52-week range" value={range} />
            <Metric label="Session volume" value={latest.volume === null ? missing : `${compact.format(latest.volume)} shares`} />
          </dl>
          <p className="mt-[13px] text-label text-muted">Volume is for {formatDate(latest.date)}.</p>
        </section>
      </div>
      <section className="mt-4 rounded-panel border border-rule bg-paper px-[25px] py-[21px] handset:p-[17px]" aria-labelledby="financial-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[5px]">
          <h2 id="financial-heading">Financial highlights</h2>
          <p className="text-label text-muted">Latest figures from Yahoo Finance{financialCurrency && ` · ${financialCurrency}`}</p>
        </div>
        <dl className="mt-[13px] grid grid-cols-4 border-t border-rule pt-[15px] handset:grid-cols-2 handset:gap-y-3.5">
          <Metric financial label="Revenue" value={formatMoney(metrics.totalRevenue, financialCurrency)} />
          <Metric financial label="Profit margin" value={metrics.profitMargins === null ? missing : `${decimal.format(metrics.profitMargins * 100)}%`} />
          <Metric financial label="Operating cash flow" value={formatMoney(metrics.operatingCashflow, financialCurrency)} />
          <Metric financial label="Free cash flow" value={formatMoney(metrics.freeCashflow, financialCurrency)} />
        </dl>
      </section>
    </>
  )
}

function Metric({ label, value, financial = false }: { label: string; value: string; financial?: boolean }) {
  const layout = financial
    ? 'border-l border-rule px-4 first:border-l-0 first:pl-0 handset:odd:border-l-0 handset:odd:pl-0'
    : 'flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-[3px] border-b border-rule py-4 handset:grid handset:content-start'
  const valueStyle = financial ? 'mt-[3px] text-[1.1rem]' : 'text-[0.91rem]'

  return (
    <div className={layout}>
      <dt className="text-label text-muted">{label}</dt>
      <dd className={`tabular-nums ${valueStyle} ${value === missing ? 'font-medium text-muted' : 'font-bold'}`}>
        {value}
      </dd>
    </div>
  )
}
