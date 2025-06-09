const Database = require('better-sqlite3')
const db = new Database('./items.db')

db.exec(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fruit_id TEXT,
  fruit_name TEXT,
  year TEXT,
  endDay TEXT,
  avgPrice REAL,
  kg INTEGER
)`)

db.exec(`CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
)`)

module.exports = db
