"""Structured output expected from news analysis."""

from pydantic import BaseModel


class AnalysisItem(BaseModel):
    id: str
    analysis: str


class ModelResponse(BaseModel):
    symbol: str
    summary: str | None
    analyses: list[AnalysisItem]
