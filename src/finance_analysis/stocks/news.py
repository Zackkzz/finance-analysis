"""Validate news content returned by Yahoo Finance."""

from datetime import datetime
from pydantic import ValidationError
import yfinance as yf
from .models import NewsList, NewsContent

METRICS = ("id", "contentType", "title", "description", "summary", "pubDate")

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
