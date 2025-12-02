<template>
  <div class="floor-heatmap card-medical h-full flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-medical-text flex items-center gap-2">
        <span class="w-1 h-4 bg-medical-primary rounded-full"></span>
        楼层分布热力图
      </h3>
      <div class="flex items-center gap-2 text-xs text-medical-text-sub">
        <span>本层</span>
        <span class="text-medical-danger font-semibold">{{ getFloorCount(currentFloor, 'danger') }}</span>
        <span>/</span>
        <span class="text-medical-warning font-semibold">{{ getFloorCount(currentFloor, 'warning') }}</span>
        <span>/</span>
        <span class="text-medical-secondary font-semibold">{{ getFloorCount(currentFloor, 'normal') }}</span>
      </div>
    </div>

    <!-- 楼层Tab -->
    <div class="flex gap-1.5 mb-3">
      <button
        v-for="floor in floors"
        :key="floor"
        class="flex-1 px-2 py-1 text-xs font-medium rounded transition-all"
        :class="currentFloor === floor
          ? 'bg-medical-primary text-white'
          : 'bg-medical-card-soft text-medical-text-sub hover:bg-medical-primary/10'"
        @click="currentFloor = floor"
      >
        {{ floorMap[floor].name }}
      </button>
    </div>

    <!-- 房间网格 -->
    <div class="flex-1 overflow-y-auto">
      <div class="grid grid-cols-6 gap-2">
        <div
          v-for="room in floorMap[currentFloor].rooms"
          :key="room"
          class="room-cell rounded-lg border cursor-pointer transition-all hover:scale-105"
          :class="getRoomClass(room)"
          style="height: 70px;"
          @click="handleRoomClick(room)"
        >
          <div v-if="getRoomElderly(room)" class="text-center p-1.5">
            <div class="text-xs font-bold text-medical-text-sub mb-0.5">{{ room }}</div>
            <div class="text-lg mb-0.5">{{ getRoomElderly(room).avatar }}</div>
            <div class="text-xs font-semibold text-medical-text truncate">
              {{ getRoomElderly(room).name.slice(0, 3) }}
            </div>
            <div class="text-xs font-bold mt-0.5" :class="getScoreClass(getRoomElderly(room).healthScore)">
              {{ getRoomElderly(room).healthScore }}
            </div>
            <div
              v-if="getRoomElderly(room).status !== 'normal'"
              class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse"
              :class="{
                'bg-medical-warning': getRoomElderly(room).status === 'warning',
                'bg-medical-danger': getRoomElderly(room).status === 'danger'
              }"
            ></div>
          </div>
          <div v-else class="text-center p-1.5 text-medical-muted">
            <div class="text-xs font-bold mb-1">{{ room }}</div>
            <div class="text-lg">🛏️</div>
            <div class="text-xs">空房</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const floors = computed(() => Object.keys(props.floorMap).map(Number).sort())
const currentFloor = ref(floors.value[0])

const getRoomElderly = (room) => {
  return props.elderlyList.find(e => e.room === room)
}

const getRoomClass = (room) => {
  const elderly = getRoomElderly(room)
  if (!elderly) return 'bg-white border-dashed border-medical-border'

  const classes = {
    danger: 'bg-medical-danger/10 border-medical-danger',
    warning: 'bg-medical-warning/10 border-medical-warning',
    normal: 'bg-medical-secondary/10 border-medical-secondary'
  }
  return classes[elderly.status] || classes.normal
}

const getScoreClass = (score) => {
  if (score >= 80) return 'text-medical-secondary'
  if (score >= 60) return 'text-medical-warning'
  return 'text-medical-danger'
}

const getFloorCount = (floor, status) => {
  return props.elderlyList.filter(e => e.floor === floor && e.status === status).length
}

const handleRoomClick = (room) => {
  const elderly = getRoomElderly(room)
  if (elderly) {
    console.log('Room clicked:', room, elderly)
  }
}
</script>

<style scoped>
.room-cell {
  position: relative;
}
</style>
