from fastapi import FastAPI
import logging
import uvicorn
from finance_analysis.stocks.service import get_stock

PORT = 8000

app = FastAPI()

@app.get("/")
def root():
    return {"Server is running": f"on port {PORT}"}

@app.get("/stocks/")
async def read_stocks(symbol: str):
    return get_stock(symbol)

def main() -> None:
    logging.basicConfig(level=logging.INFO)
    uvicorn.run(app, host="127.0.0.1", port=PORT)


if __name__ == "__main__":
    main()