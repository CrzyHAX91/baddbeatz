import os
import sqlite3

DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(__file__), '..', 'data', 'app.db'))
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
conn = sqlite3.connect(DB_PATH)
conn.execute('CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT)')
conn.commit()
conn.close()
print(f"Initialized database at {DB_PATH}")
