
import yfinance as yf

SYMBOL='WTC.AX'

# print(json.dumps(yf.Search("A", max_results=10).quotes, indent=4))

# print('-' * 15)
print(yf.Ticker('WTC.AX').get_balance_sheet())