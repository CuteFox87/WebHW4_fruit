# WebHW4_fruit & Final Project

## Demo Website
[fruit.nyanfox.com](https://fruit.nyanfox.com)

## Description

一個結合前端視覺化與後端 API 的即時資料查詢平台，透過 Vue + Express 架構，串接 [twfood.cc](https://www.twfood.cc) 公開 API，實現農產品（酪梨、鳳梨、香蕉）價格與交易量的歷年數據查詢、圖表分析與 CSV 匯出功能。

## Final Project
補上可彈性變更蔬果種類

---

## 使用技術
### 前端（Frontend）
- **Vue 3 + `<script setup>`**：響應式開發架構
- **Tailwind CSS**：快速設計現代化 UI
- **Chart.js + vue-chartjs**：支援雙 Y 軸折線／長條圖
- **Axios**：與後端 API 溝通
- **Vite**：前端打包與開發伺服器工具

### 後端（Backend）
- **Node.js + Express**：RESTful API 架構
- **Axios**（後端）：從 twfood.cc 抓取外部 JSON 資料
- **SQLite3**：本地資料儲存
- **json2csv**：將查詢結果轉換為 CSV 格式

---

## Frontend
| 功能                     | 說明 |
|--------------------------|------|
| 🔎 條件查詢              | 支援依水果代號、年份範圍查詢資料（ex. `2023`, `2015-2024`, `*`） |
| 📋 查詢結果表格顯示      | 顯示資料年、日期、平均價格、交易量 |
| 📈 圖表顯示              | 折線圖（平均價格）與長條圖（交易量），雙 Y 軸 |
| 📄 匯出 CSV              | 匯出目前查詢條件對應之資料 |
| 🔁 重新抓取資料          | 呼叫 API 從 twfood.cc 重新下載資料並更新資料庫 |
| 💡 錯誤與提示處理        | 查無資料、自動 loading spinner、查詢失敗提示 |
| ⏳ 資料更新時間顯示      | 顯示最後更新時間，便於資料管理追蹤 |

## API routes
| Method | Endpoint           | 說明 |
|--------|--------------------|------|
| `POST` | `/api/refresh`     | 抓取酪梨最新資料並更新資料庫 |
| `GET`  | `/api/items`       | 查詢資料（支援年份、區間與水果代號） |
| `GET`  | `/api/export`      | 匯出查詢結果為 CSV |
| `GET`  | `/api/status`      | 查詢最後更新時間 |
| `*`    | `中介層日誌記錄`   | 每筆 API 存取皆輸出到 console（含 method、時間） |


## Database (SQLite)
### `items` 表格

| 欄位         | 說明         |
|--------------|--------------|
| `fruit_id`   | 水果代號     |
| `fruit_name` | 水果名稱     |
| `year`       | 年份         |
| `endDay`     | 日期         |
| `avgPrice`   | 平均價格     |
| `kg`         | 交易重量     |

### `meta` 表格

| key            | value                        |
|----------------|------------------------------|
| `last_updated` | 最後更新時間（ISO 格式）     |

---
## How to Run

### Run Manually
#### Frontend
```
cd frontend
npm install
npm run dev
```
#### Backend
```
cd backend
npm install
npm run
```

### Run with tmux and npm
```
sudo apt install -y tmux npm
chmod +x ./tmux_start.sh
./tmux_start.sh
```

### Run with docker compose
```
docker compose up -d --build
```
