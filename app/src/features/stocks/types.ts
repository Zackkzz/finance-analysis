export type PricePoint = { date: string; close: number; volume: number | null }

export type StockSnapshot = {
  currency: string
  financialCurrency: string | null
  prices: PricePoint[]
  metrics: {
    marketCap: number | null
    trailingPE: number | null
    fiftyTwoWeekLow: number | null
    fiftyTwoWeekHigh: number | null
    totalRevenue: number | null
    profitMargins: number | null
    operatingCashflow: number | null
    freeCashflow: number | null
  }
}
