import { useState } from 'react'
import type { NewsArticle } from './types'
import { useStockNews } from './useStockNews'

const publicationDate = new Intl.DateTimeFormat('en-AU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function safeHttpUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined
  } catch {
    return undefined
  }
}

export function StockNews({ symbol }: { symbol: string }) {
  const { status, data, refresh } = useStockNews(symbol)
  const loading = status === 'loading'
  const analyzing = status === 'analyzing'
  const articles = data?.articles ?? []

  return (
    <section className="mt-8 border-t border-rule pt-6" aria-labelledby="news-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="news-heading">News &amp; analysis</h2>
          <p className="mt-1 text-label text-muted">Reporting and AI context for {symbol}</p>
        </div>
        <button
          type="button"
          className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-rule bg-paper px-3 text-label font-bold hover:bg-ticker disabled:cursor-wait disabled:opacity-60"
          onClick={refresh}
          disabled={loading}
        >
          <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M16 8a6 6 0 1 0 0 4M16 4v4h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {loading ? 'Loading news…' : 'Refresh news'}
        </button>
      </div>

      {status === 'error' && (
        <p className="mb-4 text-sm text-loss" role="alert">
          {data ? 'News could not be refreshed. Showing the previous result.' : 'News could not be loaded. Please try refreshing.'}
        </p>
      )}

      {data && articles.length > 0 ? (
        <div className="stock-grid items-start">
          <aside className="rounded-panel bg-ticker p-6 compact:order-first handset:p-[17px]" aria-labelledby="ai-summary-heading">
            <h3 id="ai-summary-heading" className="font-heading text-[1.25rem] font-bold">AI summary</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed wrap-anywhere">
              {analyzing ? 'Waiting for model analysis…' : data.summary?.trim() || 'An AI summary is not available for these articles.'}
            </p>
            <p className="mt-4 border-t border-rule pt-3 text-label leading-relaxed text-muted">
              AI-generated interpretation. Read the original reporting for context.
            </p>
          </aside>
          <ol className="col-start-1 row-start-1 divide-y divide-rule rounded-panel border border-rule bg-paper px-6 compact:col-auto compact:row-auto handset:px-[17px]">
            {articles.map((article) => <NewsItem key={article.id} article={article} analyzing={analyzing} />)}
          </ol>
        </div>
      ) : loading ? (
        <div className="rounded-panel border border-rule bg-paper p-6" role="status">
          <p className="text-sm text-muted">Loading news and analysis…</p>
          <div className="mt-5 space-y-3" aria-hidden="true">
            <div className="h-3 w-2/3 rounded bg-ticker" />
            <div className="h-3 w-full rounded bg-ticker" />
            <div className="h-3 w-4/5 rounded bg-ticker" />
          </div>
        </div>
      ) : (
        <p className="rounded-panel border border-rule bg-paper p-6 text-sm leading-relaxed text-muted" role="status">
          {status === 'unavailable'
            ? 'News and AI analysis are not available yet.'
            : status === 'error'
              ? 'Refresh news to try again.'
              : `No recent articles were found for ${symbol}.`}
        </p>
      )}
    </section>
  )
}

function NewsItem({ article, analyzing }: { article: NewsArticle; analyzing: boolean }) {
  const href = safeHttpUrl(article.canonicalUrl.url)
  const thumbnailUrl = safeHttpUrl(article.thumbnail?.originalUrl ?? '')
  const date = new Date(article.pubDate)
  const validDate = Number.isFinite(date.getTime())

  return (
    <li className="py-6 handset:py-5">
      <article>
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-label text-muted">
              <span>{article.provider.displayName || 'Source unavailable'}</span>
              {validDate && <time dateTime={article.pubDate}>{publicationDate.format(date)}</time>}
            </div>
            <h3 className="font-heading text-[1.35rem] leading-snug font-bold wrap-anywhere">
              {href ? (
                <a className="underline-offset-4 hover:text-focus hover:underline" href={href} target="_blank" rel="noreferrer">
                  {article.title}
                  <svg className="ml-1.5 inline size-3.5 align-baseline" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M5 11l6-6M5 5h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : article.title}
            </h3>
            {article.summary?.trim() && <p className="mt-2 max-w-[75ch] whitespace-pre-line text-sm leading-relaxed text-muted wrap-anywhere">{article.summary}</p>}
          </div>
          {thumbnailUrl && <NewsThumbnail key={thumbnailUrl} src={thumbnailUrl} />}
        </div>
        <div className="mt-4 border-t border-rule pt-3">
          <h4 className="text-label font-bold text-focus">AI analysis</h4>
          <p className="mt-1.5 max-w-[75ch] whitespace-pre-line text-sm leading-relaxed wrap-anywhere">
            {analyzing ? 'Waiting for model analysis…' : article.analysis?.trim() || 'AI analysis is not available for this article.'}
          </p>
        </div>
      </article>
    </li>
  )
}

function NewsThumbnail({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <img
      src={src}
      alt=""
      className="mt-0.5 h-20 w-28 shrink-0 rounded-md bg-ticker object-cover handset:h-16 handset:w-20"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

