/* File: backend/app.js */
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const db = require('./db')
const fs = require('fs')
const { Parser } = require('json2csv')
const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} - ${new Date().toISOString()}`)
  next()
})


app.post('/api/refresh', async (req, res) => {
  try {
    const fruits = [
      { id: 'A1', name: '香蕉' },
      { id: 'B2', name: '鳳梨（金鑽鳳梨）' },
      { id: 'G3', name: '酪梨' },
      { id: 'X6', name: '蘋果（富士）' },
      { id: 'T1', name: '西瓜（大西瓜）' },
      { id: 'S1', name: '葡萄（巨峰）' },
      { id: 'C1', name: '椪柑（橘子）' },
      { id: '45', name: '草莓' },
      { id: 'R1', name: '芒果（愛文）' },
      { id: 'Y1', name: '水蜜桃' }
    ]

    let totalInserted = 0

    for (const { id: fruit_id, name: fruit_name } of fruits) {
      const url = `https://www.twfood.cc/api/FarmTradeSumYears?filter=${encodeURIComponent(JSON.stringify({ order: 'endDay asc', where: { itemCode: fruit_id } }))}`
      const { data } = await axios.get(url)

      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('DELETE FROM items WHERE fruit_id = ?', [fruit_id], (err) => {
            if (err) return reject(err)

            const stmt = db.prepare(`INSERT INTO items (fruit_id, fruit_name, year, endDay, avgPrice, kg) VALUES (?, ?, ?, ?, ?, ?)`)
            let completed = 0

            if (data.length === 0) {
              stmt.finalize(resolve)
              return
            }

            for (const item of data) {
              stmt.run([fruit_id, fruit_name, item.year, item.endDay, item.avgPrice, item.kg], (err) => {
                if (err) return reject(err)

                completed++
                if (completed === data.length) {
                  stmt.finalize(() => resolve())
                }
              })
            }
          })
        })
      })

      totalInserted += data.length
    }

    db.run(`REPLACE INTO meta (key, value) VALUES (?, ?)`, ['last_updated', new Date().toISOString()], (err) => {
      if (err) return res.status(500).json({ error: '更新 meta 失敗: ' + err.message })
      res.json({ status: 'ok', total: totalInserted })
    })
  } catch (err) {
    res.status(500).json({ error: '處理失敗: ' + err.message })
  }
})



function buildYearQueryClause(query, params, year) {
  if (!year || year === '*') return

  if (year.includes('-')) {
    const [start, end] = year.split('-').map(Number)
    query += ' AND year BETWEEN ? AND ?'
    params.push(start, end)
  } else {
    query += ' AND year = ?'
    params.push(Number(year))
  }
  return query
}

app.get('/api/items', (req, res) => {
  const { year, fruit } = req.query
  let query = 'SELECT * FROM items WHERE 1=1'
  const params = []

  if (fruit) {
    query += ' AND fruit_id = ?'
    params.push(fruit)
  }

  query = buildYearQueryClause(query, params, year) || query
  query += ' ORDER BY endDay ASC'

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.get('/api/export', (req, res) => {
  const { fruit, year } = req.query
  let query = 'SELECT * FROM items WHERE 1=1'
  const params = []

  if (fruit) {
    query += ' AND fruit_id = ?'
    params.push(fruit)
  }

  query = buildYearQueryClause(query, params, year) || query
  query += ' ORDER BY endDay ASC'

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    try {
      const parser = new Parser()
      const csv = parser.parse(rows || [])
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="items.csv"')
      res.send(csv)
    } catch (e) {
      if (e.message.includes('Data should not be empty')) {
        res.status(400).send({ error: 'No data available for export' })
      } else {
        res.status(500).send({ error: 'Failed to generate CSV' })
      }
    }
  })
})

app.get('/api/status', (req, res) => {
  db.get(`SELECT value FROM meta WHERE key = 'last_updated'`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ lastUpdated: row ? row.value : null })
  })
})

const PORT = 3000
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`))
