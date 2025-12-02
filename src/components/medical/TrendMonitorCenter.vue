<template>
  <div class="trend-monitor card-medical h-full flex flex-col">
    <!-- 标题 + 视角切换 + 时间周期 -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-medical-text flex items-center gap-2">
        <span class="w-1 h-4 bg-medical-primary rounded-full"></span>
        医疗级体征总控中心
        <span v-if="selectedElderly" class="text-xs font-normal text-medical-text-sub">
          - {{ selectedElderly.name }}
        </span>
      </h3>
      <div class="flex gap-2">
        <!-- 视角切换 -->
        <div class="flex gap-1 mr-2">
          <button
            v-for="view in views"
            :key="view.value"
            class="px-2 py-1 text-xs rounded transition-all"
            :class="selectedView === view.value
              ? 'bg-medical-secondary text-white'
              : 'text-medical-text-sub hover:bg-medical-card-soft'"
            @click="selectedView = view.value"
          >
            {{ view.label }}
          </button>
        </div>
        <!-- 时间周期 -->
        <button
          v-for="period in periods"
          :key="period.value"
          class="px-3 py-1 text-xs rounded-full transition-all"
          :class="selectedPeriod === period.value
            ? 'bg-medical-primary text-white'
            : 'text-medical-text-sub hover:bg-medical-card-soft'"
          @click="changePeriod(period.value)"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- ① AI体征风险趋势图 -->
    <div ref="chartContainer" class="flex-1" style="min-height: 260px; max-height: 280px;"></div>

    <!-- ② 数据来源 & 事件时间轴 -->
    <div class="mt-2 py-2 border-t border-medical-border" style="height: 90px;">
      <div class="flex items-center justify-between mb-1.5">
        <div class="text-xs font-semibold text-medical-text-sub">数据来源 & 异常事件</div>
        <div class="flex items-center gap-3 text-xs">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 bg-blue-500 rounded"></span>可穿戴
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 bg-green-500 rounded"></span>红外
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 bg-purple-400 rounded"></span>仪器
          </span>
        </div>
      </div>
      <div ref="dataSourceChart" style="height: 50px;"></div>
    </div>

    <!-- ③ 当前时间点体征小结 -->
    <div class="mt-2 pt-2 border-t border-medical-border" style="height: 85px;">
      <div class="text-xs font-semibold text-medical-text-sub mb-2">当前体征小结</div>
      <div class="grid grid-cols-4 gap-2">
        <div class="vital-summary-card">
          <div class="flex items-center gap-1 mb-1">
            <span class="text-xs">❤️</span>
            <span class="text-xs text-medical-text-sub">心率</span>
          </div>
          <div class="text-lg font-bold text-medical-text">{{ currentVitals.heartRate }}</div>
          <div class="text-xs text-medical-muted">bpm</div>
          <div class="text-xs" :class="getTrendClass(currentVitals.heartRateTrend)">
            {{ currentVitals.heartRateTrend > 0 ? '↑' : currentVitals.heartRateTrend < 0 ? '↓' : '→' }}
            {{ Math.abs(currentVitals.heartRateTrend) }}
          </div>
        </div>

        <div class="vital-summary-card">
          <div class="flex items-center gap-1 mb-1">
            <span class="text-xs">🫁</span>
            <span class="text-xs text-medical-text-sub">血氧</span>
          </div>
          <div class="text-lg font-bold text-medical-text">{{ currentVitals.bloodOxygen }}</div>
          <div class="text-xs text-medical-muted">%</div>
          <div class="text-xs" :class="getTrendClass(currentVitals.bloodOxygenTrend)">
            {{ currentVitals.bloodOxygenTrend > 0 ? '↑' : currentVitals.bloodOxygenTrend < 0 ? '↓' : '→' }}
            {{ Math.abs(currentVitals.bloodOxygenTrend) }}
          </div>
        </div>

        <div class="vital-summary-card">
          <div class="flex items-center gap-1 mb-1">
            <span class="text-xs">🌡️</span>
            <span class="text-xs text-medical-text-sub">体温</span>
          </div>
          <div class="text-lg font-bold text-medical-text">{{ currentVitals.temperature }}</div>
          <div class="text-xs text-medical-muted">°C</div>
          <div class="text-xs" :class="getTrendClass(currentVitals.temperatureTrend)">
            {{ currentVitals.temperatureTrend > 0 ? '↑' : currentVitals.temperatureTrend < 0 ? '↓' : '→' }}
            {{ Math.abs(currentVitals.temperatureTrend).toFixed(1) }}
          </div>
        </div>

        <div class="vital-summary-card">
          <div class="flex items-center gap-1 mb-1">
            <span class="text-xs">😴</span>
            <span class="text-xs text-medical-text-sub">睡眠</span>
          </div>
          <div class="text-lg font-bold text-medical-text">{{ currentVitals.sleep }}</div>
          <div class="text-xs text-medical-muted">小时</div>
          <div class="text-xs" :class="getTrendClass(currentVitals.sleepTrend)">
            {{ currentVitals.sleepTrend > 0 ? '↑' : currentVitals.sleepTrend < 0 ? '↓' : '→' }}
            {{ Math.abs(currentVitals.sleepTrend).toFixed(1) }}
          </div>
        </div>
      </div>
      <div class="mt-2 text-xs">
        <span class="font-semibold text-medical-text">AI评估：</span>
        <span :class="getRiskClass(currentVitals.riskIndex)">{{ getRiskLabel(currentVitals.riskIndex) }}</span>
        <span class="text-medical-text-sub ml-2">建议：{{ currentVitals.suggestion }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { generateVitalSigns } from '@/mock/data'

const props = defineProps({
  elderlyList: {
    type: Array,
    required: true
  },
  selectedElderly: {
    type: Object,
    default: null
  }
})

const chartContainer = ref(null)
const dataSourceChart = ref(null)
let mainChart = null
let sourceChart = null

const views = [
  { label: '单老人', value: 'single' },
  { label: '全院', value: 'all' }
]

const periods = [
  { label: '24h', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' }
]

const selectedView = ref('single')
const selectedPeriod = ref('7d')

// 当前体征数据
const currentVitals = ref({
  heartRate: 78,
  heartRateTrend: 2,
  bloodOxygen: 97,
  bloodOxygenTrend: 0,
  temperature: 36.8,
  temperatureTrend: 0.2,
  sleep: 7.5,
  sleepTrend: 0.5,
  riskIndex: 35,
  suggestion: '保持良好作息，建议22:00前入睡'
})

// 生成模拟数据
const generateData = (days) => {
  const dates = []
  const riskIndex = []
  const heartRate = []
  const bloodOxygen = []
  const temperature = []
  const sleep = []
  const prediction = []

  // 历史数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)

    // AI综合风险指数 (0-100)
    const risk = 20 + Math.random() * 40
    riskIndex.push(risk.toFixed(1))

    // 心率标准化 (60-100 bpm -> 0-100)
    const hr = 60 + Math.random() * 30
    heartRate.push(((hr - 60) / 40 * 50 + 25).toFixed(1))

    // 血氧标准化 (90-100% -> 0-100)
    const bo = 94 + Math.random() * 5
    bloodOxygen.push(((bo - 90) / 10 * 50 + 25).toFixed(1))

    // 体温标准化 (36-38°C -> 0-100)
    const temp = 36.5 + Math.random() * 0.8
    temperature.push(((temp - 36) / 2 * 50 + 25).toFixed(1))

    // 睡眠标准化 (4-10h -> 0-100)
    const sl = 6 + Math.random() * 3
    sleep.push(((sl - 4) / 6 * 50 + 25).toFixed(1))
  }

  // 预测数据 (未来1-2天)
  const predDays = selectedPeriod.value === '24h' ? 1 : 2
  for (let i = 1; i <= predDays; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)

    const lastRisk = parseFloat(riskIndex[riskIndex.length - 1])
    const predRisk = lastRisk + (Math.random() - 0.5) * 10
    prediction.push(Math.max(0, Math.min(100, predRisk)).toFixed(1))
  }

  return { dates, riskIndex, heartRate, bloodOxygen, temperature, sleep, prediction }
}

