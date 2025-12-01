<template>
  <div class="risk-elderly-list card-soft h-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-healing-gray flex items-center gap-2">
        <span>👥</span>
        <span>重点关注</span>
      </h2>
      <div class="text-sm text-gray-500">
        按风险等级排序
      </div>
    </div>

    <!-- 告警统计 -->
    <div v-if="alerts.length > 0" class="mb-4 p-3 bg-healing-red/10 border border-healing-red/30 rounded-xl">
      <div class="flex items-center gap-2 text-healing-red">
        <span class="text-lg">🔔</span>
        <span class="font-semibold">{{ alerts.length }} 条活跃告警</span>
      </div>
    </div>

    <!-- 老人列表 -->
    <div class="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      <div
        v-for="elderly in elderlyList"
        :key="elderly.id"
        class="elderly-card p-4 rounded-xl cursor-pointer transition-soft"
        :class="getCardClass(elderly.status)"
        @click="navigateToDetail(elderly.id)"
      >
        <!-- 头部信息 -->
        <div class="flex items-start gap-3 mb-3">
          <div class="avatar text-4xl">{{ elderly.avatar }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-bold">{{ elderly.name }}</h3>
              <span class="text-sm text-gray-500">{{ elderly.age }}岁</span>
              <div
                class="status-indicator"
                :class="`status-${elderly.status}`"
              ></div>
            </div>
            <div class="text-sm text-gray-500">
              {{ elderly.floor }}楼 {{ elderly.room }}房间
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl mb-1">{{ elderly.mood }}</div>
            <div class="health-score" :class="getScoreClass(elderly.healthScore)">
              {{ elderly.healthScore }}
            </div>
          </div>
        </div>

        <!-- 体征数据 -->
        <div class="vital-signs grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center gap-2 bg-healing-light-gray rounded-lg px-3 py-2">
            <span>❤️</span>
            <span class="text-gray-600">心率</span>
            <span class="font-semibold ml-auto">{{ getVitalSign(elderly, 'heartRate') }} bpm</span>
          </div>
          <div class="flex items-center gap-2 bg-healing-light-gray rounded-lg px-3 py-2">
            <span>🫁</span>
            <span class="text-gray-600">血氧</span>
            <span class="font-semibold ml-auto">{{ getVitalSign(elderly, 'bloodOxygen') }}%</span>
          </div>
          <div class="flex items-center gap-2 bg-healing-light-gray rounded-lg px-3 py-2">
            <span>🌡️</span>
            <span class="text-gray-600">体温</span>
            <span class="font-semibold ml-auto">{{ getVitalSign(elderly, 'temperature') }}°C</span>
          </div>
          <div class="flex items-center gap-2 bg-healing-light-gray rounded-lg px-3 py-2">
            <span>😴</span>
            <span class="text-gray-600">睡眠</span>
            <span class="font-semibold ml-auto">{{ getVitalSign(elderly, 'sleep') }}h</span>
          </div>
        </div>

        <!-- 告警信息 -->
        <div
          v-if="getElderlyAlerts(elderly.id).length > 0"
          class="mt-3 space-y-1"
        >
          <div
            v-for="alert in getElderlyAlerts(elderly.id).slice(0, 2)"
            :key="alert.id"
            class="text-xs p-2 rounded-lg flex items-center gap-2"
            :class="alert.type === 'danger' ? 'bg-healing-red/20 text-healing-red' : 'bg-healing-orange/20 text-healing-orange'"
          >
            <span>⚠️</span>
            <span class="flex-1">{{ alert.title }}</span>
            <span>{{ formatTime(alert.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { generateVitalSigns } from '@/mock/data'

const props = defineProps({
  elderlyList: {
    type: Array,
    required: true
  },
  alerts: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()

const navigateToDetail = (id) => {
  router.push(`/elderly/${id}`)
}

const getCardClass = (status) => {
  const classes = {
    danger: 'border-2 border-healing-red bg-healing-red/5 shadow-glow-red',
    warning: 'border-2 border-healing-orange bg-healing-orange/5 shadow-glow-orange',
    normal: 'border border-healing-green/30 bg-white hover:shadow-soft-lg'
  }
  return classes[status] || classes.normal
}

const getScoreClass = (score) => {
  if (score >= 80) return 'text-healing-green font-bold text-lg'
  if (score >= 60) return 'text-healing-orange font-bold text-lg'
  return 'text-healing-red font-bold text-lg'
}

const getVitalSign = (elderly, type) => {
  const vitalSigns = generateVitalSigns(elderly.id)
  const mappings = {
    heartRate: vitalSigns.heartRate,
    bloodOxygen: vitalSigns.bloodOxygen,
    temperature: vitalSigns.temperature,
    sleep: vitalSigns.sleepQuality.hours
  }
  return mappings[type]
}

const getElderlyAlerts = (elderlyId) => {
  return props.alerts.filter(a => a.elderlyId === elderlyId)
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now - date) / 60000) // 分钟差

  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.elderly-card {
  animation: fadeInUp 0.3s ease-out;
}

.elderly-card:hover {
  transform: translateY(-2px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.health-score {
  font-variant-numeric: tabular-nums;
}
</style>
