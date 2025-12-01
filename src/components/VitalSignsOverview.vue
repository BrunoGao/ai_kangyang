<template>
  <div class="vital-signs-overview card-soft">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-healing-gray flex items-center gap-2">
        <span>📊</span>
        <span>体征数据概览</span>
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

    <!-- 体征卡片网格 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <VitalCard
        icon="❤️"
        title="平均心率"
        :value="averageHeartRate"
        unit="bpm"
        trend="stable"
        color="red"
      />
      <VitalCard
        icon="🫁"
        title="平均血氧"
        :value="averageBloodOxygen"
        unit="%"
        trend="up"
        color="blue"
      />
      <VitalCard
        icon="🌡️"
        title="平均体温"
        :value="averageTemperature"
        unit="°C"
        trend="stable"
        color="orange"
      />
      <VitalCard
        icon="😴"
        title="平均睡眠"
        :value="averageSleep"
        unit="小时"
        trend="up"
        color="purple"
      />
    </div>

    <!-- 设备状态 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 设备在线率 -->
      <div class="bg-healing-light-gray/50 rounded-xl p-4">
        <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>📱</span>
          <span>设备在线状态</span>
        </h3>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">在线设备</span>
          <span class="text-lg font-bold text-healing-green">{{ onlineDevices }} / {{ totalDevices }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-healing-green h-3 rounded-full transition-all"
            :style="{ width: deviceOnlineRate + '%' }"
          ></div>
        </div>
        <div class="text-xs text-gray-500 mt-1 text-right">
          在线率 {{ deviceOnlineRate }}%
        </div>
      </div>

      <!-- 设备电量统计 -->
      <div class="bg-healing-light-gray/50 rounded-xl p-4">
        <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>🔋</span>
          <span>设备电量统计</span>
        </h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">电量充足 (≥60%)</span>
            <span class="font-semibold text-healing-green">{{ deviceBatteryStats.good }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">需要充电 (30-60%)</span>
            <span class="font-semibold text-healing-orange">{{ deviceBatteryStats.medium }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">电量不足 (<30%)</span>
            <span class="font-semibold text-healing-red">{{ deviceBatteryStats.low }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VitalCard from './VitalCard.vue'
import { generateVitalSigns } from '@/mock/data'

const props = defineProps({
  elderlyList: {
    type: Array,
    required: true
  }
})

const periods = [
  { label: '今日', value: 'today' },
  { label: '7天', value: '7days' },
  { label: '30天', value: '30days' }
]

const selectedPeriod = ref('today')

// 计算平均体征数据
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

// 设备统计
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
.vital-signs-overview {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
