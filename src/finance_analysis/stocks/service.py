"""Yahoo Finance stock snapshots with a shared five-minute cache."""

import logging
import math
from threading import Lock
from time import monotonic
from typing import SupportsFloat, SupportsIndex, cast

import pandas as pd
import yfinance as yf

from .models import PricePoint, StockSnapshot

CACHE_SECONDS = 300
METRICS = (
    "marketCap",
    "trailingPE",
    "fiftyTwoWeekLow",
    "fiftyTwoWeekHigh",
    "totalRevenue",
    "profitMargins",
    "operatingCashflow",
    "freeCashflow",
)
logger = logging.getLogger(__name__)
snapshot_lock = Lock()
snapshots: dict[str, tuple[StockSnapshot, float]] = {}


def number(value: object) -> float | None:
    try:
        result = float(
            cast(SupportsFloat | SupportsIndex | str | bytes | bytearray, value)
        )
    except (TypeError, ValueError):
        return None
    return result if math.isfinite(result) else None


def fetch_stock(symbol: str) -> StockSnapshot:
    ticker = yf.Ticker(symbol)
    history = ticker.history(
        period="1y", interval="1d", auto_adjust=False, actions=False, timeout=8,
    )
    if history.empty:
        raise ValueError("Yahoo Finance returned no price history")

    prices: list[PricePoint] = []
    for date, row in history.sort_index().iterrows():
        close = number(row["Close"])
        if close is not None:
            prices.append(PricePoint(
                date=pd.Timestamp(cast(pd.Timestamp, date)).date().isoformat(),
                close=close,
                volume=number(row["Volume"]),
            ))
    if not prices:
        raise ValueError("Yahoo Finance returned no valid closing prices")

    try:
        info: dict[str, object] = ticker.get_info() or {}
    except Exception:
        logger.warning("Yahoo Finance fundamentals are unavailable", exc_info=True)
        info = {}

    currency = ticker.history_metadata.get("currency") or info.get("currency") or "AUD"
    return StockSnapshot(
        currency=cast(str, currency),
        financialCurrency=cast(str | None, info.get("financialCurrency")),
        prices=prices,
        metrics={key: number(info.get(key)) for key in METRICS},
    )


def get_stock(symbol: str) -> StockSnapshot:
    """
        read one stock symbol and fetch the relevant data
    """
    with snapshot_lock:
        cached = snapshots.get(symbol)
        if cached is None or monotonic() >= cached[1]:
            snapshot = fetch_stock(symbol)
            snapshots[symbol] = (snapshot, monotonic() + CACHE_SECONDS)
            return snapshot
        return cached[0]
