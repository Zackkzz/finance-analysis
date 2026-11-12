import yfinance as yf
import pydantic as py

def get_stocks(symbol: list[str]):
    result = []
    data = yf.Tickers(symbol)


