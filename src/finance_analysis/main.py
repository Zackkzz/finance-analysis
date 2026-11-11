"""Print raw Yahoo Finance information and one news item for exploration."""

import json

import yfinance as yf


def main() -> None:
    dat = yf.Ticker("WTC.AX")
    print(json.dumps(dat.info, indent=4))

    print(json.dumps(dat.get_news(count=1), indent=4))


if __name__ == "__main__":
    main()
