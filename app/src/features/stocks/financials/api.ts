export type Frequency = 'yearly' | 'quarterly'
export type Period = { date: string; metrics: Map<string, number> }

export async function fetchIncomeStatement(symbol: string, freq: Frequency, signal: AbortSignal): Promise<Period[]> {
  const query = new URLSearchParams({ symbol, freq })
  const response = await fetch(`/api/income_stmt?${query}`, { signal })
  if (!response.ok) throw new Error('The income statement could not be loaded.')

  const data: unknown = await response.json()
  if (!isRecord(data)) throw new Error('The income statement response was invalid.')

  const periods: Period[] = []
  for (const [timestamp, values] of Object.entries(data)) {
    const date = timestamp.slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || !isRecord(values)) {
      throw new Error('The income statement response was invalid.')
    }

    const metrics = new Map<string, number>()
    for (const [name, value] of Object.entries(values)) {
      if (typeof value === 'number' && Number.isFinite(value)) metrics.set(name, value)
    }
    if (metrics.size > 0) periods.push({ date, metrics })
  }
  return periods.sort((first, second) => second.date.localeCompare(first.date))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
