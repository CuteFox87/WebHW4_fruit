const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./items.db')

db.run(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fruit_id TEXT,
  fruit_name TEXT,
  year TEXT,
  endDay TEXT,
  avgPrice REAL,
  kg INTEGER
)`)

db.run(`CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
)`)

module.exports = db