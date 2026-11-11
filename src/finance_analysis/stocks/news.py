"""Validate news content returned by Yahoo Finance."""

from datetime import datetime

import yfinance as yf
from pydantic import BaseModel, Field, ValidationError


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


class NewsContent(BaseModel):
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


class Ticker(BaseModel):
    symbol: str


class StockTickersList(BaseModel):
    tickers: list[Ticker] = Field(default_factory=list)


SYMBOL = "WTC.AX"
METRICS = ("id", "contentType", "title", "description", "summary", "pubDate")


def raw_extract(symbol: str, count: int = 10) -> list[NewsContent]:
    ticker = yf.Ticker(symbol)
    news = ticker.get_news(count=count)
    result: list[NewsContent] = []
    for each in news:
        raw_content = each.get("content")
        try:
            content = NewsContent.model_validate(raw_content)
            result.append(content)
        except ValidationError as error:
            for issue in error.errors():
                print(issue["loc"], issue["msg"], issue["type"])
    return result
