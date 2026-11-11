"""FastAPI application and HTTP handlers for the stock overview."""

import logging

import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .stocks.models import ErrorResponse, StockSnapshot
from .stocks.service import SYMBOL, get_stock

logger = logging.getLogger(__name__)
app = FastAPI(title="Market brief API")


@app.exception_handler(StarletteHTTPException)
async def http_error_response(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    message = "Endpoint not found." if exc.status_code == 404 else str(exc.detail)
    payload: ErrorResponse = {"error": message}
    return JSONResponse(
        status_code=exc.status_code,
        content=payload,
        headers={**(exc.headers or {}), "Cache-Control": "no-store"},
    )


@app.get("/api/stock", responses={502: {"model": ErrorResponse}})
def read_stock(response: Response) -> StockSnapshot:
    response.headers["Cache-Control"] = "no-store"
    try:
        return get_stock()
    except Exception as exc:
        logger.exception("Could not fetch %s", SYMBOL)
        raise HTTPException(
            status_code=502,
            detail="Yahoo Finance price data is unavailable. Try again shortly.",
        ) from exc


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    uvicorn.run(app, host="127.0.0.1", port=8000)


if __name__ == "__main__":
    main()
