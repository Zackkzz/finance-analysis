STOCK_NEWS_TOOL: dict[str, object] = {
    "type": "function",
    "function": {
        "name": "raw_extract",
        "description": (
            "Fetch recent stock-related news from Yahoo Finance. Returns article "
            "titles, summaries, publication times, providers, and source links. "
            "May return fewer articles than requested if items fail validation."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": (
                        "Yahoo Finance ticker symbol, including the exchange "
                        "suffix where applicable, such as WTC.AX or AAPL."
                    ),
                },
                "count": {
                    "type": "integer",
                    "description": (
                        "Positive number of news articles to request. "
                        "Defaults to 10 when omitted."
                    ),
                },
            },
            "required": ["symbol"],
        },
    },
}