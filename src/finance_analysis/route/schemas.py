from finance_analysis.service.schemas import (
    GetIncomeStmtResult,
    NewsContent,
    PricePoint,
)
from pydantic import BaseModel


class StockNewsResponse(BaseModel):
    symbol: str
    articles: list[NewsContent]


class AnalyzedNewsContent(NewsContent):
    analysis: str | None = None


class NewsAnalysisResponse(BaseModel):
    articles: list[AnalyzedNewsContent]
    summary: str | None = None
    summaryArticleCount: int = 0


class StockSnapshot(BaseModel):
    currency: str
    financialCurrency: str | None
    prices: list[PricePoint]
    metrics: dict[str, float | None]

class IncomeStmtSnapShot(GetIncomeStmtResult):
    """Income statement snapshot keyed by report date."""
