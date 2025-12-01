<template>
  <div class="ai-insights card-soft h-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-healing-gray flex items-center gap-2">
        <span>🤖</span>
        <span>AI决策中心</span>
      </h2>
      <div class="text-xs text-gray-500 flex items-center gap-1">
        <span class="w-2 h-2 bg-healing-green rounded-full animate-pulse"></span>
        <span>实时分析</span>
      </div>
    </div>

    <!-- 活跃告警时间线 -->
    <div v-if="alerts.length > 0" class="mb-4 p-3 bg-healing-red/10 border border-healing-red/30 rounded-xl">
      <div class="text-sm font-semibold text-healing-red mb-2 flex items-center justify-between">
        <span>🚨 活跃告警事件</span>
        <span class="text-xs">{{ alerts.length }} 条</span>
      </div>
      <div class="space-y-2 max-h-32 overflow-y-auto">
        <div
          v-for="alert in alerts.slice(0, 3)"
          :key="alert.id"
          class="text-xs flex items-start gap-2 bg-white rounded-lg p-2"
        >
          <div class="text-base">{{ getAlertIcon(alert.type) }}</div>
          <div class="flex-1">
            <div class="font-semibold text-gray-800">{{ alert.elderlyName }}</div>
            <div class="text-gray-600">{{ alert.title }}</div>
            <div class="text-gray-400">{{ formatTime(alert.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 洞察列表 -->
    <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      <div
        v-for="insight in sortedInsights"
        :key="insight.id"
        class="insight-card p-4 rounded-xl transition-soft cursor-pointer"
        :class="getInsightClass(insight.priority)"
        @click="expandedInsight = expandedInsight === insight.id ? null : insight.id"
      >
        <!-- 头部 -->
        <div class="flex items-start gap-3 mb-2">
          <div class="text-2xl">{{ getInsightIcon(insight.type) }}</div>
          <div class="flex-1">
            <h3 class="font-bold text-gray-800 mb-1">{{ insight.title }}</h3>
            <p class="text-sm text-gray-600 leading-relaxed">{{ insight.content }}</p>
          </div>
        </div>

        <!-- 可信度 -->
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs text-gray-500">AI可信度</span>
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div
              class="bg-healing-primary h-2 rounded-full transition-all"
              :style="{ width: (insight.confidence * 100) + '%' }"
            ></div>
          </div>
          <span class="text-xs font-semibold text-healing-primary">
            {{ Math.round(insight.confidence * 100) }}%
          </span>
        </div>

        <!-- 建议（展开显示） -->
        <div
          v-if="insight.recommendations && expandedInsight === insight.id"
          class="mt-3 pt-3 border-t border-gray-200"
        >
          <div class="text-xs font-semibold text-gray-700 mb-2">🎯 AI建议方案：</div>
          <ul class="space-y-1 mb-3">
            <li
              v-for="(rec, index) in insight.recommendations"
              :key="index"
              class="text-xs text-gray-600 flex items-start gap-2"
            >
              <span class="text-healing-primary">•</span>
              <span>{{ rec }}</span>
            </li>
          </ul>
          <!-- 任务执行按钮 -->
          <div v-if="insight.priority === 'high'" class="flex gap-2">
            <button class="flex-1 px-3 py-1.5 bg-healing-primary text-white rounded-lg text-xs font-medium hover:bg-healing-green transition-all">
              📞 呼叫护士
            </button>
            <button class="flex-1 px-3 py-1.5 bg-healing-blue text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all">
              📋 生成报告
            </button>
            <button class="px-3 py-1.5 bg-healing-orange text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all">
              🛏️
            </button>
          </div>
        </div>

        <!-- 时间 -->
        <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{{ formatTime(insight.timestamp) }}</span>
          <span v-if="insight.recommendations">
            {{ expandedInsight === insight.id ? '收起' : '展开建议' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 健康趋势图表 -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>📈</span>
        <span>7日健康趋势</span>
      </h3>
      <div ref="chartContainer" class="h-48"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

const expandedInsight = ref(null)
const chartContainer = ref(null)
let chart = null

// 按优先级排序
const sortedInsights = computed(() => {
  const priorityOrder = { high: 0, medium: 1, info: 2 }
  return [...props.insights].sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority]
  )
})

const getInsightClass = (priority) => {
  const classes = {
    high: 'bg-healing-red/10 border-2 border-healing-red/30 hover:shadow-glow-red',
    medium: 'bg-healing-orange/10 border-2 border-healing-orange/30 hover:shadow-glow-orange',
    info: 'bg-healing-blue/10 border border-healing-blue/30 hover:shadow-soft-lg'
  }
  return classes[priority] || classes.info
}

const getInsightIcon = (type) => {
  const icons = {
    alert: '⚠️',
    trend: '📊',
    pattern: '🔍',
    success: '✅'
  }
  return icons[type] || '💡'
}

const getAlertIcon = (type) => {
  const icons = {
    danger: '🚨',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || 'ℹ️'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now - date) / 60000)

  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  return date.toLocaleDateString('zh-CN')
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value)

  // 模拟7天健康评分数据
  const dates = []
  const scores = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
    scores.push(Math.floor(Math.random() * 15 + 70)) // 70-85之间的随机分数
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#80C4A8',
      borderWidth: 1,
      textStyle: {
        color: '#404040'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#E0E0E0'
        }
      },
      axisLabel: {
        color: '#999'
      }
    },
    yAxis: {
      type: 'value',
      min: 60,
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#999'
      },
      splitLine: {
        lineStyle: {
          color: '#F0F0F0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '平均健康评分',
        type: 'line',
        data: scores,
        smooth: true,
        lineStyle: {
          color: '#80C4A8',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(128, 196, 168, 0.3)' },
              { offset: 1, color: 'rgba(128, 196, 168, 0.05)' }
            ]
          }
        },
        itemStyle: {
          color: '#80C4A8',
          borderWidth: 2,
          borderColor: '#fff'
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }

  chart.setOption(option)

  // 响应式调整
  const resizeObserver = new ResizeObserver(() => {
    chart?.resize()
  })
  resizeObserver.observe(chartContainer.value)
}

onMounted(() => {
  initChart()
})

watch(() => chartContainer.value, () => {
  if (chartContainer.value && !chart) {
    initChart()
  }
})
</script>

<style scoped>
.ai-insights {
  animation: fadeIn 0.5s ease-out;
}

.insight-card {
  animation: slideInRight 0.4s ease-out;
}

.insight-card:hover {
  transform: translateX(-2px);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
