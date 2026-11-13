import yfinance as yf
import json
print(json.dumps(yf.Ticker("WTC.AX").get_news(), indent=4))