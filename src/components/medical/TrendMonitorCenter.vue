<template>
  <div class="trend-monitor card-medical h-full flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-medical-text flex items-center gap-2">
        <span class="w-1 h-4 bg-medical-primary rounded-full"></span>
        健康趋势监控中心
        <span v-if="selectedElderly" class="text-xs font-normal text-medical-text-sub">
          - {{ selectedElderly.name }}
        </span>
      </h3>
      <div class="flex gap-2">
        <button
          v-for="period in periods"
          :key="period.value"
          class="px-3 py-1 text-xs rounded-full transition-all"
          :class="selectedPeriod === period.value
            ? 'bg-medical-primary text-white'
            : 'text-medical-text-sub hover:bg-medical-card-soft'"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- 主趋势图 -->
    <div ref="chartContainer" class="flex-1" style="min-height: 300px;"></div>

    <!-- 异常事件时间轴 -->
    <div class="mt-3 pt-3 border-t border-medical-border">
      <div class="text-xs font-semibold text-medical-text-sub mb-2">异常事件</div>
      <div class="flex gap-3 overflow-x-auto">
        <div
          v-for="event in anomalyEvents"
          :key="event.id"
          class="flex-shrink-0 px-3 py-1.5 bg-medical-card-soft rounded-lg cursor-pointer hover:bg-medical-warning/10 transition-all"
        >
          <div class="text-xs font-medium text-medical-text">{{ event.date }}</div>
          <div class="text-xs text-medical-text-sub">{{ event.description }}</div>
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

const chartContainer = ref(null)
let chart = null

const periods = [
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' }
]

const selectedPeriod = ref('7d')

const anomalyEvents = ref([
  { id: 1, date: '11/26', description: '夜间心率偏高' },
  { id: 2, date: '11/28', description: '睡眠不足' },
  { id: 3, date: '11/30', description: '血压偏高' }
])

const initChart = () => {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value)

  // 生成数据
  const dates = []
  const healthScores = []
  const bloodOxygen = []
  const sleepHours = []
  const anomalyCount = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)

    healthScores.push(Math.floor(Math.random() * 15 + 70))
    bloodOxygen.push(Math.floor(Math.random() * 4 + 95))
    sleepHours.push((6 + Math.random() * 2).toFixed(1))
    anomalyCount.push(Math.floor(Math.random() * 3))
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E1E7F0',
      borderWidth: 1,
      textStyle: { color: '#1E293B', fontSize: 12 },
      axisPointer: {
        type: 'cross',
        lineStyle: { color: '#9AA5B5', width: 1, type: 'dashed' }
      }
    },
    legend: {
      data: ['综合健康评分', '平均血氧', '平均睡眠', '异常事件'],
      bottom: 0,
      textStyle: { color: '#64748B', fontSize: 11 },
      itemWidth: 16,
      itemHeight: 8
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#E1E7F0', width: 1 } },
      axisLabel: { color: '#9AA5B5', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '评分',
        nameTextStyle: { color: '#64748B', fontSize: 11 },
        min: 50,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9AA5B5', fontSize: 11 },
        splitLine: { lineStyle: { color: '#F0F5FA', type: 'dashed' } }
      },
      {
        type: 'value',
        name: '血氧%',
        nameTextStyle: { color: '#64748B', fontSize: 11 },
        min: 90,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9AA5B5', fontSize: 11 },
        splitLine: { show: false }
      },
      {
        type: 'value',
        name: '睡眠(h)',
        nameTextStyle: { color: '#64748B', fontSize: 11 },
        min: 0,
        max: 12,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9AA5B5', fontSize: 11 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '综合健康评分',
        type: 'line',
        data: healthScores,
        smooth: true,
        lineStyle: { color: '#2A8DFE', width: 3 },
        itemStyle: { color: '#2A8DFE' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(42, 141, 254, 0.25)' },
              { offset: 1, color: 'rgba(42, 141, 254, 0.05)' }
            ]
          }
        },
        markLine: {
          silent: true,
          lineStyle: { color: '#FFB74D', type: 'dashed', width: 1 },
          label: { fontSize: 10, color: '#64748B' },
          data: [
            { yAxis: 80, label: { formatter: '健康线' } },
            { yAxis: 60, label: { formatter: '关注线' } }
          ]
        }
      },
      {
        name: '平均血氧',
        type: 'line',
        yAxisIndex: 1,
        data: bloodOxygen,
        smooth: true,
        lineStyle: { color: '#1CC9A0', width: 2 },
        itemStyle: { color: '#1CC9A0' }
      },
      {
        name: '平均睡眠',
        type: 'bar',
        yAxisIndex: 2,
        data: sleepHours,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#A78BFA' },
            { offset: 1, color: '#C4B5FD' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '20%'
      },
      {
        name: '异常事件',
        type: 'scatter',
        data: anomalyCount,
        symbolSize: 8,
        itemStyle: { color: '#FF5A5A' }
      }
    ]
  }

  chart.setOption(option)

  window.addEventListener('resize', () => chart?.resize())
}

watch(selectedPeriod, () => {
  nextTick(() => {
    if (chart) initChart()
  })
})

watch(() => props.selectedElderly, () => {
  nextTick(() => {
    if (chart) initChart()
  })
})

onMounted(() => {
  initChart()
})
</script>
