<template>
  <div class="header-bar card-soft gradient-healing text-white">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <!-- 左侧：园区信息 -->
      <div class="flex items-center gap-4">
        <div class="text-3xl">🏥</div>
        <div>
          <h1 class="text-2xl font-bold mb-1">康泰养老院</h1>
          <p class="text-sm opacity-90">老人体征监测管理平台</p>
        </div>
      </div>

      <!-- 中间：统计信息 -->
      <div class="flex flex-wrap gap-6">
        <StatCard
          icon="👥"
          label="在院老人"
          :value="statistics.totalElderly"
          color="white"
        />
        <StatCard
          icon="✅"
          label="健康正常"
          :value="statistics.normalCount"
          color="green"
        />
        <StatCard
          icon="⚠️"
          label="需要关注"
          :value="statistics.warningCount"
          color="orange"
        />
        <StatCard
          icon="🚨"
          label="紧急处理"
          :value="statistics.dangerCount"
          color="red"
          :pulse="statistics.dangerCount > 0"
        />
      </div>

      <!-- 右侧：时间和天气 -->
      <div class="flex items-center gap-6">
        <!-- 天气 -->
        <div class="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-3">
          <div class="text-2xl">{{ weather.icon }}</div>
          <div>
            <div class="font-semibold">{{ weather.temperature }}°C</div>
            <div class="text-xs opacity-90">{{ weather.condition }}</div>
          </div>
        </div>

        <!-- 时间 -->
        <div class="text-right">
          <div class="text-lg font-semibold">{{ currentTime }}</div>
          <div class="text-sm opacity-90">{{ currentDate }}</div>
        </div>
      </div>
    </div>

    <!-- 活跃告警提示 -->
    <div
      v-if="statistics.activeAlerts > 0"
      class="mt-4 bg-healing-red/20 border-2 border-healing-red/50 rounded-xl px-4 py-3 flex items-center gap-3"
    >
      <div class="text-xl animate-bounce-slow">🔔</div>
      <div class="flex-1">
        <span class="font-semibold">{{ statistics.activeAlerts }} 条活跃告警</span>
        <span class="ml-2 opacity-90">请及时处理</span>
      </div>
      <button
        class="px-4 py-2 bg-white/30 hover:bg-white/40 rounded-lg transition-all"
        @click="$emit('view-alerts')"
      >
        查看详情
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import StatCard from './StatCard.vue'

defineProps({
  statistics: {
    type: Object,
    required: true
  },
  weather: {
    type: Object,
    required: true
  }
})

defineEmits(['view-alerts'])

const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.header-bar {
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
