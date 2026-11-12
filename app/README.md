# Market brief frontend

React, TypeScript, Vite, and Tailwind CSS power the WiseTech Global stock overview.

## Development

Start the backend using the [repository instructions](../README.md), then run the frontend from this directory.

```sh
npm ci
npm run dev
```

Vite proxies `/api` requests to the FastAPI backend on port 8000. Use `uv run uvicorn finance_analysis.route.main:app --reload` from the repository root to serve both live stock data and news.

## Source layout

- `src/App.tsx` mounts the stock overview.
- `src/features/stocks/StockOverview.tsx` presents the company quote and financial information.
- `src/features/stocks/useStock.ts` loads stock data and manages retries and cancellation.
- `src/features/stocks/api.ts` requests live WTC.AX data, validates prices, and normalizes missing market metrics.
- `src/features/stocks/types.ts` defines the stock response types.
- `src/features/stocks/format.ts` formats prices and dates.
- `src/features/stocks/components/PriceChart.tsx` renders the interactive price chart.
- `src/features/stocks/news/` contains the news display, API client, data hook, and response types.
- `src/index.css` defines Tailwind theme tokens and shared layout utilities.

## Checks

```sh
npm run build
npm run lint
```

## News integration

The news section requests `GET /api/news?symbol=WTC.AX&count=10` and supports article analysis and an overall AI summary. The response follows the [news API contract](docs/news-api.md) and [response JSON Schema](docs/news-response.schema.json).

It uses the existing news field names and accepts complete `NewsContent` objects with an added nullable `analysis` field. News loads independently of quotes. Missing endpoints display an unavailable state.

## Stock integration

The page requests `GET /api/stock?symbol=WTC.AX`. It consumes the backend's `StockSnapshot` fields and treats missing or non-finite metric values as unavailable. Prices are sorted by trading date before rendering.

Stock responses marked `X-Data-Source: mock` display an error so the page consistently uses live quotes. FastAPI `detail` and the stock app's `error` messages are supported.
