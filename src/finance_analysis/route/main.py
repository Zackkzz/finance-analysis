import logging

import uvicorn
from pydantic import ValidationError, Field
from fastapi import FastAPI, HTTPException, Response
from typing import Annotated

from finance_analysis.model.no_tools import require_news_analysis
from finance_analysis.model.schemas import ModelResponse
from finance_analysis.service.news import NewsContent, get_news
from finance_analysis.service.search import search
from finance_analysis.service.stocks.service import get_stock
from finance_analysis.service.financials import fetch_income_stmt


from .schemas import (
    AnalyzedNewsContent,
    NewsAnalysisResponse,
    StockNewsResponse,
    StockSnapshot,
)
from finance_analysis.service.schemas import GetIncomeStmtResult

PORT = 8000
logger = logging.getLogger(__name__)

app = FastAPI()


# ------------------------------ Post Requests ------------------------------ #
@app.post("/api/news/analysis", response_model=NewsAnalysisResponse)
async def get_news_analysis(
    symbol: str, news_content: list[NewsContent]
) -> NewsAnalysisResponse:
    model_response = await require_news_analysis(symbol, news_content)
    if not model_response:
        logger.error("The analysis service returned no response for %s", symbol)
        raise HTTPException(
            status_code=502,
            detail="The analysis service returned no response.",
        )
    try:
        response = ModelResponse.model_validate_json(model_response)
    except ValidationError as err:
        logger.exception(
            "The analysis service returned invalid JSON or schema for %s", symbol
        )
        raise HTTPException(
            status_code=502,
            detail="The analysis service returned an unexpected response.",
        ) from err
    analysis_by_id = {item.id: item.analysis for item in response.analyses}
    articles = [
        AnalyzedNewsContent.model_validate(
            {
                **article.model_dump(),
                "analysis": analysis_by_id.get(article.id),
            }
        )
        for article in news_content
    ]

    return NewsAnalysisResponse(articles=articles, summary=response.summary)


# ------------------------------ Post Requests above ------------------------------ #


# ------------------------------ Get Requests ------------------------------ #
@app.get("/")
def root():
    return {"Server is running": f"on port {PORT}"}


@app.get("/health/live", status_code=200, tags=["Health"])
async def health_check():
    """Confirms the FastAPI server process is running."""
    return {"status": "alive"}


@app.get("/api/search")
def get_search(input: str, limit: int = 10, type: str | None = None):
    try:
        return search(input, limit, type)
    except ValueError as err:
        raise HTTPException(
            status_code=422, detail="The given `type` query is incorrect."
        ) from err


@app.get("/api/stock", response_model=StockSnapshot)
def read_stocks(response: Response, symbol: str = "WTC.AX") -> StockSnapshot:
    """Return Yahoo Finance prices and metrics for the requested stock."""
    return get_stock(symbol)


@app.get("/api/news")
async def read_news(symbol: str, count: int = 10):
    try:
        news_content = get_news(symbol, count)
    except ValidationError as err:
        raise HTTPException(
            status_code=502,
            detail="The news provider returned an unexpected response.",
        ) from err

    articles = [
        NewsContent.model_validate(
            {
                **article.model_dump(),
            }
        )
        for article in news_content
    ]

    return StockNewsResponse(
        symbol=symbol,
        articles=articles,
    )


@app.get("/api/income_stmt")
async def get_income_stmt(symbol: str, freq: str = 'yearly') -> GetIncomeStmtResult:
    try:
        result = fetch_income_stmt(symbol, freq=freq)
    except ValidationError as err:
        raise HTTPException(
            status_code=502,
            detail="The financial provider returned an unexpected response."
        ) from err
    return result
# ------------------------------ Get Requests above ------------------------------ #

# ------------------------------ Run time ------------------------------ #
def main() -> None:
    logging.basicConfig(level=logging.INFO)
    uvicorn.run(app, host="127.0.0.1", port=PORT)


def dev() -> None:
    uvicorn.run(
        "finance_analysis.route.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    main()
