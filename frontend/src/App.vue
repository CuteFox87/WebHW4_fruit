<!-- === File: frontend/src/App.vue === -->
<template>

  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">🍌 農產品交易資料分析系統</h1>

      <!-- 統計資訊卡片 -->
      <div class="grid md:grid-cols-4 gap-6 mb-6 text-white">
        <!-- 資料筆數 -->
        <button class="bg-gradient-to-r from-pink-500 to-red-600 shadow-lg rounded-xl py-6 px-4 text-center hover:scale-105 transition">
          <div class="text-3xl font-extrabold">{{ items.length }}</div>
          <div class="text-sm mt-1">資料筆數</div>
        </button>

        <!-- 平均價格 -->
        <button class="bg-gradient-to-r from-orange-400 to-amber-500 shadow-lg rounded-xl py-6 px-4 text-center hover:scale-105 transition">
          <div class="text-3xl font-extrabold">{{ averagePrice.toFixed(2) }} 元</div>
          <div class="text-sm mt-1">平均價格</div>
        </button>

        <!-- 總交易量 -->
        <button class="bg-gradient-to-r from-emerald-500 to-lime-600 shadow-lg rounded-xl py-6 px-4 text-center hover:scale-105 transition">
          <div class="text-3xl font-extrabold">{{ totalKg.toLocaleString() }} 公斤</div>
          <div class="text-sm mt-1">總交易量</div>
        </button>

        <!-- 最後更新時間 -->
        <button class="bg-gradient-to-r from-sky-500 to-indigo-600 shadow-lg rounded-xl py-6 px-4 text-center hover:scale-105 transition">
          <div class="text-xs font-semibold">最後更新時間</div>
          <div class="text-xs mt-1">{{ lastUpdated ? new Date(lastUpdated).toLocaleString() : '—' }}</div>
        </button>
      </div>


      <!-- 查詢操作區塊 -->
      <div class="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">🔍 查詢條件</h2>
        <div class="grid md:grid-cols-3 gap-4 items-center">
          <!-- 水果選單 -->
          <div class="flex flex-col">
            <label class="text-sm text-gray-600 mb-1">選擇水果</label>
            <select v-model="fruit" class="border rounded-lg px-3 py-2 bg-gradient-to-r from-white to-gray-100 text-gray-800 shadow-inner focus:outline-none">

              <option disabled value="">請選擇</option>
              <option value="A1">🍌 香蕉</option>
              <option value="B2">🍍 鳳梨（金鑽鳳梨）</option>
              <option value="G3">🥑 酪梨</option>
              <option value="X6">🍎 蘋果（富士）</option>
              <option value="T1">🍉 西瓜（大西瓜）</option>
              <option value="S1">🍇 葡萄（巨峰）</option>
              <option value="C1">🍊 椪柑（橘子）</option>
              <option value="45">🍓 草莓</option>
              <option value="R1">🥭 芒果（愛文）</option>
              <option value="Y1">🍑 水蜜桃</option>
            </select>
          </div>

          <!-- 年份輸入 -->
          <div class="flex flex-col">
            <label class="text-sm text-gray-600 mb-1">輸入年份 (ex. 2014-2025, 2020, *)</label>
            <input
              v-model="year"
              type="text"
              placeholder="*"
              class="border rounded-lg px-3 py-2 bg-gradient-to-r from-white to-gray-100 text-gray-800 shadow-inner focus:outline-none"
            />
          </div>

          <!-- 操作按鈕 -->
          <div class="flex flex-col gap-2 justify-end h-full">
            <button
              @click="fetchData"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              🔎 查詢
            </button>
            <button
              @click="refreshData"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              🔁 重新抓取
            </button>
            <button
              @click="downloadCSV"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              📄 匯出 CSV
            </button>
          </div>
        </div>
      </div>


      <!-- 圖表顯示區 -->
      <div class="bg-white rounded-xl shadow-xl p-4 mt-6">
        <Line :data="chartData" :options="chartOptions" class="h-[400px]" />
      </div>

      <!-- 原始資料表格 -->
      <table class="table-auto w-full border mt-6 bg-white rounded-xl shadow-md overflow-hidden text-gray-800">
        <thead class="bg-gray-700 text-white">
          <tr>
            <th class="border px-2 py-1">年</th>
            <th class="border px-2 py-1">日期</th>
            <th class="border px-2 py-1">平均價格</th>
            <th class="border px-2 py-1">重量 (kg)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="border px-2 py-1">{{ item.year }}</td>
            <td class="border px-2 py-1">{{ item.endDay }}</td>
            <td class="border px-2 py-1">{{ item.avgPrice }}</td>
            <td class="border px-2 py-1">{{ item.kg }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-75"></div>
  </div>

</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Line } from 'vue-chartjs'


ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, BarElement, CategoryScale, LinearScale)

