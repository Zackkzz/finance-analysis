"""Response models shared by stock data retrieval and the API."""
from datetime import datetime
from pydantic import BaseModel

"""Ticker model"""
class Ticker(BaseModel):
    symbol: str

"""Stocks' models"""

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

"""News' models"""
class Url(BaseModel):
    url: str


class ContentProvider(BaseModel):
    displayName: str
    url: str


class ThumbNailResolution(Url):
    width: int
    height: int
    tag: str


class ThumbNail(BaseModel):
    originalUrl: str
    originalWidth: int
    originalHeight: int
    resolutions: list[ThumbNailResolution]

class PremiumFinance(BaseModel):
    isPremiumNews: bool


class Finance(BaseModel):
    premiumFinance: PremiumFinance
    stockTickers: list[Ticker]


class NewsContent(BaseModel):
    """lack of isHosted, finance properties"""
    id: str
    contentType: str
    title: str
    description: str | None
    summary: str | None
    pubDate: datetime
    displayTime: datetime
    previewUrl: str | None
    provider: ContentProvider
    canonicalUrl: Url
    clickThroughUrl: Url | None
    thumbnail: ThumbNail | None

class FullNewsContent(NewsContent):
    isHosted: bool
    finance: Finance | None = None

class NewsSnapshot:
    id: str
    content: NewsContent
