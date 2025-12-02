<template>
  <div class="compact-elderly-list card-medical h-full flex flex-col">
    <h3 class="text-sm font-semibold text-medical-text mb-3 flex items-center gap-2">
      <span class="w-1 h-4 bg-medical-primary rounded-full"></span>
      风险老人列表
    </h3>

    <!-- 分组显示 -->
    <div class="flex-1 overflow-y-auto space-y-3" style="max-height: calc(520px - 60px);">
      <!-- 高危组 -->
      <div v-if="dangerList.length > 0">
        <div class="text-xs font-semibold text-medical-danger mb-2 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-medical-danger"></div>
          高危 ({{ dangerList.length }})
        </div>
        <div class="space-y-1.5">
          <ElderlyRow
            v-for="elderly in dangerList"
            :key="elderly.id"
            :elderly="elderly"
            @click="$emit('select', elderly)"
          />
        </div>
      </div>

      <!-- 关注组 -->
      <div v-if="warningList.length > 0">
        <div class="text-xs font-semibold text-medical-warning mb-2 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-medical-warning"></div>
          关注 ({{ warningList.length }})
        </div>
        <div class="space-y-1.5">
          <ElderlyRow
            v-for="elderly in warningList"
            :key="elderly.id"
            :elderly="elderly"
            @click="$emit('select', elderly)"
          />
        </div>
      </div>

      <!-- 正常组 -->
      <div v-if="normalList.length > 0">
        <div class="text-xs font-semibold text-medical-secondary mb-2 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-medical-secondary"></div>
          正常 ({{ normalList.length }})
        </div>
        <div class="space-y-1.5">
          <ElderlyRow
            v-for="elderly in normalList.slice(0, 3)"
            :key="elderly.id"
            :elderly="elderly"
            @click="$emit('select', elderly)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ElderlyRow from './ElderlyRow.vue'

const props = defineProps({
  elderlyList: {
    type: Array,
    required: true
  }
})

defineEmits(['select'])

const dangerList = computed(() =>
  props.elderlyList.filter(e => e.status === 'danger')
)

const warningList = computed(() =>
  props.elderlyList.filter(e => e.status === 'warning')
)

const normalList = computed(() =>
  props.elderlyList.filter(e => e.status === 'normal')
)
</script>
