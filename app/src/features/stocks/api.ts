import type { PricePoint, StockSnapshot, StockMatch } from './types'

export const STOCK_SYMBOL = 'WTC.AX'
export const STOCK_ENDPOINT = '/api/stock'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPrice(value: unknown): value is PricePoint {
  return isRecord(value)
    && typeof value.date === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value.date)
    && Number.isFinite(Date.parse(value.date))
    && typeof value.close === 'number'
    && Number.isFinite(value.close)
    && value.close >= 0
    && (value.volume === null
      || (typeof value.volume === 'number' && Number.isFinite(value.volume)))
}

function nullableMetric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export async function fetchStock(symbol: string, signal: AbortSignal): Promise<StockSnapshot> {
  const query = new URLSearchParams({ symbol })
  const response = await fetch(`${STOCK_ENDPOINT}?${query}`, { signal })
  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message = isRecord(data) ? data.error ?? data.detail : null
    throw new Error(
      typeof message === 'string' ? message : 'Stock data could not be loaded. Please try again.',
    )
  }
  if (response.headers.get('X-Data-Source') === 'mock') {
    throw new Error('Live stock data is unavailable. The server returned sample data.')
  }
  if (!isRecord(data)
    || typeof data.currency !== 'string'
    || !(data.financialCurrency === null || typeof data.financialCurrency === 'string')
    || !Array.isArray(data.prices)
    || data.prices.length === 0
    || !data.prices.every(isPrice)
    || !isRecord(data.metrics)) {
    throw new Error('The stock response did not contain valid price history and market figures.')
  }

  const metrics = data.metrics
  return {
    currency: data.currency,
    financialCurrency: data.financialCurrency,
    prices: data.prices.toSorted((first, second) => first.date.localeCompare(second.date)),
    metrics: {
      marketCap: nullableMetric(metrics.marketCap),
      trailingPE: nullableMetric(metrics.trailingPE),
      fiftyTwoWeekLow: nullableMetric(metrics.fiftyTwoWeekLow),
      fiftyTwoWeekHigh: nullableMetric(metrics.fiftyTwoWeekHigh),
      totalRevenue: nullableMetric(metrics.totalRevenue),
      profitMargins: nullableMetric(metrics.profitMargins),
      operatingCashflow: nullableMetric(metrics.operatingCashflow),
      freeCashflow: nullableMetric(metrics.freeCashflow),
    },
  }
}

export async function searchStocks(input: string, signal: AbortSignal): Promise<StockMatch[]> {
  const query = new URLSearchParams({ input, limit: '8', type: 'quotes' })
  const response = await fetch(`/api/search?${query}`, { signal })
  if (!response.ok) throw new Error('Search is unavailable.')
  const data: unknown = await response.json()
  if (!Array.isArray(data)) throw new Error('Invalid search response.')
  const matches: StockMatch[] = []
  for (const item of data) {
    if (!isRecord(item) || typeof item.symbol !== 'string' || !item.symbol.trim()) continue
    if (matches.some((match) => match.symbol === item.symbol)) continue
    const text = (value: unknown) => typeof value === 'string' ? value : ''
    matches.push({
      symbol: item.symbol,
      name: text(item.shortname) || text(item.longname) || item.symbol,
      exchange: text(item.exchDisp) || text(item.exchange),
      type: text(item.typeDisp) || text(item.quoteType),
    })
  }
  return matches
}
