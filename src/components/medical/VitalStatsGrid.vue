<template>
  <div class="vital-stats-grid card-medical h-full flex flex-col">
    <h3 class="text-sm font-semibold text-medical-text mb-3 flex items-center gap-2">
      <span class="w-1 h-4 bg-medical-primary rounded-full"></span>
      体征数据概览
    </h3>

    <!-- 2x2 网格 -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <!-- 平均心率 -->
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-medical-text-sub">❤️ 平均心率</span>
          <span class="text-xs px-1.5 py-0.5 rounded-full bg-medical-secondary/10 text-medical-secondary">
            ↑ +2
          </span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-bold text-medical-text font-tabular">{{ averageHeartRate }}</span>
          <span class="text-xs text-medical-text-sub">bpm</span>
        </div>
        <div class="text-xs text-medical-muted mt-1">昨日: {{ averageHeartRate - 2 }}</div>
      </div>

      <!-- 平均血氧 -->
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-medical-text-sub">🫁 平均血氧</span>
          <span class="text-xs px-1.5 py-0.5 rounded-full bg-medical-muted/10 text-medical-text-sub">
            → 0
          </span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-bold text-medical-text font-tabular">{{ averageBloodOxygen }}</span>
          <span class="text-xs text-medical-text-sub">%</span>
        </div>
        <div class="text-xs text-medical-muted mt-1">昨日: {{ averageBloodOxygen }}</div>
      </div>

      <!-- 平均体温 -->
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-medical-text-sub">🌡️ 平均体温</span>
          <span class="text-xs px-1.5 py-0.5 rounded-full bg-medical-warning/10 text-medical-warning">
            ↑ +0.2
          </span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-bold text-medical-text font-tabular">{{ averageTemperature }}</span>
          <span class="text-xs text-medical-text-sub">°C</span>
        </div>
        <div class="text-xs text-medical-muted mt-1">昨日: {{ (averageTemperature - 0.2).toFixed(1) }}</div>
      </div>

      <!-- 平均睡眠 -->
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-medical-text-sub">😴 平均睡眠</span>
          <span class="text-xs px-1.5 py-0.5 rounded-full bg-medical-secondary/10 text-medical-secondary">
            ↑ +0.5
          </span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-bold text-medical-text font-tabular">{{ averageSleep }}</span>
          <span class="text-xs text-medical-text-sub">h</span>
        </div>
        <div class="text-xs text-medical-muted mt-1">昨日: {{ (averageSleep - 0.5).toFixed(1) }}</div>
      </div>
    </div>

    <!-- 设备统计 -->
    <div class="mt-auto pt-3 border-t border-medical-border">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-medical-text">设备状态</span>
        <span class="text-xs text-medical-text-sub">
          在线率 {{ deviceOnlineRate }}%
        </span>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex-1 h-2 bg-medical-card-soft rounded-full overflow-hidden">
          <div
            class="h-full bg-medical-secondary rounded-full transition-all"
            :style="{ width: deviceOnlineRate + '%' }"
          ></div>
        </div>
        <span class="text-xs font-semibold text-medical-text">
          {{ onlineDevices }}/{{ totalDevices }}
        </span>
      </div>

      <!-- 电量统计 -->
      <div class="grid grid-cols-3 gap-2 mt-3">
        <div class="text-center px-2 py-1.5 bg-medical-secondary/10 rounded">
          <div class="text-lg font-bold text-medical-secondary">{{ deviceBatteryStats.good }}</div>
          <div class="text-xs text-medical-text-sub">充足</div>
        </div>
        <div class="text-center px-2 py-1.5 bg-medical-warning/10 rounded">
          <div class="text-lg font-bold text-medical-warning">{{ deviceBatteryStats.medium }}</div>
          <div class="text-xs text-medical-text-sub">需充电</div>
        </div>
        <div class="text-center px-2 py-1.5 bg-medical-danger/10 rounded">
          <div class="text-lg font-bold text-medical-danger">{{ deviceBatteryStats.low }}</div>
          <div class="text-xs text-medical-text-sub">不足</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { generateVitalSigns } from '@/mock/data'

const props = defineProps({
  elderlyList: {
    type: Array,
    required: true
  }
})

const averageHeartRate = computed(() => {
  const total = props.elderlyList.reduce((sum, elderly) => {
    const vital = generateVitalSigns(elderly.id)
    return sum + vital.heartRate
  }, 0)
  return Math.round(total / props.elderlyList.length)
})

const averageBloodOxygen = computed(() => {
  const total = props.elderlyList.reduce((sum, elderly) => {
    const vital = generateVitalSigns(elderly.id)
    return sum + vital.bloodOxygen
  }, 0)
  return Math.round(total / props.elderlyList.length)
})

const averageTemperature = computed(() => {
  const total = props.elderlyList.reduce((sum, elderly) => {
    const vital = generateVitalSigns(elderly.id)
    return sum + parseFloat(vital.temperature)
  }, 0)
  return (total / props.elderlyList.length).toFixed(1)
})

const averageSleep = computed(() => {
  const total = props.elderlyList.reduce((sum, elderly) => {
    const vital = generateVitalSigns(elderly.id)
    return sum + parseFloat(vital.sleepQuality.hours)
  }, 0)
  return (total / props.elderlyList.length).toFixed(1)
})

const totalDevices = computed(() => {
  return props.elderlyList.reduce((sum, elderly) =>
    sum + elderly.devices.length, 0
  )
})

const onlineDevices = computed(() => {
  return props.elderlyList.reduce((sum, elderly) =>
    sum + elderly.devices.filter(d => d.status === 'online').length, 0
  )
})

const deviceOnlineRate = computed(() => {
  return Math.round((onlineDevices.value / totalDevices.value) * 100)
})

const deviceBatteryStats = computed(() => {
  let good = 0, medium = 0, low = 0

  props.elderlyList.forEach(elderly => {
    elderly.devices.forEach(device => {
      if (device.battery >= 60) good++
      else if (device.battery >= 30) medium++
      else low++
    })
  })

  return { good, medium, low }
})
</script>

<style scoped>
.stat-card {
  @apply px-3 py-2.5 bg-medical-card-soft rounded-lg transition-all hover:bg-white hover:border hover:border-medical-border;
}
</style>
