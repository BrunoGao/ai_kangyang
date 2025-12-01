<template>
  <div class="vital-card bg-healing-light-gray/50 rounded-xl p-4 transition-soft hover:shadow-soft-lg">
    <div class="flex items-start justify-between mb-2">
      <div class="text-3xl">{{ icon }}</div>
      <div
        v-if="trend"
        class="text-xs px-2 py-1 rounded-full"
        :class="getTrendClass(trend)"
      >
        {{ getTrendText(trend) }}
      </div>
    </div>
    <div class="text-sm text-gray-600 mb-1">{{ title }}</div>
    <div class="flex items-baseline gap-1">
      <span class="text-2xl font-bold text-gray-800 font-tabular">{{ value }}</span>
      <span class="text-sm text-gray-500">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  value: [String, Number],
  unit: String,
  trend: String,
  color: String
})

const getTrendClass = (trend) => {
  const classes = {
    up: 'bg-healing-green/20 text-healing-green',
    down: 'bg-healing-red/20 text-healing-red',
    stable: 'bg-gray-300 text-gray-600'
  }
  return classes[trend] || classes.stable
}

const getTrendText = (trend) => {
  const texts = {
    up: '↑ 改善',
    down: '↓ 下降',
    stable: '→ 稳定'
  }
  return texts[trend] || '→ 稳定'
}
</script>

<style scoped>
.vital-card:hover {
  transform: translateY(-2px);
}
</style>
