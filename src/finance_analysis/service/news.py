import logging

import yfinance as yf
from pydantic import ValidationError

from finance_analysis.service.schemas import NewsContent, NewsList

METRICS = ("id", "contentType", "title", "description", "summary", "pubDate")

logger = logging.getLogger(__name__)

def fetch_news(symbol: str, count: int = 10) -> NewsList:
    raw_news = yf.Ticker(symbol).get_news(count=count)
    try:
        return  NewsList(news=raw_news)
    except ValidationError:
        logger.exception(
            "Yahoo Finance returned invalid news for %s", symbol
        )
        raise



def get_news(symbol: str, count: int = 10) -> list[NewsContent]:
    news = fetch_news(symbol, count)
    result = raw_extract(news)
    return result



def raw_extract(news: NewsList) -> list[NewsContent]:
    list_news = news.news
    result: list[NewsContent] = []
    for each in list_news:
        each = each.model_dump()
        raw_content = each.get("content")
        try:
            content = NewsContent.model_validate(raw_content)
            result.append(content)
        except ValidationError as error:
            for issue in error.errors():
                print(issue["loc"], issue["msg"], issue["type"])
    return result
