import yfinance as yf


def search(input: str, limit: int = 10, type: str | None = None):
    if type is None:
        return yf.Search(input, max_results=limit)
    elif type == "quotes":
        return yf.Search(input, max_results=limit).quotes
    elif type == "news":
        return yf.Search(input, max_results=limit).news
    elif type == "research":
        return yf.Search(input, max_results=limit).research
    else:
        raise ValueError(
            f"Given argument type: {type}, Expect: quotes | news | research"
        )
