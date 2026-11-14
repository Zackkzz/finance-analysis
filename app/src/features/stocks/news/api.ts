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
    || !data.articles.every(isArticle)) {
    throw new Error('Unexpected news response')
  }

  // Keep all provider fields: the analysis endpoint expects the full news content.
  return { symbol, articles: data.articles.map((article) => ({ ...article, analysis: null })), summary: null }
}

export async function fetchNewsAnalysis(
  symbol: string,
  articles: NewsArticle[],
  signal: AbortSignal,
): Promise<StockNewsResponse> {
  const query = new URLSearchParams({ symbol })
  const response = await fetch(`${NEWS_ENDPOINT}/analysis?${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articles),
    signal,
  })
  if (!response.ok) throw new Error('Could not load news analysis')

  const data: unknown = await response.json()
  if (!isRecord(data)
    || !Array.isArray(data.articles)
    || !data.articles.every((article: unknown) => isArticle(article) && isNullableText(article.analysis))
    || !isNullableText(data.summary)) {
    throw new Error('Unexpected news analysis response')
  }

  const analysisById = new Map(data.articles.map((article: NewsArticle) => [article.id, article.analysis]))
  return {
    symbol,
    articles: articles.map((article) => ({ ...article, analysis: analysisById.get(article.id) ?? null })),
    summary: data.summary,
  }
}
