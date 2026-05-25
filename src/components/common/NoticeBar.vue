<template>
  <div v-if="notice" class="notice-bar" :class="`notice-${notice.type.toLowerCase()}`">
    <span v-if="notice.show_icon !== false" class="notice-icon">
      {{ iconMap[notice.type] }}
    </span>
    <span class="notice-content">{{ notice.content }}</span>
  </div>
</template>

<script setup lang="ts">
import type { NoticeSchema, NoticeType } from '@/types/schema'

defineProps<{
  notice: NoticeSchema | undefined | null
}>()

const iconMap: Record<NoticeType, string> = {
  INFO: 'ℹ️',
  WARNING: '⚠️',
  ERROR: '❌',
  SUCCESS: '✅'
}
</script>

<style scoped>
.notice-bar {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.5;
}
.notice-icon {
  flex-shrink: 0;
  font-size: 15px;
  margin-top: 1px;
}
.notice-content {
  flex: 1;
  word-break: break-word;
}
.notice-info {
  background: #e8f4fd;
  color: #1a6fa8;
}
.notice-warning {
  background: #fff8e1;
  color: #b07a00;
}
.notice-error {
  background: #fdecea;
  color: #c62828;
}
.notice-success {
  background: #e8f5e9;
  color: #2e7d32;
}
</style>
