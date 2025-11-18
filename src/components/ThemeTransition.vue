<template>
  <div v-if="isTransitioning" class="theme-transition-overlay" :class="{ active: isTransitioning }">
    <div class="theme-transition-content">
      <div class="theme-transition-icon">{{ currentIcon }}</div>
      <div class="theme-transition-text">切换主题中...</div>
    </div>
  </div>
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
  background: radial-gradient(circle, rgba(0, 255, 65, 0.15) 0%, transparent 70%);
  backdrop-filter: blur(2px);
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-transition-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.theme-transition-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 16px;
  border: 2px solid var(--accent-primary);
  box-shadow: 0 8px 32px rgba(0, 255, 65, 0.3);
  backdrop-filter: blur(8px);
  animation: themeTransitionPulse 1.5s ease-in-out infinite;
}

.theme-transition-icon {
  font-size: 48px;
  animation: themeIconSpin 2s linear infinite;
}

.theme-transition-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-primary);
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
  letter-spacing: 1px;
}

@keyframes themeTransitionPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes themeIconSpin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* 深色模式适配 */
[data-theme='dark'] .theme-transition-content {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 32px rgba(0, 255, 65, 0.4);
}

/* 浅色模式适配 */
[data-theme='light'] .theme-transition-content {
  background: rgba(0, 0, 0, 0.8);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 32px rgba(0, 255, 65, 0.2);
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
  .theme-transition-content {
    animation: none;
  }

  .theme-transition-icon {
    animation: none;
  }
}
</style>
