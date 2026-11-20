import pandas as pd
import yfinance as yf
import pandas_ta_classic as ta

def macd(symbol: str):
    ticker = yf.Ticker(ticker=symbol)
    data = ticker.history(period="60d", interval="1h")
    # Calculate the 12-period EMA
    data['EMA12'] = data['Close'].ewm(span=12, adjust=False).mean()

    # Calculate the 26-period EMA
    data['EMA26'] = data['Close'].ewm(span=26, adjust=False).mean()

    # Calculate MACD (the difference between 12-period EMA and 26-period EMA)
    data['MACD'] = data['EMA12'] - data['EMA26']

    # Calculate the 9-period EMA of MACD (Signal Line)
    data['Signal_Line'] = data['MACD'].ewm(span=9, adjust=False).mean()