import logging
import uvicorn
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel, ValidationError
from finance_analysis.stocks.models import StockSnapshot
from finance_analysis.stocks.news import NewsContent
from finance_analysis.model.no_tools import require_news_analysis
from finance_analysis.model.schemas import ModelResponse
from finance_analysis.stocks.service import get_news, get_stock

class StockNewsResponse(BaseModel):
    symbol: str
    articles: list[NewsContent]

class AnalyzedNewsContent(NewsContent):
    analysis: str | None = None

class NewsAnalysisResponse(BaseModel):
    articles: list[AnalyzedNewsContent]
    summary: str | None = None

PORT = 8000
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
def root():
    return {"Server is running": f"on port {PORT}"}

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

@app.post("/api/news/analysis", response_model=NewsAnalysisResponse)
async def get_news_analysis(symbol: str, news_content: list[NewsContent]) -> NewsAnalysisResponse:
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
        logger.exception("The analysis service returned invalid JSON or schema for %s", symbol)
        raise HTTPException(
            status_code=502,
            detail="The analysis service returned an unexpected response.",
        ) from err
    analysis_by_id = {
        item.id: item.analysis
        for item in response.analyses
    }
    articles = [
        AnalyzedNewsContent.model_validate(
            {
                **article.model_dump(),
                "analysis": analysis_by_id.get(article.id),
            }
        )
        for article in news_content
    ]

    return NewsAnalysisResponse(
        articles=articles,
        summary=response.summary
    )

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
