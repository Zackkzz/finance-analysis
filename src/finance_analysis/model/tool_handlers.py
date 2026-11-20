"""Implementations of the tools exposed to Ollama."""

from collections.abc import Mapping, Sequence

from finance_analysis.service.article_text import load_article_texts
from finance_analysis.service.schemas import NewsContent


async def read_articles(
    article_ids: Sequence[str],
    articles_by_id: Mapping[str, NewsContent],
) -> dict[str, str]:
    """Fetch original text for IDs in the current news request."""
    return await load_article_texts(
        [articles_by_id[article_id] for article_id in article_ids]
    )
