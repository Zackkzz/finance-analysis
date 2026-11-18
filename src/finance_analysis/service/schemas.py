"""Response models shared by stock data retrieval and the API."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, RootModel

"""Ticker model"""
class Ticker(BaseModel):
    symbol: str

class StockTickersList(BaseModel):
    tickers: list[Ticker] = Field(default_factory=list)

class LookupResult(BaseModel):
    """A financial instrument returned by Yahoo Finance lookup."""

    model_config = ConfigDict(extra="allow")

    symbol: str
    exchange: str | None = None
    shortname: str | None = None
    longname: str | None = None
    quoteType: str | None = None
    typeDisp: str | None = None
    exchDisp: str | None = None

"""Stocks Models"""

class PricePoint(BaseModel):
    date: str
    close: float
    volume: float | None


class StockSnapshot(BaseModel):
    currency: str
    financialCurrency: str | None
    prices: list[PricePoint]
    metrics: dict[str, float | None]


class ErrorResponse(BaseModel):
    error: str

"""News Models"""
class Url(BaseModel):
    url: str


class ContentProvider(BaseModel):
    displayName: str
    url: str


class ThumbNailResolution(Url):
    width: int
    height: int
    tag: str


class ThumbNail(BaseModel):
    originalUrl: str
    originalWidth: int
    originalHeight: int
    resolutions: list[ThumbNailResolution]

class PremiumFinance(BaseModel):
    isPremiumNews: bool


class Finance(BaseModel):
    premiumFinance: PremiumFinance
    stockTickers: list[Ticker]


class NewsContent(BaseModel):
    """Lack of `isHosted`, `finance` two properties from original response"""
    id: str
    contentType: str
    title: str
    description: str | None
    summary: str | None
    pubDate: datetime
    displayTime: datetime
    previewUrl: str | None
    provider: ContentProvider
    canonicalUrl: Url
    clickThroughUrl: Url | None
    thumbnail: ThumbNail | None

class FullNewsContent(NewsContent):
    isHosted: bool
    finance: Finance | None = None

class NewsSnapshot(BaseModel):
    id: str
    content: NewsContent

class NewsList(BaseModel):
    news: list[NewsSnapshot]



"""Financial Models"""
class IncomeStatement(BaseModel):
    """Income statement metrics for one reporting period."""

    model_config = ConfigDict(validate_by_alias=True, validate_by_name=True)

    tax_effect_of_unusual_items: float | None = Field(
        alias="Tax Effect Of Unusual Items", default=None
    )
    tax_rate_for_calcs: float | None = Field(alias="Tax Rate For Calcs", default=None)
    normalized_ebitda: float | None = Field(alias="Normalized EBITDA", default=None)
    total_unusual_items: float | None = Field(alias="Total Unusual Items", default=None)
    total_unusual_items_excluding_goodwill: float | None = Field(
        alias="Total Unusual Items Excluding Goodwill", default=None
    )
    net_income_from_continuing_operation_net_minority_interest: float | None = Field(
        alias="Net Income From Continuing Operation Net Minority Interest",
        default=None,
    )
    reconciled_depreciation: float | None = Field(alias="Reconciled Depreciation", default=None)
    reconciled_cost_of_revenue: float | None = Field(
        alias="Reconciled Cost Of Revenue", default=None
    )
    ebitda: float | None = Field(alias="EBITDA", default=None)
    ebit: float | None = Field(alias="EBIT", default=None)
    net_interest_income: float | None = Field(alias="Net Interest Income", default=None)
    interest_expense: float | None = Field(alias="Interest Expense", default=None)
    interest_income: float | None = Field(alias="Interest Income", default=None)
    normalized_income: float | None = Field(alias="Normalized Income", default=None)
    net_income_from_continuing_and_discontinued_operation: float | None = Field(
        alias="Net Income From Continuing And Discontinued Operation", default=None
    )
    diluted_average_shares: float | None = Field(alias="Diluted Average Shares", default=None)
    basic_average_shares: float | None = Field(alias="Basic Average Shares", default=None)
    diluted_eps: float | None = Field(alias="Diluted EPS", default=None)
    basic_eps: float | None = Field(alias="Basic EPS", default=None)
    net_income_common_stockholders: float | None = Field(
        alias="Net Income Common Stockholders", default=None
    )
    net_income: float | None = Field(alias="Net Income", default=None)
    net_income_including_noncontrolling_interests: float | None = Field(
        alias="Net Income Including Noncontrolling Interests", default=None
    )
    net_income_continuous_operations: float | None = Field(
        alias="Net Income Continuous Operations", default=None
    )
    tax_provision: float | None = Field(alias="Tax Provision", default=None)
    pretax_income: float | None = Field(alias="Pretax Income", default=None)
    other_income_expense: float | None = Field(alias="Other Income Expense", default=None)
    other_non_operating_income_expenses: float | None = Field(
        alias="Other Non Operating Income Expenses", default=None
    )
    special_income_charges: float | None = Field(alias="Special Income Charges", default=None)
    restructuring_and_mergern_acquisition: float | None = Field(
        alias="Restructuring And Mergern Acquisition", default=None
    )
    net_non_operating_interest_income_expense: float | None = Field(
        alias="Net Non Operating Interest Income Expense", default=None
    )
    total_other_finance_cost: float | None = Field(alias="Total Other Finance Cost", default=None)
    interest_expense_non_operating: float | None = Field(
        alias="Interest Expense Non Operating", default=None
    )
    interest_income_non_operating: float | None = Field(
        alias="Interest Income Non Operating", default=None
    )
    operating_income: float | None = Field(alias="Operating Income", default=None)
    operating_expense: float | None = Field(alias="Operating Expense", default=None)
    other_operating_expenses: float | None = Field(alias="Other Operating Expenses", default=None)
    depreciation_amortization_depletion_income_statement: float | None = Field(
        alias="Depreciation Amortization Depletion Income Statement", default=None
    )
    depreciation_and_amortization_in_income_statement: float | None = Field(
        alias="Depreciation And Amortization In Income Statement", default=None
    )
    amortization: float | None = Field(alias="Amortization", default=None)
    amortization_of_intangibles_income_statement: float | None = Field(
        alias="Amortization Of Intangibles Income Statement", default=None
    )
    depreciation_income_statement: float | None = Field(
        alias="Depreciation Income Statement", default=None
    )
    research_and_development: float | None = Field(
        alias="Research And Development", default=None
    )
    selling_general_and_administration: float | None = Field(
        alias="Selling General And Administration", default=None
    )
    selling_and_marketing_expense: float | None = Field(
        alias="Selling And Marketing Expense", default=None
    )
    general_and_administrative_expense: float | None = Field(
        alias="General And Administrative Expense", default=None
    )
    other_gand_a: float | None = Field(alias="Other Gand A", default=None)
    gross_profit: float | None = Field(alias="Gross Profit", default=None)
    cost_of_revenue: float | None = Field(alias="Cost Of Revenue", default=None)
    total_revenue: float | None = Field(alias="Total Revenue", default=None)
    operating_revenue: float | None = Field(alias="Operating Revenue", default=None)


class GetIncomeStmtResult(RootModel[dict[datetime, IncomeStatement]]):
    """Income statement values keyed by report date."""