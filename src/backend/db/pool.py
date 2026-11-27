import sqlite3
from collections.abc import Generator
from contextlib import contextmanager
from pathlib import Path

DB_NAME="finance_analysis.db"

CREATE_HISTORY_QUERY="""
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
"""

INSERT_QUERY="""
    INSERT INTO history
        (date_time, open_price, high_price, low_price, close_price, volume, dividends, stock_splits)
    VALUES
        (:date_time, :open_price, :high_price, :low_price, :close_price, :volume, :dividends, :stock_splits);
"""

DELETE_HISTORY_QUERY="""DELETE FROM history;"""

backend_dir = Path(__file__).resolve().parents[1]
db_path = backend_dir / "db" / DB_NAME

@contextmanager
def connection() -> Generator[sqlite3.Connection]:
    con = sqlite3.connect(db_path)
    try:
        with con:
            yield con
    finally:
        con.close()

def create_table():
    with connection() as con:
        con.execute(CREATE_HISTORY_QUERY)

def insert_history(params):
    with connection() as con:
        con.executemany(INSERT_QUERY, params)

def delete_history_table():
    with connection() as con:
        con.execute(DELETE_HISTORY_QUERY)