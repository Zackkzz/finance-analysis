import logging
from math import isfinite

import yfinance as yf
from pydantic import ValidationError

from .schemas import GetIncomeStmtResult

logger = logging.getLogger(__name__)

def fetch_income_stmt(symbol: str, freq: str = 'yearly') -> GetIncomeStmtResult:
    """Get the response from yfinance.Ticker.get_income_stmt()
    Args:
        symbol: the symbol of the ticker.

    Returns:
        GetIncomeStmtResult: Response return from yfinance.

    Raises:
        ValidationError: pydantic Validation Error.
    """
    ticker = yf.Ticker(symbol)
    result = ticker.get_income_stmt(as_dict=True, pretty=True, freq=freq)
    # Yahoo supplies NaN when a line item is missing for one reporting period.
    periods = {
        date: {
            metric: value if value is not None and isfinite(value) else None
            for metric, value in metrics.items()
        }
        for date, metrics in result.items()
    }
    try:
        return GetIncomeStmtResult.model_validate(periods)
    except ValidationError:
        logger.exception("Yahoo Finance returned invalid income_stmt for %s", symbol)
        raise
