# Stock news API contract

The frontend requests one news response independently of the stock quote endpoint. The endpoint path is defined in [api.ts](../src/features/stocks/news/api.ts). The response types are in [types.ts](../src/features/stocks/news/types.ts), with a matching [JSON Schema](news-response.schema.json).

## Request

```http
GET /api/news?symbol=WTC.AX&count=10
```

| Parameter | Type | Meaning |
| --- | --- | --- |
| `symbol` | string, required | Yahoo Finance symbol, including its exchange suffix |
| `count` | integer, optional | Requested number of articles, default 10 |

Return HTTP 200 with `Content-Type: application/json`. The response symbol must match the requested symbol. Return articles newest first with unique, stable `id` values. The frontend preserves their order.

## Response

This example uses fictional reporting and analysis to illustrate the contract.

```json
{
  "symbol": "WTC.AX",
  "articles": [
    {
      "id": "example-article-1",
      "title": "Example logistics software update",
      "summary": "An example publisher reports on a software product update.",
      "pubDate": "2026-11-12T03:00:00Z",
      "provider": {
        "displayName": "Example publisher"
      },
      "canonicalUrl": {
        "url": "https://example.com/news/software-update"
      },
      "thumbnail": {
        "originalUrl": "https://example.com/images/software-update.jpg",
        "originalWidth": 800,
        "originalHeight": 450,
        "resolutions": []
      },
      "analysis": "The update may support customer retention. This article alone does not establish an effect on earnings."
    }
  ],
  "summary": "The reporting concerns a product update. Its financial impact remains uncertain."
}
```

Article `thumbnail` uses the existing `NewsContent.thumbnail` structure. The frontend displays `thumbnail.originalUrl` and accepts the existing dimensions and `resolutions` array. Return `thumbnail: null` for articles without an image. Invalid, unsupported, or failed image URLs fall back to a text-only article.

Article `summary` is the original news summary. Article `analysis` and the response-level `summary` are AI output. All three accept `null`.

Text renders as plain text with preserved line breaks. The frontend opens only HTTP and HTTPS article links. Use ISO 8601 timestamps with a UTC offset or `Z`. Publication times display in the reader's local timezone.

## Reusing the current Python models

Each article retains the names and nesting used by `finance_analysis.stocks.news.NewsContent`. Its complete Pydantic JSON output can be returned, including extra fields such as `description` and `clickThroughUrl`. The frontend reads the subset above.

The following is a suggested backend model declaration for your implementation.

```python
from pydantic import BaseModel

from finance_analysis.stocks.news import NewsContent


class AnalyzedNewsContent(NewsContent):
    analysis: str | None = None


class StockNewsResponse(BaseModel):
    symbol: str
    articles: list[AnalyzedNewsContent]
    summary: str | None = None
```

FastAPI can serialize these models and their timestamps directly. Keep nullable fields in the response, including when AI output is unavailable. JSON output using `exclude_none=True` would omit fields required by the frontend contract.

## Availability and refresh

- Return `articles: []` and `summary: null` when there are no articles.
- Return the news with `analysis: null` and `summary: null` if generation is pending or unavailable. This allows articles to appear before local AI generation completes.
- Refresh news makes another GET request. The frontend performs no background polling or generation requests.
- The frontend retains the last successful result during refresh and if a refresh fails.
- Requests wait for the backend response without a frontend timeout. They are cancelled when the component unmounts, the symbol changes, or a new request replaces them.
- HTTP 404 or 501 displays the unavailable state while the endpoint is being implemented.
- Other non-success statuses or malformed responses display a retryable error. An optional error response can use the existing `{"error": "message"}` convention. Error bodies are not displayed directly.

The overall AI summary should describe the articles returned in this response. The frontend hides it when the article list is empty.
