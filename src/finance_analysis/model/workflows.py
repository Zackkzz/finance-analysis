"""Ollama news analysis with a required article-reading step."""

import json
import logging

from finance_analysis.model.prompt import BUILD_NEWS_MESSAGES_PROMPT
from finance_analysis.model.schemas import ModelResponse
from finance_analysis.model.tool_handlers import read_articles
from finance_analysis.model.tools import READ_ARTICLES_TOOL, READ_ARTICLES_TOOL_NAME
from finance_analysis.service.news import NewsContent
from ollama import AsyncClient, Message, RequestError, ResponseError

HOST = "http://localhost:11434"

MODEL = "qwen3.5:9b"
ARTICLE_TEXT_BUDGET = 60_000
MAX_ARTICLE_CHARS = 16_000


logger = logging.getLogger(__name__)


async def require_news_analysis(
    symbol: str,
    news: list[NewsContent],
) -> tuple[str, int] | None:
    articles_by_id = {article.id: article for article in news}
    article_ids = list(articles_by_id)
    messages = [
        Message.model_validate(BUILD_NEWS_MESSAGES_PROMPT),
        Message(
            role="user",
            content=(
                "Call read_articles once with all article_ids below, in order. "
                "Wait for the tool result before writing any summary or analysis.\n"
                + json.dumps({"symbol": symbol, "article_ids": article_ids})
            ),
        ),
    ]
    options = {"temperature": 0, "num_ctx": 32768}
    try:
        client = AsyncClient(host=HOST)
        request = await client.chat(
            model=MODEL,
            messages=messages,
            tools=[READ_ARTICLES_TOOL],
            think=False,
            options=options,
        )

        call = _complete_read_call(request.message, article_ids)
        texts = await read_articles(
            call.function.arguments["article_ids"], articles_by_id
        )
        final_messages = [
            *messages,
            Message(role="assistant", tool_calls=[call]),
            Message(
                role="tool",
                tool_name=READ_ARTICLES_TOOL_NAME,
                content=json.dumps(
                    {"articles": _build_article_payload(news, texts)},
                    ensure_ascii=False,
                ),
            ),
            Message(
                role="user",
                content="All requested articles have been checked. Use the tool result to write the final JSON.",
            ),
        ]
        response = await client.chat(
            model=MODEL,
            messages=final_messages,
            format=ModelResponse.model_json_schema(),
            think=False,
            options=options,
        )
    except (ConnectionError, RequestError, ResponseError):
        logger.exception("Ollama news analysis failed")
        return None
    if not response.message.content:
        return None
    return response.message.content, len(texts)


def _complete_read_call(message: Message, article_ids: list[str]) -> Message.ToolCall:
    calls = message.tool_calls or []
    if len(calls) == 1:
        call = calls[0]
        if (
            call.function.name == READ_ARTICLES_TOOL_NAME
            and call.function.arguments == {"article_ids": article_ids}
        ):
            return call

    # Supply a complete batch if the model skips the tool or asks for extra or
    # missing IDs. Discard any draft written before the tool returned evidence.
    return Message.ToolCall(
        function=Message.ToolCall.Function(
            name=READ_ARTICLES_TOOL_NAME,
            arguments={"article_ids": article_ids},
        )
    )

def _build_article_payload(
    news: list[NewsContent],
    article_texts: dict[str, str],
) -> list[dict[str, object]]:
    per_article_budget = min(
        MAX_ARTICLE_CHARS, ARTICLE_TEXT_BUDGET // max(len(article_texts), 1)
    )
    articles: list[dict[str, object]] = []
    for article in news:
        text = article_texts.get(article.id)
        articles.append(
            {
                "id": article.id,
                "title": article.title,
                "published_at": article.pubDate.isoformat(),
                "publisher": article.provider.displayName,
                "article_text": text[:per_article_budget] if text else None,
                "article_text_truncated": bool(text and len(text) > per_article_budget),
                "excerpt": None
                if text
                else (article.summary or article.description or "")[:1000],
            }
        )
    return articles
