CREATE TABLE IF NOT EXISTS history (
    date_time DATETIME not NULL,
    open_price FLOAT,
    high_price FLOAT,
    low_price FLOAT,
    close_price FLOAT,
    volume INT,
    dividends FLOAT,
    stock_splits FLOAT
);