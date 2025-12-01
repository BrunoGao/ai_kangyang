<template>
  <!-- 告警浮层 - 固定在右下角 -->
  <div class="alert-notifications fixed bottom-6 right-6 z-50 space-y-3 max-w-md">
    <TransitionGroup name="alert">
      <div
        v-for="alert in visibleAlerts"
        :key="alert.id"
        class="alert-card rounded-2xl p-4 shadow-soft-lg cursor-pointer transition-soft"
        :class="getAlertClass(alert.type)"
        @click="handleAlertClick(alert)"
      >
        <div class="flex items-start gap-3">
          <!-- 图标 -->
          <div class="text-2xl" :class="{ 'animate-bounce-slow': alert.type === 'danger' }">
            {{ getAlertIcon(alert.type) }}
          </div>

          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-bold text-gray-800">{{ alert.title }}</h4>
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="getPriorityClass(alert.priority)"
              >
                {{ getPriorityText(alert.priority) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ alert.message }}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ alert.location }}</span>
              <span>{{ formatTime(alert.timestamp) }}</span>
            </div>
          </div>

          <!-- 关闭按钮 -->
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click.stop="dismissAlert(alert.id)"
          >
            ✕
          </button>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2 mt-3">
          <button
            class="flex-1 px-3 py-2 bg-white/50 hover:bg-white/80 rounded-lg text-sm font-medium transition-all"
            @click.stop="handleAlert(alert.id)"
          >
            立即处理
          </button>
          <button
            class="px-3 py-2 bg-white/30 hover:bg-white/50 rounded-lg text-sm transition-all"
            @click.stop="dismissAlert(alert.id)"
          >
            忽略
          </button>
        </div>
      </div>
    </TransitionGroup>

    <!-- 告警计数指示器 -->
    <div
      v-if="alerts.length > maxVisible"
      class="text-center text-sm text-gray-500 bg-white rounded-xl px-4 py-2 shadow-soft"
    >
      还有 {{ alerts.length - maxVisible }} 条告警未显示
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  alerts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dismiss', 'handle', 'click'])

const maxVisible = 3

const visibleAlerts = computed(() =>
  props.alerts.slice(0, maxVisible)
)

const getAlertClass = (type) => {
  const classes = {
    danger: 'bg-healing-red/95 text-white border-2 border-healing-red shadow-glow-red',
    warning: 'bg-healing-orange/95 text-white border-2 border-healing-orange shadow-glow-orange',
    info: 'bg-healing-blue/95 text-white border-2 border-healing-blue'
  }
  return classes[type] || classes.info
}

const getAlertIcon = (type) => {
  const icons = {
    danger: '🚨',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || 'ℹ️'
}

const getPriorityClass = (priority) => {
  const classes = {
    high: 'bg-white/30 text-white',
    medium: 'bg-white/20 text-white',
    low: 'bg-white/10 text-white'
  }
  return classes[priority] || classes.medium
}

const getPriorityText = (priority) => {
  const texts = {
    high: '紧急',
    medium: '重要',
    low: '一般'
  }
  return texts[priority] || '一般'
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

const dismissAlert = (alertId) => {
  emit('dismiss', alertId)
}

const handleAlert = (alertId) => {
  emit('handle', alertId)
}

const handleAlertClick = (alert) => {
  emit('click', alert)
}
</script>

<style scoped>
.alert-card {
  animation: slideInRight 0.4s ease-out;
  backdrop-filter: blur(10px);
}

.alert-card:hover {
  transform: translateX(-4px) scale(1.02);
}

/* Vue Transition */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.4s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.alert-move {
  transition: transform 0.4s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