const items = ref([])
const fruit = ref('A1')
const year = ref('')
const lastUpdated = ref('')
const isLoading = ref(false)


const chartData = ref({
  labels: [],
  datasets: [
    {
      label: '平均價格 (元)',
      type: 'line',
      data: [],
      borderColor: 'blue',
      tension: 0.3,
      yAxisID: 'y'
    },
    {
      label: '交易量 (公斤)',
      type: 'bar',
      data: [],
      backgroundColor: 'rgba(0, 200, 0, 0.5)',
      yAxisID: 'y1'
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  stacked: false,
  plugins: {
    legend: { position: 'top' }
  },
  scales: {
    x: {
      title: { display: true, text: '日期' }
    },
    y: {
      type: 'linear',
      position: 'left',
      title: { display: true, text: '平均價格 (元)' }
    },
    y1: {
      type: 'linear',
      position: 'right',
      grid: { drawOnChartArea: false },
      title: { display: true, text: '交易量 (公斤)' }
    }
  }
}

const updateChart = () => {
  const labels = items.value.map(item => item.endDay)
  const avgPrices = items.value.map(item => Number(item.avgPrice) || 0)
  const kgs = items.value.map(item => Number(item.kg) || 0)

  chartData.value = {
    labels,
    datasets: [
      {
        label: '平均價格 (元)',
        type: 'line',
        data: avgPrices,
        borderColor: 'blue',
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: '交易量 (公斤)',
        type: 'bar',
        data: kgs,
        backgroundColor: 'rgba(0, 200, 0, 0.5)',
        yAxisID: 'y1'
      }
    ]
  }
}


const fetchData = async () => {
  const params = {}
  if (fruit.value) params.fruit = fruit.value
  if (year.value) params.year = year.value

  isLoading.value = true
  try {
    const res = await axios.get('/api/items', { params })
    items.value = res.data

    if (items.value.length === 0) {
      alert('找不到符合條件的資料')
    }

    updateChart()  // <=== 新增這行，保險
  } catch (err) {
    console.error('查詢失敗:', err)
    alert('查詢失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}




const refreshData = async () => {
  await axios.post('/api/refresh')
  await fetchData()
  await getStatus()
}

const getStatus = async () => {
  const res = await axios.get('/api/status')
  lastUpdated.value = res.data.lastUpdated
}

const downloadCSV = async () => {
  const params = new URLSearchParams()
  if (fruit.value) params.append('fruit', fruit.value)
  if (year.value) params.append('year', year.value)

  isLoading.value = true
  try {
    const res = await axios.get('/api/items', { params })
    if (res.data.length === 0) {
      alert('找不到可匯出的資料')
    } else {
      window.open(`/api/export?${params.toString()}`, '_blank')
    }
  } catch (err) {
    console.error('匯出失敗:', err)
    alert('匯出失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}


const averagePrice = computed(() => {
  if (items.value.length === 0) return 0
  const total = items.value.reduce((sum, item) => sum + item.avgPrice, 0)
  return total / items.value.length
})

const totalKg = computed(() => {
  return items.value.reduce((sum, item) => sum + item.kg, 0)
})

onMounted(() => {
  fetchData()
  getStatus()
})

watch(items, () => {
  updateChart()
})

</script>

<style scoped>
select option {
  background-color: #1f2937 !important;
  color: #ffffff !important; /* text-gray-800 */
}
</style>

