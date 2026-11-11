# Market brief frontend

React, TypeScript, Vite, and Tailwind CSS power the WiseTech Global stock overview.

## Development

Start the backend using the [repository instructions](../README.md), then run the frontend from this directory.

```sh
npm ci
npm run dev
```

Vite proxies `/api` requests to the FastAPI backend on port 8000.

## Source layout

- `src/App.tsx` mounts the stock overview.
- `src/features/stocks/StockOverview.tsx` presents the company quote and financial information.
- `src/features/stocks/useStock.ts` loads stock data and manages retries and cancellation.
- `src/features/stocks/types.ts` defines the stock response types.
- `src/features/stocks/format.ts` formats prices and dates.
- `src/features/stocks/components/PriceChart.tsx` renders the interactive price chart.
- `src/index.css` defines Tailwind theme tokens and shared layout utilities.

## Checks

```sh
npm run build
npm run lint
```
