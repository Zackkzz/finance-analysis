import type { NewsArticle, StockNewsResponse } from './types'

export const NEWS_ENDPOINT = '/api/news'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNullableText(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isArticle(value: unknown): value is NewsArticle {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && isNullableText(value.summary)
    && typeof value.pubDate === 'string'
    && isRecord(value.provider)
    && typeof value.provider.displayName === 'string'
    && isRecord(value.canonicalUrl)
    && typeof value.canonicalUrl.url === 'string'
    && (value.thumbnail === null
      || (isRecord(value.thumbnail) && typeof value.thumbnail.originalUrl === 'string'))
    && isNullableText(value.analysis)
}

export async function fetchNews(symbol: string, signal: AbortSignal): Promise<StockNewsResponse | null> {
  const query = new URLSearchParams({ symbol, count: '10' })
  const response = await fetch(`${NEWS_ENDPOINT}?${query}`, { signal })

  if (response.status === 404 || response.status === 501) return null
  if (!response.ok) throw new Error('Could not load news')

  const data: unknown = await response.json()
  if (!isRecord(data)
    || data.symbol !== symbol
    || !Array.isArray(data.articles)
    || !data.articles.every(isArticle)
    || !isNullableText(data.summary)) {
    throw new Error('Unexpected news response')
  }

  return { symbol, articles: data.articles, summary: data.summary }
}
