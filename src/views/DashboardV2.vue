<template>
  <div class="dashboard-medical h-screen overflow-hidden flex flex-col">
    <!-- 顶部 KPI 条 - 120px -->
    <div class="header-kpi bg-medical-card border-b border-medical-border" style="height: 120px;">
      <div class="h-full px-6 flex items-center justify-between">
        <!-- 左：品牌信息 -->
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            康
          </div>
          <div>
            <h1 class="text-xl font-bold text-medical-text">康泰养老院</h1>
            <p class="text-xs text-medical-text-sub">老人体征监测管理平台</p>
          </div>
        </div>

        <!-- 中：核心 KPI -->
        <div class="flex items-center gap-3">
          <div class="kpi-card">
            <div class="kpi-value">{{ statistics.totalElderly }}</div>
            <div class="kpi-label">在院老人</div>
          </div>
          <div class="kpi-card bg-gradient-to-br from-medical-secondary/10 to-medical-secondary/5 border-medical-secondary/30">
            <div class="kpi-value text-medical-secondary">{{ statistics.normalCount }}</div>
            <div class="kpi-label">健康正常</div>
          </div>
          <div class="kpi-card bg-gradient-to-br from-medical-warning/10 to-medical-warning/5 border-medical-warning/30">
            <div class="kpi-value text-medical-warning">{{ statistics.warningCount }}</div>
            <div class="kpi-label">需要关注</div>
          </div>
          <div class="kpi-card bg-gradient-to-br from-medical-danger/10 to-medical-danger/5 border-medical-danger/30">
            <div class="kpi-value text-medical-danger">{{ statistics.dangerCount }}</div>
            <div class="kpi-label">急危处理</div>
          </div>
        </div>

        <!-- 右：时间天气 -->
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-lg font-semibold text-medical-text">{{ currentTime }}</div>
            <div class="text-xs text-medical-text-sub">{{ currentDate }}</div>
          </div>
          <div class="flex items-center gap-2 px-3 py-2 bg-medical-card-soft rounded-lg">
            <span class="text-lg">{{ weather.icon }}</span>
            <div>
              <div class="text-sm font-semibold">{{ weather.temperature }}°C</div>
              <div class="text-xs text-medical-text-sub">{{ weather.condition }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 - 520px -->
    <div class="main-content flex-1 px-6 py-4" style="height: 520px;">
      <div class="grid grid-cols-12 gap-4 h-full">
        <!-- 左栏：风险老人列表 - 3列 -->
        <div class="col-span-3 h-full">
          <CompactElderlyList
            :elderlyList="sortedElderlyList"
            @select="handleSelectElderly"
          />
        </div>

        <!-- 中间：健康趋势监控中心 - 6列 -->
        <div class="col-span-6 h-full">
          <TrendMonitorCenter
            :elderlyList="elderlyList"
            :selectedElderly="selectedElderly"
          />
        </div>

        <!-- 右栏：AI决策中心 - 3列 -->
        <div class="col-span-3 h-full">
          <AIDecisionCenter
            :insights="aiInsights"
            :alerts="activeAlerts"
          />
        </div>
      </div>
    </div>

    <!-- 底部区域 - 340px -->
    <div class="bottom-section px-6 pb-4" style="height: 340px;">
      <div class="grid grid-cols-2 gap-4 h-full">
        <!-- 左：楼层热力图 -->
        <div class="h-full">
          <CompactFloorHeatmap
            :elderlyList="elderlyList"
            :floorMap="floorMap"
          />
        </div>

        <!-- 右：体征统计 -->
        <div class="h-full">
          <VitalStatsGrid :elderlyList="elderlyList" />
        </div>
      </div>
    </div>

    <!-- 告警通知浮层 -->
    <AlertNotifications :alerts="activeAlerts" @dismiss="dismissAlert" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CompactElderlyList from '@/components/medical/CompactElderlyList.vue'
import TrendMonitorCenter from '@/components/medical/TrendMonitorCenter.vue'
import AIDecisionCenter from '@/components/medical/AIDecisionCenter.vue'
import CompactFloorHeatmap from '@/components/medical/CompactFloorHeatmap.vue'
import VitalStatsGrid from '@/components/medical/VitalStatsGrid.vue'
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
const selectedElderly = ref(null)
const currentTime = ref('')
const currentDate = ref('')

// 排序的老人列表
const sortedElderlyList = computed(() => {
  const statusOrder = { danger: 0, warning: 1, normal: 2 }
  return [...elderlyList.value].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return a.healthScore - b.healthScore
  })
})

// 活跃告警
const activeAlerts = computed(() =>
  alerts.value.filter(a => a.status === 'active')
)

// 选择老人
const handleSelectElderly = (elderly) => {
  selectedElderly.value = elderly
}

// 关闭告警
const dismissAlert = (alertId) => {
  const alert = alerts.value.find(a => a.id === alertId)
  if (alert) {
    alert.status = 'dismissed'
  }
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}

let timeInterval = null
let dataInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  dataInterval = setInterval(() => {
    elderlyList.value.forEach(elderly => {
      generateVitalSigns(elderly.id)
    })
  }, 30000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (dataInterval) clearInterval(dataInterval)
})
</script>

<style scoped>
.dashboard-medical {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.kpi-card {
  @apply px-4 py-2 bg-medical-card-soft border border-medical-border rounded-xl text-center transition-all;
  min-width: 90px;
}

.kpi-card:hover {
  @apply transform -translate-y-0.5;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.kpi-value {
  @apply text-2xl font-bold text-medical-text mb-0.5;
  font-variant-numeric: tabular-nums;
}

.kpi-label {
  @apply text-xs text-medical-text-sub;
}
</style>
