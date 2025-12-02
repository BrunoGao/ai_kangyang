<template>
  <div class="ai-decision-center card-medical h-full flex flex-col">
    <h3 class="text-sm font-semibold text-medical-text mb-3 flex items-center gap-2">
      <span class="w-1 h-4 bg-medical-primary rounded-full"></span>
      AI决策中心
      <span class="text-xs font-normal text-medical-text-sub ml-auto">置信度评分</span>
    </h3>

    <div class="flex-1 overflow-y-auto space-y-2.5" style="max-height: calc(520px - 240px);">
      <!-- AI决策卡片 -->
      <div
        v-for="insight in sortedInsights.slice(0, 3)"
        :key="insight.id"
        class="decision-card px-3 py-2.5 rounded-lg border cursor-pointer transition-all"
        :class="getCardClass(insight.priority)"
      >
        <div class="flex items-start gap-2 mb-2">
          <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
               :class="getPriorityBadgeClass(insight.priority)">
            {{ getPriorityIcon(insight.priority) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-semibold text-medical-text mb-1">{{ insight.title }}</div>
            <div class="text-xs text-medical-text-sub leading-relaxed line-clamp-2">
              {{ insight.content }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="text-medical-text-sub">AI {{ Math.round(insight.confidence * 100) }}%</span>
            <div class="w-16 h-1 bg-medical-card-soft rounded-full overflow-hidden">
              <div
                class="h-full bg-medical-primary transition-all"
                :style="{ width: (insight.confidence * 100) + '%' }"
              ></div>
            </div>
          </div>
          <button
            v-if="insight.priority === 'high'"
            class="px-2 py-0.5 bg-medical-primary/10 text-medical-primary rounded-full hover:bg-medical-primary hover:text-white transition-all"
          >
            处理
          </button>
        </div>

        <!-- 建议操作 -->
        <div v-if="insight.recommendations && insight.priority === 'high'" class="mt-2 pt-2 border-t border-medical-border">
          <div class="flex gap-1.5">
            <button class="flex-1 px-2 py-1 bg-medical-secondary/10 text-medical-secondary text-xs rounded hover:bg-medical-secondary hover:text-white transition-all">
              📞 呼叫
            </button>
            <button class="flex-1 px-2 py-1 bg-medical-primary/10 text-medical-primary text-xs rounded hover:bg-medical-primary hover:text-white transition-all">
              📋 报告
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 7日趋势小图 -->
    <div class="mt-3 pt-3 border-t border-medical-border">
      <div class="text-xs font-semibold text-medical-text-sub mb-2">全院7日健康趋势</div>
      <div ref="miniChart" style="height: 160px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  insights: {
    type: Array,
    required: true
  },
  alerts: {
    type: Array,
    default: () => []
  }
})

const miniChart = ref(null)

const sortedInsights = computed(() => {
  const priorityOrder = { high: 0, medium: 1, info: 2 }
  return [...props.insights].sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority]
  )
})

const getCardClass = (priority) => {
  const classes = {
    high: 'bg-medical-danger/5 border-medical-danger hover:border-medical-danger',
    medium: 'bg-medical-warning/5 border-medical-warning hover:border-medical-warning',
    info: 'bg-white border-medical-border hover:border-medical-primary'
  }
  return classes[priority] || classes.info
}

const getPriorityBadgeClass = (priority) => {
  const classes = {
    high: 'bg-medical-danger text-white',
    medium: 'bg-medical-warning text-white',
    info: 'bg-medical-primary text-white'
  }
  return classes[priority] || classes.info
}

const getPriorityIcon = (priority) => {
  const icons = {
    high: '!',
    medium: '⚠',
    info: 'ℹ'
  }
  return icons[priority] || 'ℹ'
}

const initMiniChart = () => {
  if (!miniChart.value) return

  const chart = echarts.init(miniChart.value)

  const dates = []
  const scores = []
  const dangerCount = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
    scores.push(Math.floor(Math.random() * 15 + 70))
    dangerCount.push(Math.floor(Math.random() * 3))
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E1E7F0',
      borderWidth: 1,
      textStyle: { color: '#1E293B', fontSize: 11 }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '8%',
      top: '8%',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#E1E7F0' } },
      axisLabel: { color: '#9AA5B5', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9AA5B5', fontSize: 10 },
        splitLine: { lineStyle: { color: '#F0F5FA', type: 'dashed' } }
      },
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '平均健康评分',
        type: 'line',
        data: scores,
        smooth: true,
        lineStyle: { color: '#2A8DFE', width: 2 },
        itemStyle: { color: '#2A8DFE' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(42, 141, 254, 0.2)' },
              { offset: 1, color: 'rgba(42, 141, 254, 0.05)' }
            ]
          }
        }
      },
      {
        name: '高危人数',
        type: 'bar',
        yAxisIndex: 1,
        data: dangerCount,
        itemStyle: {
          color: '#FF5A5A',
          borderRadius: [2, 2, 0, 0]
        },
        barWidth: '30%'
      }
    ]
  }

  chart.setOption(option)
}

onMounted(() => {
  initMiniChart()
})
</script>

<style scoped>
.decision-card {
  min-height: 90px;
  max-height: 110px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
