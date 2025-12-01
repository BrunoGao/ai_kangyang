<template>
  <div
    class="stat-card flex items-center gap-3 bg-white/20 rounded-xl px-4 py-3 transition-soft"
    :class="{ 'pulse-healing': pulse }"
  >
    <div class="text-2xl">{{ icon }}</div>
    <div>
      <div class="text-2xl font-bold font-tabular">{{ value }}</div>
      <div class="text-xs opacity-90">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  value: [String, Number],
  color: String,
  pulse: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.stat-card:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.3);
}
</style>