// 生成数据来源数据
const generateDataSources = (days) => {
  const dates = []
  const wearable = []
  const infrared = []
  const instrument = []
  const events = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)

    // 随机生成采样次数
    wearable.push(Math.floor(20 + Math.random() * 30))
    infrared.push(Math.floor(10 + Math.random() * 20))
    instrument.push(Math.floor(1 + Math.random() * 5))

    // 随机生成异常事件
    if (Math.random() > 0.6) {
      const types = ['heart', 'oxygen', 'temp', 'sleep']
      const type = types[Math.floor(Math.random() * types.length)]
      events.push({
        date: dates[dates.length - 1],
        type,
        coord: [dates.length - 1, 0]
      })
    }
  }

  return { dates, wearable, infrared, instrument, events }
}

// 初始化主趋势图
const initMainChart = () => {
  if (!chartContainer.value) return

  mainChart = echarts.init(chartContainer.value)

  const days = selectedPeriod.value === '24h' ? 1 : selectedPeriod.value === '7d' ? 7 : 30
  const { dates, riskIndex, heartRate, bloodOxygen, temperature, sleep, prediction } = generateData(days)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#E1E7F0',
      borderWidth: 1,
      textStyle: { color: '#1E293B', fontSize: 11 },
      axisPointer: {
        type: 'cross',
        lineStyle: { color: '#9AA5B5', width: 1, type: 'dashed' }
      },
      formatter: (params) => {
        let tooltip = `<div style="font-weight: bold; margin-bottom: 4px;">${params[0].axisValue}</div>`
        params.forEach(p => {
          if (p.seriesName === 'AI综合风险指数') {
            tooltip += `<div>${p.marker}${p.seriesName}: ${p.value}</div>`
          }
        })
        return tooltip
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '8%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#E1E7F0', width: 1 } },
      axisLabel: {
        color: '#9AA5B5',
        fontSize: 10,
        interval: 0,
        rotate: dates.length > 10 ? 45 : 0
      },
      axisTick: { show: false },
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '风险指数',
      nameTextStyle: { color: '#64748B', fontSize: 11 },
      min: 0,
      max: 100,
      interval: 20,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9AA5B5', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F0F5FA', type: 'solid' } }
    },
    series: [
      // 风险区间背景带
      {
        name: '高危区',
        type: 'line',
        data: dates.map(() => 100),
        lineStyle: { width: 0 },
        areaStyle: { color: 'rgba(255, 90, 90, 0.08)' },
        stack: 'risk',
        silent: true,
        z: 0
      },
      {
        name: '关注区',
        type: 'line',
        data: dates.map(() => 70),
        lineStyle: { width: 0 },
        areaStyle: { color: 'rgba(255, 180, 77, 0.08)' },
        stack: 'risk',
        silent: true,
        z: 0
      },
      {
        name: '安全区',
        type: 'line',
        data: dates.map(() => 40),
        lineStyle: { width: 0 },
        areaStyle: { color: 'rgba(28, 201, 160, 0.08)' },
        stack: 'risk',
        silent: true,
        z: 0
      },
      // AI综合风险指数（主折线）
      {
        name: 'AI综合风险指数',
        type: 'line',
        data: [...riskIndex, ...Array(prediction.length).fill(null)],
        smooth: true,
        lineStyle: { color: '#2A8DFE', width: 3 },
        itemStyle: { color: '#2A8DFE' },
        emphasis: { focus: 'series' },
        z: 10
      },
      // 预测线
      {
        name: '风险预测',
        type: 'line',
        data: [...Array(riskIndex.length - 1).fill(null), riskIndex[riskIndex.length - 1], ...prediction],
        smooth: true,
        lineStyle: {
          color: '#1CC9A0',
          width: 2,
          type: 'dashed'
        },
        itemStyle: { color: '#1CC9A0' },
        z: 9
      },
      // 心率标准化
      {
        name: '心率',
        type: 'line',
        data: [...heartRate, ...Array(prediction.length).fill(null)],
        smooth: true,
        lineStyle: { color: '#60A5FA', width: 1.5, type: 'solid' },
        itemStyle: { color: '#60A5FA', borderWidth: 0 },
        symbol: 'circle',
        symbolSize: 4,
        z: 8
      },
      // 血氧标准化
      {
        name: '血氧',
        type: 'line',
        data: [...bloodOxygen, ...Array(prediction.length).fill(null)],
        smooth: true,
        lineStyle: { color: '#A78BFA', width: 1.5, type: 'solid' },
        itemStyle: { color: '#A78BFA', borderWidth: 0 },
        symbol: 'circle',
        symbolSize: 4,
        z: 8
      },
      // 体温标准化
      {
        name: '体温',
        type: 'line',
        data: [...temperature, ...Array(prediction.length).fill(null)],
        smooth: true,
        lineStyle: { color: '#FB923C', width: 1.5, type: 'solid' },
        itemStyle: { color: '#FB923C', borderWidth: 0 },
        symbol: 'circle',
        symbolSize: 4,
        z: 8
      },
      // 参考线
      {
        name: '参考线',
        type: 'line',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#9AA5B5', type: 'dashed', width: 1 },
          label: {
            fontSize: 9,
            color: '#64748B',
            position: 'end'
          },
          data: [
            { yAxis: 70, label: { formatter: '关注线 70' } },
            { yAxis: 40, label: { formatter: '安全线 40' } }
          ]
        }
      }
    ]
  }

  mainChart.setOption(option)
  window.addEventListener('resize', () => mainChart?.resize())
}

