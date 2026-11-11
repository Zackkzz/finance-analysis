"""Response types shared by stock data retrieval and the API."""

from typing import TypedDict


class PricePoint(TypedDict):
    date: str
    close: float
    volume: float | None


class StockSnapshot(TypedDict):
    currency: str
    financialCurrency: str | None
    prices: list[PricePoint]
    metrics: dict[str, float | None]


class ErrorResponse(TypedDict):
    error: str


