import pydantic
import yfinance as yf
from backend.db.pool import insert_history
from backend.db.schemas import history_list

def add_history(symbol: str):
    ticker = yf.Ticker(ticker=symbol)
    data = ticker.history(period="60d", interval="1h")
    df = data
    df = df.reset_index()
    df['Date'] = df["Datetime"].dt.tz_convert("UTC")
    df = df.rename(columns={
        "Open": "open_price",
        "High": "high_price",
        "Low": "low_price",
        "Close": "close_price",
        "Volume": "volume",
        "Dividends": "dividends",
        "Stock Splits": "stock_splits",
        "Date": "date_time"
    })
    df = df.drop(columns="Datetime")
    records = df.to_dict(orient="records")

    for record in records:
        record["date_time"] = record["date_time"].isoformat(timespec="seconds")

    insert_history(records)

if __name__ == "__main__":
    add_history(symbol="WTC.AX")