// 初始化数据来源图表
const initDataSourceChart = () => {
  if (!dataSourceChart.value) return

  sourceChart = echarts.init(dataSourceChart.value)

  const days = selectedPeriod.value === '24h' ? 1 : selectedPeriod.value === '7d' ? 7 : 30
  const { dates, wearable, infrared, instrument, events } = generateDataSources(days)

  // 事件图标映射
  const eventIcons = {
    heart: { symbol: 'circle', color: '#FF5A5A', label: '心率异常' },
    oxygen: { symbol: 'circle', color: '#FFB74D', label: '血氧偏低' },
    temp: { symbol: 'circle', color: '#FB923C', label: '体温升高' },
    sleep: { symbol: 'circle', color: '#A78BFA', label: '睡眠不足' }
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#E1E7F0',
      borderWidth: 1,
      textStyle: { color: '#1E293B', fontSize: 10 }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '5%',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#E1E7F0', width: 1 } },
      axisLabel: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        name: '可穿戴',
        type: 'bar',
        stack: 'source',
        data: wearable,
        itemStyle: { color: '#3B82F6', borderRadius: [0, 0, 0, 0] },
        barWidth: '60%'
      },
      {
        name: '红外',
        type: 'bar',
        stack: 'source',
        data: infrared,
        itemStyle: { color: '#10B981', borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '仪器',
        type: 'bar',
        stack: 'source',
        data: instrument,
        itemStyle: { color: '#A78BFA', borderRadius: [2, 2, 0, 0] }
      },
      // 异常事件标记
      ...events.map((event, idx) => ({
        name: `事件${idx}`,
        type: 'scatter',
        data: [event.coord],
        symbolSize: 8,
        itemStyle: { color: eventIcons[event.type].color },
        z: 10,
        tooltip: {
          formatter: () => `${event.date}<br/>${eventIcons[event.type].label}`
        }
      }))
    ]
  }

  sourceChart.setOption(option)
  window.addEventListener('resize', () => sourceChart?.resize())
}

