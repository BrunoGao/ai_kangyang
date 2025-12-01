<template>
  <div class="health-trend-chart card-soft h-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-healing-gray flex items-center gap-2">
        <span>📈</span>
        <span>健康趋势监控中心</span>
        <span v-if="selectedElderly" class="text-sm font-normal text-gray-500 ml-2">
          - {{ selectedElderly.name }}
        </span>
      </h2>
      <div class="flex gap-2">
        <button
          v-for="period in periods"
          :key="period.value"
          class="px-3 py-1 rounded-lg text-sm font-medium transition-soft"
          :class="selectedPeriod === period.value
            ? 'bg-healing-primary text-white'
            : 'bg-healing-light-gray text-gray-600 hover:bg-gray-200'"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- 核心趋势图表 -->
    <div ref="mainChart" class="h-80 mb-4"></div>

    <!-- 数据维度切换 -->
    <div class="flex items-center justify-center gap-4 text-sm">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="showHealthScore" class="rounded text-healing-primary">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-healing-primary"></span>
          <span>综合健康</span>
        </span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="showHeartRate" class="rounded text-red-500">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-red-500"></span>
          <span>心率</span>
        </span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="showBloodOxygen" class="rounded text-blue-500">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>血氧</span>
        </span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="showTemperature" class="rounded text-orange-500">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-orange-500"></span>
          <span>体温</span>
        </span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="showSleep" class="rounded text-purple-500">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-purple-500"></span>
          <span>睡眠</span>
        </span>
      </label>
    </div>

    <!-- 异常事件标记 -->
    <div v-if="anomalyEvents.length > 0" class="mt-4 p-3 bg-healing-orange/10 rounded-xl">
      <div class="text-sm font-semibold text-healing-orange mb-2">⚠️ 异常事件</div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="event in anomalyEvents"
          :key="event.id"
          class="text-xs px-3 py-1 bg-white rounded-full text-gray-700"
        >
          {{ event.date }} - {{ event.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { generateHistoricalData } from '@/mock/data'

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

const mainChart = ref(null)
let chart = null

const periods = [
  { label: '24小时', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' }
]

const selectedPeriod = ref('7d')
const showHealthScore = ref(true)
const showHeartRate = ref(true)
const showBloodOxygen = ref(true)
const showTemperature = ref(false)
const showSleep = ref(true)

// 模拟异常事件
const anomalyEvents = ref([
  { id: 1, date: '12-01', description: '李建国心率异常' },
  { id: 2, date: '11-30', description: '张秀英睡眠不足' },
  { id: 3, date: '11-29', description: '陈德华血压偏高' }
])

const initChart = () => {
  if (!mainChart.value) return

  chart = echarts.init(mainChart.value)

  // 生成数据
  const dates = []
  const healthScores = []
  const heartRates = []
  const bloodOxygen = []
  const temperatures = []
  const sleepHours = []
  const alerts = []

  // 如果选中特定老人，显示其数据；否则显示平均数据
  if (props.selectedElderly) {
    const historicalData = generateHistoricalData(props.selectedElderly.id)
    historicalData.forEach(d => {
      dates.push(d.date.slice(5))
      healthScores.push(Math.floor(Math.random() * 20 + 70))
      heartRates.push(d.heartRate)
      bloodOxygen.push(d.bloodOxygen)
      temperatures.push((d.bloodOxygen / 100 * 37).toFixed(1))
      sleepHours.push(parseFloat(d.sleepHours))
    })
  } else {
    // 显示全院平均数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`)

      healthScores.push(Math.floor(Math.random() * 15 + 70))
      heartRates.push(Math.floor(Math.random() * 15 + 70))
      bloodOxygen.push(Math.floor(Math.random() * 4 + 95))
      temperatures.push((36.5 + Math.random() * 0.8).toFixed(1))
      sleepHours.push((6 + Math.random() * 2).toFixed(1))

      // 随机添加异常点
      if (Math.random() > 0.7) {
        alerts.push({
          coord: [dates[dates.length - 1], healthScores[healthScores.length - 1]],
          value: '异常'
        })
      }
    }
  }

  const series = []

  // 综合健康评分
  if (showHealthScore.value) {
    series.push({
      name: '综合健康',
      type: 'line',
      data: healthScores,
      smooth: true,
      lineStyle: { color: '#80C4A8', width: 3 },
      itemStyle: { color: '#80C4A8' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(128, 196, 168, 0.4)' },
            { offset: 1, color: 'rgba(128, 196, 168, 0.05)' }
          ]
        }
      },
      markLine: {
        silent: true,
        lineStyle: { color: '#FFA45B', type: 'dashed' },
        data: [
          { yAxis: 80, label: { formatter: '健康线' } },
          { yAxis: 60, label: { formatter: '关注线' } }
        ]
      },
      markPoint: {
        data: alerts,
        symbol: 'circle',
        symbolSize: 12,
        itemStyle: { color: '#FF6B6B' }
      }
    })
  }

  // 心率
  if (showHeartRate.value) {
    series.push({
      name: '心率',
      type: 'line',
      data: heartRates,
      smooth: true,
      lineStyle: { color: '#FF6B6B', width: 2 },
      itemStyle: { color: '#FF6B6B' }
    })
  }

  // 血氧
  if (showBloodOxygen.value) {
    series.push({
      name: '血氧',
      type: 'line',
      data: bloodOxygen,
      smooth: true,
      yAxisIndex: 1,
      lineStyle: { color: '#7AB6E9', width: 2 },
      itemStyle: { color: '#7AB6E9' }
    })
  }

  // 体温
  if (showTemperature.value) {
    series.push({
      name: '体温',
      type: 'line',
      data: temperatures,
      smooth: true,
      lineStyle: { color: '#FFA45B', width: 2 },
      itemStyle: { color: '#FFA45B' }
    })
  }

  // 睡眠（柱状图）
  if (showSleep.value) {
    series.push({
      name: '睡眠时长',
      type: 'bar',
      data: sleepHours,
      yAxisIndex: 2,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#A78BFA' },
          { offset: 1, color: '#C4B5FD' }
        ])
      },
      barWidth: '30%'
    })
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#80C4A8',
      borderWidth: 1,
      textStyle: { color: '#404040' },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#999' }
      }
    },
    legend: {
      data: ['综合健康', '心率', '血氧', '体温', '睡眠时长'],
      bottom: 0,
      textStyle: { color: '#666' }
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '12%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#E0E0E0' } },
      axisLabel: { color: '#999' }
    },
    yAxis: [
      {
        type: 'value',
        name: '健康评分/心率',
        min: 50,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#999' },
        splitLine: {
          lineStyle: { color: '#F0F0F0', type: 'dashed' }
        }
      },
      {
        type: 'value',
        name: '血氧%',
        min: 90,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#999' },
        splitLine: { show: false }
      },
      {
        type: 'value',
        name: '睡眠(h)',
        min: 0,
        max: 12,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#999' },
        splitLine: { show: false }
      }
    ],
    series
  }

  chart.setOption(option)

  window.addEventListener('resize', () => chart?.resize())
}

// 监听数据变化重新渲染
watch([showHealthScore, showHeartRate, showBloodOxygen, showTemperature, showSleep, selectedPeriod], () => {
  nextTick(() => {
    if (chart) {
      initChart()
    }
  })
})

watch(() => props.selectedElderly, () => {
  nextTick(() => {
    if (chart) {
      initChart()
    }
  })
})

onMounted(() => {
  initChart()
})
</script>

<style scoped>
.health-trend-chart {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
