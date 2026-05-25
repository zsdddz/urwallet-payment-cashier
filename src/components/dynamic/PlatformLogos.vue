<template>
  <div class="field-wrapper">
    <div v-if="element.label" class="field-label-row">
      <span class="field-label">{{ element.label }}</span>
    </div>

    <div class="logos-grid">
      <div
        v-for="opt in element.options || []"
        :key="opt.value"
        class="logo-item"
      >
        <img v-if="opt.icon_url" :src="opt.icon_url" :alt="opt.label" class="logo-img" />
        <span v-else class="logo-text-fallback">{{ opt.label?.charAt(0) }}</span>
        <span class="logo-label">{{ opt.label }}</span>
      </div>
    </div>

    <p v-if="element.helper_text" class="helper-text">{{ element.helper_text }}</p>
  </div>
</template>

<script setup lang="ts">
import type { ElementSchema } from '@/types/schema'

defineProps<{
  element: ElementSchema
  modelValue: string
}>()

function validate(): boolean {
  return true
}

defineExpose({ validate })
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 20px;
}
.field-label-row {
  margin-bottom: 12px;
}
.field-label {
  font-size: 13px;
  color: #666;
}
.logos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: #f7f9fa;
  border-radius: 10px;
  min-width: 56px;
}
.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
}
.logo-text-fallback {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e8f5;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #4a90e2;
}
.logo-label {
  font-size: 11px;
  color: #666;
  text-align: center;
  white-space: nowrap;
}
.helper-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}
</style>
