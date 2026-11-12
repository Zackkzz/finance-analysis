"""Response models shared by stock data retrieval and the API."""

from pydantic import BaseModel


class PricePoint(BaseModel):
    date: str
    close: float
    volume: float | None


class StockSnapshot(BaseModel):
    currency: str
    financialCurrency: str | None
    prices: list[PricePoint]
    metrics: dict[str, float | None]


class ErrorResponse(BaseModel):
    error: str

