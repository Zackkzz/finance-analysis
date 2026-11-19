import pydantic
from finance_analysis.service.schemas import GetIncomeStmtResult
from unittest.mock import Mock

from fastapi.testclient import TestClient

from finance_analysis.route import main as routes

class TestGet:
    def test_search_returns_matching_quotes(self, monkeypatch):
        quotes = [{"symbol": "AAPL", "shortname": "Apple Inc."}]
        search = Mock(return_value=quotes)
        monkeypatch.setattr(routes, "search", search)

        with TestClient(routes.app) as client:
            response = client.get(
                "/api/search",
                params={"input": "Apple", "limit": 8, "type": "quotes"},
            )

        assert response.status_code == 200
        assert response.json() == quotes
        search.assert_called_once_with("Apple", 8, "quotes")


    def test_search_returns_apple_ticker(self):
        with TestClient(routes.app) as client:
            response = client.get(
                "/api/search",
                params={"input": "AAPL", "limit": 8, "type": "quotes"},
            )

        assert response.status_code == 200, response.text
        quotes = response.json()
        assert isinstance(quotes, list), quotes
        assert any(quote["symbol"] == "AAPL" for quote in quotes), quotes

    def test_get_income_stmt(self):
        with TestClient(routes.app) as client:
            response = client.get(
                url='/api/income_stmt',
                params={"symbol": "WTC.AX", "freq": "yearly"}
            )
        result = response.json()
        assert response.status_code == 200, response.text

        result = GetIncomeStmtResult.model_validate(response.json())
        assert isinstance(result, GetIncomeStmtResult)
        assert isinstance(result.root, dict)