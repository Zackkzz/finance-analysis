from pydantic import BaseModel, RootModel
from datetime import datetime

class history(BaseModel):
    open_price: float
    high_price: float
    low_price: float
    close_price: float
    volume: int
    dividends: float
    stock_splits: float
    date_time: datetime

class history_list(RootModel[list[history]]):
    pass
