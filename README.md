# Finance analysis

Market brief shows daily WiseTech Global (WTC.AX) prices and key financial figures from Yahoo Finance.

## Run locally

Start the FastAPI stock API from the repository root.

```sh
uv sync
uv run finance-analysis
```

For automatic backend reloads during development, run `uv run uvicorn finance_analysis.stock_api:app --reload`.

In a second terminal, start the frontend.

```sh
cd app
npm ci
npm run dev
```

Open the local URL printed by Vite. The Python API listens on port 8000, and Vite proxies `/api/stock` to it. The API caches successful responses for five minutes. An internet connection is required for Yahoo Finance data.

Open the [interactive API documentation](http://127.0.0.1:8000/docs) while the backend is running.

## Project layout

- `src/finance_analysis/stock_api.py` defines the FastAPI application and server entry point.
- `src/finance_analysis/stocks/models.py` defines stock response types.
- `src/finance_analysis/stocks/service.py` retrieves and caches Yahoo Finance stock data.
- `src/finance_analysis/stocks/news.py` retrieves and validates Yahoo Finance news.
- `src/finance_analysis/main.py` provides the raw Yahoo Finance exploration script.
- `app/src/features/stocks/` contains the stock overview, data hook, chart, types, and formatters.
- `docs/impeccable/` contains the product and design documentation.

The frontend commands and source layout are documented in [app/README.md](app/README.md).
