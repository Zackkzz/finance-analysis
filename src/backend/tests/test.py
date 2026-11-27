
from finance_analysis.service.financials import fetch_income_stmt
from finance_analysis.service.schemas import GetIncomeStmtResult

SYMBOL = "WTC.AX"


class TestFinancial:
    def test_get_income_stmt(self):
        result = fetch_income_stmt(SYMBOL)
        assert GetIncomeStmtResult.model_validate(result)
