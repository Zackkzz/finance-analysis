import yfinance as yf


def get_stocks(symbol: list[str]):
    yf.Tickers(symbol)


