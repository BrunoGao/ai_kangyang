<template>
  <div class="dashboard min-h-screen p-4 md:p-6">
    <!-- 顶部信息栏 -->
    <HeaderBar :statistics="statistics" :weather="weather" />

    <!-- 主内容区域 -->
    <div class="grid grid-cols-12 gap-6 mt-6">
      <!-- 左侧：风险老人列表 -->
      <div class="col-span-12 lg:col-span-3">
        <RiskElderlyList :elderlyList="sortedElderlyList" :alerts="activeAlerts" />
      </div>

      <!-- 中间：楼层地图 -->
      <div class="col-span-12 lg:col-span-6">
        <FloorMap :elderlyList="elderlyList" :floorMap="floorMap" />
      </div>

      <!-- 右侧：AI健康洞察 -->
      <div class="col-span-12 lg:col-span-3">
        <AIInsights :insights="aiInsights" />
      </div>
    </div>

    <!-- 底部：体征数据概览 -->
    <div class="mt-6">
      <VitalSignsOverview :elderlyList="elderlyList" />
    </div>

    <!-- 告警浮层 -->
    <AlertNotifications :alerts="activeAlerts" @dismiss="dismissAlert" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import RiskElderlyList from '@/components/RiskElderlyList.vue'
import FloorMap from '@/components/FloorMap.vue'
import AIInsights from '@/components/AIInsights.vue'
import VitalSignsOverview from '@/components/VitalSignsOverview.vue'
import AlertNotifications from '@/components/AlertNotifications.vue'
import {
  elderlyList as initialElderlyList,
  alerts as initialAlerts,
  aiInsights as initialAiInsights,
  floorMap as initialFloorMap,
  statistics as initialStatistics,
  weather as initialWeather,
  generateVitalSigns
} from '@/mock/data'

// 响应式数据
const elderlyList = ref([...initialElderlyList])
const alerts = ref([...initialAlerts])
const aiInsights = ref([...initialAiInsights])
const floorMap = ref(initialFloorMap)
const statistics = ref({ ...initialStatistics })
const weather = ref({ ...initialWeather })

// 计算属性：按风险排序的老人列表
const sortedElderlyList = computed(() => {
  const statusOrder = { danger: 0, warning: 1, normal: 2 }
  return [...elderlyList.value].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return a.healthScore - b.healthScore
  })
})

// 活跃的告警
const activeAlerts = computed(() =>
  alerts.value.filter(a => a.status === 'active')
)

// 关闭告警
const dismissAlert = (alertId) => {
  const alert = alerts.value.find(a => a.id === alertId)
  if (alert) {
    alert.status = 'dismissed'
  }
}

// 模拟实时数据更新
let updateInterval = null

const updateVitalSigns = () => {
  elderlyList.value.forEach(elderly => {
    const newVitalSigns = generateVitalSigns(elderly.id)
    // 这里可以更新老人的实时体征数据
    // 实际应用中会从WebSocket或API获取
  })
}

onMounted(() => {
  // 每30秒更新一次数据
  updateInterval = setInterval(updateVitalSigns, 30000)
  console.log('📊 Dashboard已加载，实时监控中...')
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
