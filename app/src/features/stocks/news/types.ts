export type NewsArticle = {
  id: string
  title: string
  summary: string | null
  pubDate: string
  provider: { displayName: string }
  canonicalUrl: { url: string }
  thumbnail: { originalUrl: string } | null
  analysis: string | null
}

export type StockNewsResponse = {
  symbol: string
  articles: NewsArticle[]
  summary: string | null
}
