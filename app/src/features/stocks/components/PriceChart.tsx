import { useState, type PointerEvent } from 'react'
import { decimal, formatDate, signed } from '../format'

import type { PricePoint } from '../types'

const ranges = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 }
type Range = keyof typeof ranges

const monthFormat = new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'UTC' })

function startDate(date: string, months: number) {
  const start = new Date(date)
  const day = start.getUTCDate()
  start.setUTCDate(1)
  start.setUTCMonth(start.getUTCMonth() - months)
  const monthEnd = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0))
  start.setUTCDate(Math.min(day, monthEnd.getUTCDate()))
  return start.toISOString().slice(0, 10)
}

export function PriceChart({ prices, currency }: { prices: PricePoint[]; currency: string }) {
  const [range, setRange] = useState<Range>('6M')
  const latest = prices.at(-1)!
  const cutoff = startDate(latest.date, ranges[range])
  const visible = prices.filter(({ date }) => date >= cutoff)

  return (
    <section className="chart-panel" aria-labelledby="chart-heading">
      <div className="flex flex-wrap items-start justify-between gap-2.5 narrow:grid narrow:justify-items-start">
        <div>
          <h2 id="chart-heading">Price history</h2>
          <p className="mt-1 text-label text-on-navy-muted">Daily prices · {currency}</p>
        </div>
        <div className="flex gap-[3px] rounded-md bg-range-track p-[3px]" role="group" aria-label="Price history range">
          {(Object.keys(ranges) as Range[]).map((item) => (
            <button
              key={item}
              className="min-h-9 cursor-pointer rounded-sm px-[11px] text-label font-bold text-on-navy hover:bg-range-hover aria-pressed:bg-trace aria-pressed:text-navy handset:min-h-10 handset:px-2"
              type="button"
              aria-pressed={range === item}
              onClick={() => setRange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <Plot key={range} prices={visible} currency={currency} range={range} />
    </section>
  )
}

function Plot({ prices, currency, range }: { prices: PricePoint[]; currency: string; range: Range }) {
  const [cursor, setCursor] = useState<number | null>(null)
  const end = prices.length - 1
  const selected = Math.min(cursor ?? end, end)
  const active = prices[selected]
  const first = prices[0]
  const change = first.close === 0 ? null : (prices[end].close / first.close - 1) * 100

  const values = prices.map(({ close }) => close)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const roughStep = Math.max((max - min) / 4, 0.01)
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const step = ([1, 2, 2.5, 5, 10].find((size) => size * magnitude >= roughStep) ?? 10) * magnitude
  const bottom = Math.max(0, Math.floor((min - step * 0.1) / step) * step)
  const top = Math.ceil((max + step * 0.1) / step) * step
  const rows = Math.round((top - bottom) / step)
  const start = Date.parse(first.date)
  const span = Date.parse(prices[end].date) - start
  const points = prices.map(({ date, close }) => ({
    x: span === 0 ? 50 : ((Date.parse(date) - start) / span) * 100,
    y: ((top - close) / (top - bottom)) * 100,
  }))
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const marker = points[selected]
  const ticks = range === '1M' ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]
  const axisDate = (fraction: number) => {
    const date = new Date(start + span * fraction)
    return range === '1M' ? `${date.getUTCDate()} ${monthFormat.format(date)}` : monthFormat.format(date)
  }

  function inspect(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const closest = points.reduce((best, point, index) => (
      Math.abs(point.x - x) < Math.abs(points[best].x - x) ? index : best
    ), 0)
    setCursor(closest)
  }

  return (
    <>
      <div className="mt-[19px] flex min-h-[35px] items-baseline justify-between gap-2.5 tabular-nums">
        <div><strong className="text-[1.33rem]">{decimal.format(active.close)}</strong> <span className="text-[0.75rem] text-on-navy-muted">{currency}</span></div>
        <time className="text-label text-on-navy-muted" dateTime={active.date}>{formatDate(active.date)}</time>
      </div>
      <div className="mt-[7px] grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-[9px] handset:gap-x-[9px]">
        <div className="relative h-[205px] cursor-crosshair touch-pan-y focus-within:outline-2 focus-within:outline-offset-[5px] focus-within:outline-trace handset:h-[165px]" onPointerMove={inspect} onPointerDown={inspect}>
          <svg className="size-full overflow-visible" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Array.from({ length: rows + 1 }, (_, index) => (
              <line className="stroke-plot-grid stroke-1" vectorEffect="non-scaling-stroke" key={index} x1="0" x2="100" y1={index / rows * 100} y2={index / rows * 100} />
            ))}
            {end > 0 && (
              <>
                <polygon className="fill-plot-area" points={`0,100 ${line} 100,100`} />
                <polyline className="fill-none stroke-trace stroke-2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" points={line} />
              </>
            )}
            <line className="stroke-plot-cursor stroke-1" vectorEffect="non-scaling-stroke" strokeDasharray="3 4" x1={marker.x} x2={marker.x} y1="0" y2="100" />
          </svg>
          <span className="pointer-events-none absolute size-2 -translate-1/2 rounded-full bg-trace" aria-hidden="true" style={{ left: `${marker.x}%`, top: `${marker.y}%` }} />
          {end > 0 && (
            <input
              className="sr-only"
              type="range"
              min="0"
              max={end}
              value={selected}
              aria-label="Inspect daily price"
              aria-valuetext={`${formatDate(active.date)}, ${decimal.format(active.close)} ${currency}`}
              onChange={(event) => setCursor(event.currentTarget.valueAsNumber)}
            />
          )}
        </div>
        <div className="relative min-w-11 text-[0.73rem] text-on-navy-muted tabular-nums" aria-hidden="true">
          {Array.from({ length: rows + 1 }, (_, index) => (
            <span key={index} className="absolute right-0 -translate-y-1/2" style={{ top: `${index / rows * 100}%` }}>
              {decimal.format(top - index * step)}
            </span>
          ))}
        </div>
        <div className="flex justify-between text-[0.73rem] text-on-navy-muted tabular-nums" aria-hidden="true">
          {(end > 0 ? ticks : [0.5]).map((tick) => <span key={tick} className="only:mx-auto">{axisDate(tick)}</span>)}
        </div>
      </div>
      <div className="mt-[15px] flex justify-between gap-2.5 border-t border-plot-grid pt-[13px] text-label text-on-navy-muted">
        {end > 0 && <span>Drag or use arrow keys to inspect</span>}
        {end > 0 && change !== null && <span className="text-right whitespace-nowrap"><b className="text-on-navy tabular-nums">{signed.format(change)}%</b> in range</span>}
      </div>
    </>
  )
}
