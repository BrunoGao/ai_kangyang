<template>
  <div class="floor-map card-soft h-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-healing-gray flex items-center gap-2">
        <span>🏢</span>
        <span>楼层分布</span>
      </h2>
      <div class="flex items-center gap-2 text-sm">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-healing-green"></div>
          <span class="text-gray-600">健康</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-healing-orange"></div>
          <span class="text-gray-600">关注</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-healing-red"></div>
          <span class="text-gray-600">紧急</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-gray-300"></div>
          <span class="text-gray-600">空房</span>
        </div>
      </div>
    </div>

    <!-- 楼层选择器 -->
    <div class="floor-tabs flex gap-2 mb-4 overflow-x-auto pb-2">
      <button
        v-for="floor in floors"
        :key="floor"
        class="floor-tab px-4 py-2 rounded-xl font-semibold transition-soft whitespace-nowrap"
        :class="currentFloor === floor ? 'bg-healing-primary text-white shadow-soft' : 'bg-healing-light-gray text-gray-600 hover:bg-gray-200'"
        @click="currentFloor = floor"
      >
        {{ floorMap[floor].name }}
      </button>
    </div>

    <!-- 楼层房间布局 -->
    <div class="floor-layout bg-healing-light-gray/50 rounded-2xl p-6 min-h-[500px]">
      <div class="text-center mb-6">
        <h3 class="text-lg font-bold text-healing-primary">{{ floorMap[currentFloor].name }}</h3>
        <p class="text-sm text-gray-500">
          共 {{ floorMap[currentFloor].rooms.length }} 个房间
          · 入住 {{ getFloorOccupancy(currentFloor) }} 人
        </p>
      </div>

      <!-- 房间网格 -->
      <div class="rooms-grid grid grid-cols-4 gap-4">
        <div
          v-for="room in floorMap[currentFloor].rooms"
          :key="room"
          class="room-card relative bg-white rounded-xl p-4 cursor-pointer transition-soft hover:shadow-soft-lg"
          :class="getRoomClass(room)"
          @click="handleRoomClick(room)"
        >
          <!-- 房间号 -->
          <div class="text-center mb-2">
            <div class="text-lg font-bold text-gray-700">{{ room }}</div>
          </div>

          <!-- 老人信息 -->
          <div v-if="getRoomElderly(room)" class="text-center">
            <div class="text-3xl mb-2">{{ getRoomElderly(room).avatar }}</div>
            <div class="text-sm font-semibold text-gray-700 mb-1">
              {{ getRoomElderly(room).name }}
            </div>
            <div class="text-xs text-gray-500 mb-2">
              {{ getRoomElderly(room).age }}岁
            </div>

            <!-- 健康评分 -->
            <div class="relative">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="getHealthBarClass(getRoomElderly(room).healthScore)"
                  :style="{ width: getRoomElderly(room).healthScore + '%' }"
                ></div>
              </div>
              <div class="text-xs font-semibold" :class="getHealthScoreClass(getRoomElderly(room).healthScore)">
                {{ getRoomElderly(room).healthScore }}分
              </div>
            </div>

            <!-- 状态指示器 -->
            <div
              v-if="getRoomElderly(room).status !== 'normal'"
              class="absolute top-2 right-2 w-3 h-3 rounded-full animate-pulse"
              :class="{
                'bg-healing-orange shadow-glow-orange': getRoomElderly(room).status === 'warning',
                'bg-healing-red shadow-glow-red': getRoomElderly(room).status === 'danger'
              }"
            ></div>
          </div>

          <!-- 空房间 -->
          <div v-else class="text-center text-gray-400 py-6">
            <div class="text-3xl mb-2">🛏️</div>
            <div class="text-xs">空房间</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 房间详情弹窗 -->
    <div
      v-if="selectedRoom"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="selectedRoom = null"
    >
      <div
        class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-soft-lg"
        @click.stop
      >
        <div v-if="getRoomElderly(selectedRoom)">
          <div class="flex items-center gap-4 mb-4">
            <div class="text-5xl">{{ getRoomElderly(selectedRoom).avatar }}</div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-800">
                {{ getRoomElderly(selectedRoom).name }}
              </h3>
              <p class="text-gray-500">
                {{ getRoomElderly(selectedRoom).age }}岁 · {{ selectedRoom }}房间
              </p>
            </div>
            <div class="text-3xl">{{ getRoomElderly(selectedRoom).mood }}</div>
          </div>

          <div class="space-y-3 mb-6">
            <div class="flex items-center justify-between p-3 bg-healing-light-gray rounded-lg">
              <span class="text-gray-600">健康评分</span>
              <span class="text-xl font-bold" :class="getHealthScoreClass(getRoomElderly(selectedRoom).healthScore)">
                {{ getRoomElderly(selectedRoom).healthScore }}分
              </span>
            </div>
            <div class="flex items-center justify-between p-3 bg-healing-light-gray rounded-lg">
              <span class="text-gray-600">联系人</span>
              <span class="font-semibold">{{ getRoomElderly(selectedRoom).contactFamily }}</span>
            </div>
          </div>

          <button
            class="w-full btn-healing"
            @click="navigateToDetail(getRoomElderly(selectedRoom).id)"
          >
            查看详细档案
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  elderlyList: {
    type: Array,
    required: true
  },
  floorMap: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const floors = computed(() => Object.keys(props.floorMap).map(Number).sort((a, b) => a - b))
const currentFloor = ref(floors.value[0])
const selectedRoom = ref(null)

const getRoomElderly = (room) => {
  return props.elderlyList.find(e => e.room === room)
}

const getRoomClass = (room) => {
  const elderly = getRoomElderly(room)
  if (!elderly) return 'border-2 border-dashed border-gray-300'

  const classes = {
    danger: 'border-2 border-healing-red shadow-glow-red',
    warning: 'border-2 border-healing-orange shadow-glow-orange',
    normal: 'border-2 border-healing-green'
  }
  return classes[elderly.status] || ''
}

const getHealthBarClass = (score) => {
  if (score >= 80) return 'bg-healing-green'
  if (score >= 60) return 'bg-healing-orange'
  return 'bg-healing-red'
}

const getHealthScoreClass = (score) => {
  if (score >= 80) return 'text-healing-green'
  if (score >= 60) return 'text-healing-orange'
  return 'text-healing-red'
}

const getFloorOccupancy = (floor) => {
  return props.elderlyList.filter(e => e.floor === floor).length
}

const handleRoomClick = (room) => {
  const elderly = getRoomElderly(room)
  if (elderly) {
    selectedRoom.value = room
  }
}

const navigateToDetail = (id) => {
  router.push(`/elderly/${id}`)
  selectedRoom.value = null
}
</script>

<style scoped>
.floor-map {
  animation: fadeIn 0.5s ease-out;
}

.room-card {
  animation: scaleIn 0.3s ease-out;
  min-height: 180px;
}

.room-card:hover {
  transform: translateY(-3px) scale(1.02);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.floor-tabs {
  scrollbar-width: thin;
}
</style>
