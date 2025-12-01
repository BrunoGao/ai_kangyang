<template>
  <div id="app" class="min-h-screen bg-healing-bg">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('🌿 康养Dashboard已启动')
})
</script>

<style>
/* App级别样式已在 style.css 中定义 */
</style>
