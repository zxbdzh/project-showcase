<template>
  <transition name="theme-transition">
    <div v-if="isTransitioning" class="theme-transition-overlay">
      <div class="theme-transition-content">
        <div class="theme-transition-icon">{{ currentIcon }}</div>
        <div class="theme-transition-text">切换主题中...</div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isTransitioning, actualThemeIcon } = useTheme()

const currentIcon = computed(() => {
  switch (actualThemeIcon.value) {
    case '☀️':
      return '🌙'
    case '🌙':
      return '☀️'
    default:
      return '🔄'
  }
})
</script>

<style scoped>
.theme-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-transition-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: rgba(0, 255, 65, 0.1);
  border-radius: 16px;
  border: 2px solid var(--accent-primary);
  box-shadow: 0 8px 32px rgba(0, 255, 65, 0.3);
}

.theme-transition-icon {
  font-size: 48px;
  animation: spin 1s linear infinite;
}

.theme-transition-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-primary);
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
  letter-spacing: 1px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 过渡动画 */
.theme-transition-enter-active,
.theme-transition-leave-active {
  transition: opacity 0.3s ease;
}

.theme-transition-enter-from,
.theme-transition-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-transition-content {
    padding: 24px;
    gap: 12px;
  }

  .theme-transition-icon {
    font-size: 36px;
  }

  .theme-transition-text {
    font-size: 14px;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .theme-transition-icon {
    animation: none;
  }
}
</style>
