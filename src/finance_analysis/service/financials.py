import yfinance as yf

def get_income_stmt(symbol: str):
    """
    Args:
        symbol: the symbol of the ticker.

    Returns:
        Void

    Raises:
        ValueError
    """
    ticker = yf.Ticker(symbol)
    ticker.get_income_stmt()

