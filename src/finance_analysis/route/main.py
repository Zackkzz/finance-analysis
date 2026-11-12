from fastapi import FastAPI, Response
import logging
import uvicorn
from pydantic import BaseModel

from finance_analysis.stocks.models import StockSnapshot
from finance_analysis.stocks.news import NewsContent, raw_extract
from finance_analysis.model.no_tools import require_news_analysis

class AnalyzedNewsContent(NewsContent):
    analysis: str | None = None


class StockNewsResponse(BaseModel):
    symbol: str
    articles: list[AnalyzedNewsContent]
    summary: str | None = None

class AnalysisItem(BaseModel):
    id: str
    analysis: str

class ModelResponse(BaseModel):
    symbol: str
    analyses: list[AnalysisItem]
    summary: str | None



PORT = 8000

app = FastAPI()

@app.get("/")
def root():
    return {"Server is running": f"on port {PORT}"}

@app.get("/stocks", response_model=StockSnapshot)
@app.get("/api/stock", response_model=StockSnapshot)
def read_stocks(response: Response, symbol: str = "WTC.AX") -> StockSnapshot:
    """Return Yahoo Finance prices and metrics for the requested stock."""
    return read_stock(response, symbol)

@app.get("/api/news")
async def read_news(symbol: str, count: int = 10):
    news_content = raw_extract(symbol, count)
    model_response = await require_news_analysis(symbol)
    if model_response is None:
        raise RuntimeError("News analysis did not return a response")

    response = ModelResponse.model_validate_json(model_response)
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

    return StockNewsResponse(
        symbol=symbol,
        articles=articles,
        summary=response.summary,
    )


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    uvicorn.run(app, host="127.0.0.1", port=PORT)


if __name__ == "__main__":
    main()
