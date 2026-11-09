import yfinance as yf
import pandas as pd
import json

def main():
	dat = yf.Ticker("WTC.AX")
	print(json.dumps(dat.info, indent=4))

	print(json.dumps(dat.get_news(), indent=4))
	exit()

if __name__ == "__main__":
	main()