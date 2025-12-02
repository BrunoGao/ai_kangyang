<template>
  <div
    class="elderly-row px-3 py-2 rounded-lg border cursor-pointer transition-all hover:border-medical-primary"
    :class="getRowClass(elderly.status)"
    style="height: 56px;"
  >
    <!-- 第一行：基本信息 -->
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="text-base">{{ elderly.avatar }}</span>
        <span class="text-sm font-semibold text-medical-text truncate">{{ elderly.name }}</span>
        <span class="text-xs text-medical-text-sub">{{ elderly.age }}岁</span>
        <span class="text-xs text-medical-text-sub">{{ elderly.floor }}F-{{ elderly.room }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold" :class="getScoreClass(elderly.healthScore)">
          {{ elderly.healthScore }}
        </span>
        <span class="text-xs">{{ getTrendIcon(elderly.healthScore) }}</span>
      </div>
    </div>

    <!-- 第二行：体征数据 -->
    <div class="flex items-center justify-between text-xs text-medical-text-sub">
      <div class="flex items-center gap-3">
        <span>❤️ {{ getVitalSign(elderly, 'heartRate') }}</span>
        <span>🫁 {{ getVitalSign(elderly, 'bloodOxygen') }}%</span>
        <span>🌡️ {{ getVitalSign(elderly, 'temperature') }}°</span>
        <span>😴 {{ getVitalSign(elderly, 'sleep') }}h</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateVitalSigns } from '@/mock/data'

const props = defineProps({
  elderly: {
    type: Object,
    required: true
  }
})

const getRowClass = (status) => {
  const classes = {
    danger: 'bg-medical-danger/5 border-medical-danger',
    warning: 'bg-medical-warning/5 border-medical-warning',
    normal: 'bg-white border-medical-border'
  }
  return classes[status] || classes.normal
}

const getScoreClass = (score) => {
  if (score >= 80) return 'text-medical-secondary'
  if (score >= 60) return 'text-medical-warning'
  return 'text-medical-danger'
}

const getTrendIcon = (score) => {
  if (score > 80) return '↗'
  if (score < 60) return '↘'
  return '→'
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
</script>

<style scoped>
.elderly-row:hover {
  transform: translateX(2px);
}
</style>
