<template>
  <div class="elderly-detail min-h-screen p-4 md:p-6">
    <!-- 返回按钮 -->
    <button
      class="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:shadow-soft transition-soft text-gray-700"
      @click="goBack"
    >
      <span>←</span>
      <span>返回主页</span>
    </button>

    <div v-if="elderly" class="space-y-6">
      <!-- 个人信息卡片 -->
      <div class="card-soft">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- 头像和基本信息 -->
          <div class="flex-shrink-0 text-center md:text-left">
            <div class="inline-block text-8xl mb-4">{{ elderly.avatar }}</div>
            <div
              class="health-score-circle mx-auto md:mx-0"
              :style="getScoreCircleStyle(elderly.healthScore)"
            >
              <div class="score-text">
                <div class="text-3xl font-bold">{{ elderly.healthScore }}</div>
                <div class="text-sm opacity-75">健康评分</div>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  {{ elderly.name }}
                  <span class="text-4xl">{{ elderly.mood }}</span>
                </h1>
                <div class="flex items-center gap-4 text-gray-600">
                  <span>{{ elderly.age }}岁</span>
                  <span>·</span>
                  <span>{{ elderly.gender === 'male' ? '男' : '女' }}</span>
                  <span>·</span>
                  <span>{{ elderly.floor }}楼 {{ elderly.room }}房间</span>
                </div>
              </div>
              <div
                class="status-badge px-4 py-2 rounded-xl font-semibold"
                :class="getStatusBadgeClass(elderly.status)"
              >
                {{ getStatusText(elderly.status) }}
              </div>
            </div>

            <!-- 信息网格 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon="📅" label="入院时间" :value="formatDate(elderly.admissionDate)" />
              <InfoItem icon="👨‍👩‍👧" label="联系人" :value="elderly.contactFamily" />
              <InfoItem icon="📞" label="联系电话" :value="elderly.contactPhone" />
              <InfoItem icon="🏥" label="既往病史" :value="elderly.medicalHistory.join('、')" />
              <InfoItem icon="⚠️" label="过敏史" :value="elderly.allergies.length > 0 ? elderly.allergies.join('、') : '无'" />
            </div>
          </div>
        </div>
      </div>

      <!-- 实时体征数据 -->
      <div class="card-soft">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>💓</span>
          <span>实时体征监测</span>
          <span class="ml-auto text-sm font-normal text-gray-500">
            更新于 {{ currentTime }}
          </span>
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VitalSignCard
            icon="❤️"
            label="心率"
            :value="vitalSigns.heartRate"
            unit="bpm"
            :normal="vitalSigns.heartRate >= 60 && vitalSigns.heartRate <= 100"
          />
          <VitalSignCard
            icon="🫁"
            label="血氧饱和度"
            :value="vitalSigns.bloodOxygen"
            unit="%"
            :normal="vitalSigns.bloodOxygen >= 95"
          />
          <VitalSignCard
            icon="🌡️"
            label="体温"
            :value="vitalSigns.temperature"
            unit="°C"
            :normal="vitalSigns.temperature >= 36.0 && vitalSigns.temperature <= 37.3"
          />
          <VitalSignCard
            icon="🩸"
            label="血压"
            :value="`${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`"
            unit="mmHg"
            :normal="vitalSigns.bloodPressure.systolic < 140 && vitalSigns.bloodPressure.diastolic < 90"
          />
        </div>
      </div>

      <!-- 历史趋势图表 -->
      <div class="card-soft">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📈</span>
          <span>7日体征趋势</span>
        </h2>
        <div ref="trendChart" class="h-80"></div>
      </div>

      <!-- 睡眠质量分析 -->
      <div class="card-soft">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>😴</span>
          <span>睡眠质量分析</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-6 bg-healing-light-gray rounded-xl">
            <div class="text-4xl font-bold text-healing-primary mb-2">
              {{ vitalSigns.sleepQuality.hours }}h
            </div>
            <div class="text-gray-600">总睡眠时长</div>
          </div>
          <div class="text-center p-6 bg-healing-light-gray rounded-xl">
            <div class="text-4xl font-bold text-healing-green mb-2">
              {{ vitalSigns.sleepQuality.deepSleep }}h
            </div>
            <div class="text-gray-600">深度睡眠</div>
          </div>
          <div class="text-center p-6 bg-healing-light-gray rounded-xl">
            <div class="text-4xl font-bold text-healing-blue mb-2">
              {{ vitalSigns.sleepQuality.score }}分
            </div>
            <div class="text-gray-600">睡眠评分</div>
          </div>
        </div>
      </div>

      <!-- 设备状态 -->
      <div class="card-soft">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📱</span>
          <span>监测设备状态</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="device in elderly.devices"
            :key="device.type"
            class="device-card p-4 border-2 rounded-xl transition-soft"
            :class="device.status === 'online' ? 'border-healing-green bg-healing-green/5' : 'border-gray-300 bg-gray-50'"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="font-semibold text-gray-800">{{ device.name }}</div>
              <div
                class="status-dot w-3 h-3 rounded-full"
                :class="device.status === 'online' ? 'bg-healing-green' : 'bg-gray-400'"
              ></div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="getBatteryClass(device.battery)"
                  :style="{ width: device.battery + '%' }"
                ></div>
              </div>
              <div class="text-sm font-semibold text-gray-600">
                {{ device.battery }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card-soft text-center py-12">
      <div class="text-6xl mb-4">🤔</div>
      <div class="text-xl text-gray-600">未找到该老人信息</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  elderlyList,
  generateVitalSigns,
  generateHistoricalData
} from '@/mock/data'

