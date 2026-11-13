import asyncio
import json

from ollama import AsyncClient, RequestError, ResponseError
from finance_analysis.model.tools import STOCK_NEWS_TOOL
from finance_analysis.stocks.news import raw_extract, NewsContent
from finance_analysis.model.prompt import BUILD_NEWS_MESSAGES_PROMPT
from finance_analysis.stocks.service import get_news

HOST = "http://localhost:11434"

MODEL = "qwen3.5:9b"

def build_news_messages(
    symbol: str,
    news: list[NewsContent],
) -> list[dict[str, str]]:
    return [
        BUILD_NEWS_MESSAGES_PROMPT,
        {
            "role": "user",
            "content": json.dumps(
                {
                    "symbol": symbol,
                    "articles": [
                        article.model_dump(mode="json")
                        for article in news
                    ],
                },
                ensure_ascii=False,
            ),
        },
    ]

async def require_news_analysis(symbol: str) -> str | None:
    try:
        client = AsyncClient(host=HOST)
        # only ask for 10 news by default
        news = get_news(symbol)

        response = await client.chat(
            model=MODEL,
            messages=build_news_messages(symbol, news),
        )

        return response.message.content

    except (RequestError, ResponseError) as err:
        print("Error:", err.error)