const changePeriod = (period) => {
  selectedPeriod.value = period
  nextTick(() => {
    if (mainChart) initMainChart()
    if (sourceChart) initDataSourceChart()
  })
}

const getTrendClass = (trend) => {
  if (trend > 0) return 'text-medical-warning'
  if (trend < 0) return 'text-medical-secondary'
  return 'text-medical-muted'
}

const getRiskClass = (risk) => {
  if (risk >= 70) return 'text-medical-danger font-semibold'
  if (risk >= 40) return 'text-medical-warning font-semibold'
  return 'text-medical-secondary font-semibold'
}

const getRiskLabel = (risk) => {
  if (risk >= 70) return `高风险 (${risk})`
  if (risk >= 40) return `中风险 (${risk})`
  return `低风险 (${risk})`
}

watch(selectedView, () => {
  nextTick(() => {
    if (mainChart) initMainChart()
    if (sourceChart) initDataSourceChart()
  })
})

watch(() => props.selectedElderly, () => {
  nextTick(() => {
    if (mainChart) initMainChart()
    if (sourceChart) initDataSourceChart()
  })
})

onMounted(() => {
  nextTick(() => {
    initMainChart()
    initDataSourceChart()
  })
})
</script>

<style scoped>
.vital-summary-card {
  @apply px-2 py-1.5 bg-medical-card-soft rounded-lg text-center;
}
</style>
