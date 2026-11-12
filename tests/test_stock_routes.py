import unittest
from unittest.mock import call, patch

from fastapi.testclient import TestClient

from finance_analysis import stock_api
from finance_analysis.route.main import app
from finance_analysis.stocks import service
from finance_analysis.stocks.models import PricePoint, StockSnapshot


def snapshot(currency: str = "AUD") -> StockSnapshot:
    return StockSnapshot(
        currency=currency,
        financialCurrency="USD",
        prices=[PricePoint(date="2026-11-12", close=45.98, volume=1000)],
        metrics={},
    )


class StockRoutesTests(unittest.TestCase):
    def test_route_app_uses_live_stock_handler(self):
        stock = snapshot()
        with patch.object(stock_api, "get_stock", return_value=stock) as fetch:
            with TestClient(app) as client:
                for path in ["/api/stock?symbol=WTC.AX", "/stocks?symbol=WTC.AX"]:
                    response = client.get(path)
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual(response.json(), stock.model_dump())
                    self.assertEqual(response.headers["X-Data-Source"], "yahoo")
                    self.assertEqual(response.headers["Cache-Control"], "no-store")
        self.assertEqual(fetch.call_args_list, [call("WTC.AX"), call("WTC.AX")])

    def test_original_endpoint_defaults_to_wtc(self):
        stock = snapshot()
        with patch.object(stock_api, "get_stock", return_value=stock) as fetch:
            with TestClient(stock_api.app) as client:
                response = client.get("/api/stock")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), stock.model_dump())
        fetch.assert_called_once_with("WTC.AX")

    def test_upstream_error_is_returned_to_frontend(self):
        with patch.object(stock_api, "get_stock", side_effect=RuntimeError("Unavailable")):
            with patch.object(stock_api.logger, "exception"), TestClient(app) as client:
                response = client.get("/api/stock?symbol=WTC.AX")
        self.assertEqual(response.status_code, 502)
        self.assertIn("Yahoo Finance", response.json()["detail"])

    def test_cache_keeps_symbols_separate(self):
        wtc, aapl, refreshed = snapshot(), snapshot("USD"), snapshot()
        with patch.object(service, "snapshots", {}), patch.object(service, "monotonic", return_value=1000):
            with patch.object(service, "fetch_stock", side_effect=[wtc, aapl, refreshed]) as fetch:
                self.assertIs(service.get_stock("WTC.AX"), wtc)
                self.assertIs(service.get_stock("AAPL"), aapl)
                self.assertIs(service.get_stock("WTC.AX"), wtc)
                self.assertIs(service.get_stock("AAPL"), aapl)
                self.assertEqual(fetch.call_count, 2)
                with patch.object(service, "monotonic", return_value=1400):
                    self.assertIs(service.get_stock("WTC.AX"), refreshed)
                self.assertEqual(fetch.call_count, 3)


if __name__ == "__main__":
    unittest.main()
