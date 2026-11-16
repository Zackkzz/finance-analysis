import yfinance as yf

def get_income_stmt(symbol: str, freq: str):
    """Get relative income statement.

    Args:
        symbol: The symbol to search.
        freq: str "yearly" or "quarterly" or "trailing" Default is "yearly".

    Returns:

    Raises:

    """
    ticker = yf.Ticker(symbol)
    ticker.get_income_stmt(as_dict=True, freq=freq)