const route = useRoute()
const router = useRouter()

const elderlyId = computed(() => parseInt(route.params.id))
const elderly = computed(() => elderlyList.find(e => e.id === elderlyId.value))
const vitalSigns = ref({})
const currentTime = ref('')
const trendChart = ref(null)

let chart = null
let timeInterval = null

const goBack = () => {
  router.push('/')
}

const getStatusBadgeClass = (status) => {
  const classes = {
    normal: 'bg-healing-green text-white',
    warning: 'bg-healing-orange text-white',
    danger: 'bg-healing-red text-white'
  }
  return classes[status] || classes.normal
}

const getStatusText = (status) => {
  const texts = {
    normal: '健康正常',
    warning: '需要关注',
    danger: '紧急处理'
  }
  return texts[status] || '正常'
}

const getScoreCircleStyle = (score) => {
  let color = '#6EC28C' // 绿色
  if (score < 60) color = '#FF6B6B' // 红色
  else if (score < 80) color = '#FFA45B' // 橙色

  return {
    background: `conic-gradient(${color} ${score * 3.6}deg, #f0f0f0 ${score * 3.6}deg)`
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getBatteryClass = (battery) => {
  if (battery >= 60) return 'bg-healing-green'
  if (battery >= 30) return 'bg-healing-orange'
  return 'bg-healing-red'
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN')
}

const updateVitalSigns = () => {
  if (elderly.value) {
    vitalSigns.value = generateVitalSigns(elderly.value.id)
  }
}

const initChart = () => {
  if (!trendChart.value || !elderly.value) return

  chart = echarts.init(trendChart.value)
  const historicalData = generateHistoricalData(elderly.value.id)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#80C4A8',
      borderWidth: 1
    },
    legend: {
      data: ['心率', '血氧', '收缩压'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: historicalData.map(d => d.date.slice(5)),
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '心率',
        type: 'line',
        data: historicalData.map(d => d.heartRate),
        smooth: true,
        lineStyle: { color: '#FF6B6B', width: 3 },
        itemStyle: { color: '#FF6B6B' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
              { offset: 1, color: 'rgba(255, 107, 107, 0.05)' }
            ]
          }
        }
      },
      {
        name: '血氧',
        type: 'line',
        data: historicalData.map(d => d.bloodOxygen),
        smooth: true,
        lineStyle: { color: '#7AB6E9', width: 3 },
        itemStyle: { color: '#7AB6E9' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(122, 182, 233, 0.3)' },
              { offset: 1, color: 'rgba(122, 182, 233, 0.05)' }
            ]
          }
        }
      },
      {
        name: '收缩压',
        type: 'line',
        data: historicalData.map(d => d.bloodPressureSystolic),
        smooth: true,
        lineStyle: { color: '#80C4A8', width: 3 },
        itemStyle: { color: '#80C4A8' },
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
        }
      }
    ]
  }

  chart.setOption(option)

  window.addEventListener('resize', () => chart?.resize())
}

onMounted(() => {
  updateTime()
  updateVitalSigns()
  timeInterval = setInterval(() => {
    updateTime()
    updateVitalSigns()
  }, 5000)

  initChart()
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (chart) chart.dispose()
})
</script>

<script>
// 独立组件定义
export const InfoItem = {
  props: ['icon', 'label', 'value'],
  template: `
    <div class="flex items-start gap-3 p-3 bg-healing-light-gray rounded-lg">
      <div class="text-2xl">{{ icon }}</div>
      <div class="flex-1">
        <div class="text-xs text-gray-500 mb-1">{{ label }}</div>
        <div class="font-semibold text-gray-800">{{ value }}</div>
      </div>
    </div>
  `
}

export const VitalSignCard = {
  props: ['icon', 'label', 'value', 'unit', 'normal'],
  template: `
    <div class="p-4 rounded-xl transition-soft" :class="normal ? 'bg-healing-green/10 border-2 border-healing-green' : 'bg-healing-red/10 border-2 border-healing-red'">
      <div class="text-3xl text-center mb-2">{{ icon }}</div>
      <div class="text-center">
        <div class="text-2xl font-bold mb-1" :class="normal ? 'text-healing-green' : 'text-healing-red'">
          {{ value }} <span class="text-sm font-normal">{{ unit }}</span>
        </div>
        <div class="text-xs text-gray-600">{{ label }}</div>
      </div>
    </div>
  `
}
</script>

<style scoped>
.elderly-detail {
  animation: fadeIn 0.5s ease-out;
}

.health-score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.health-score-circle::before {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
}

.score-text {
  position: relative;
  z-index: 1;
  text-align: center;
}

.status-dot {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
