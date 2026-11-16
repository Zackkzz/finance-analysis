import yfinance as yf
import json
import pandas

print(json.dumps(yf.Search("A", max_results=10).quotes, indent=4))

print('-' * 15)
print(yf.Lookup("A").all)