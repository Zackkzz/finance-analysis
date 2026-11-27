from contextlib import contextmanager
from collections.abc import Generator
from pathlib import Path
import sqlite3

from pydantic import ValidationError
DB_NAME="finance_analysis.db"

INSERT_QUERY="""
    INSERT INTO history
        (date_time, open_price, high_price, low_price, close_price, volume, dividends, stock_splits)
    VALUES
        (:date_time, :open_price, :high_price, :low_price, :close_price, :volume, :dividends, :stock_splits);
"""

backend_dir = Path(__file__).resolve().parents[1]
db_path = backend_dir / "db" / DB_NAME





DELETE_HISTORY_QUERY="""DELETE FROM history;"""

@contextmanager
def connection() -> Generator[sqlite3.Connection]:
    con = sqlite3.connect(db_path)
    try:
        with con:
            yield con
    finally:
        con.close()

def insert_history(params):
    with connection() as con:
        con.executemany(INSERT_QUERY, params)

def delete_history_table():
    with connection() as con:
        con.execute(DELETE_HISTORY_QUERY)