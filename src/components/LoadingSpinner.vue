<template>
  <div class="loading-spinner" :class="{ 'loading-spinner--overlay': overlay }">
    <div class="loading-spinner__container">
      <!-- 主旋转器 -->
      <div class="loading-spinner__spinner">
        <div class="loading-spinner__ring"></div>
        <div class="loading-spinner__ring"></div>
        <div class="loading-spinner__ring"></div>
        <div class="loading-spinner__ring"></div>
      </div>

      <!-- 加载文字 -->
      <div v-if="text" class="loading-spinner__text">{{ text }}</div>

      <!-- 进度条（可选） -->
      <div v-if="showProgress" class="loading-spinner__progress">
        <div class="loading-spinner__progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  overlay?: boolean
  text?: string
  showProgress?: boolean
  progress?: number
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  overlay: false,
  text: '',
  showProgress: false,
  progress: 0,
  size: 'medium',
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 9999;
  padding: 0;
}

.loading-spinner__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner__spinner {
  position: relative;
  width: 60px;
  height: 60px;
  animation: spinner-rotate 2s linear infinite;
}

.loading-spinner__ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: ring-pulse 1.5s ease-in-out infinite;
}

.loading-spinner__ring:nth-child(1) {
  border-top-color: #00ff41;
  animation-delay: 0s;
}

.loading-spinner__ring:nth-child(2) {
  border-right-color: #0066cc;
  animation-delay: 0.2s;
  transform: rotate(90deg);
}

.loading-spinner__ring:nth-child(3) {
  border-bottom-color: #ff6b6b;
  animation-delay: 0.4s;
  transform: rotate(180deg);
}

.loading-spinner__ring:nth-child(4) {
  border-left-color: #ffd93d;
  animation-delay: 0.6s;
  transform: rotate(270deg);
}

.loading-spinner__text {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  animation: text-fade 1.5s ease-in-out infinite;
}

.loading-spinner__progress {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.loading-spinner__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ff41, #0066cc);
  border-radius: 2px;
  transition: width 0.3s ease;
  animation: progress-shine 2s linear infinite;
}

/* 动画 */
@keyframes spinner-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ring-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

@keyframes text-fade {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes progress-shine {
  0% {
    background-position: -200px center;
  }
  100% {
    background-position: 200px center;
  }
}

/* 深色模式适配 */
[data-theme='dark'] .loading-spinner__text {
  color: #ffffff;
}

[data-theme='dark'] .loading-spinner__progress {
  background: rgba(255, 255, 255, 0.1);
}

/* 浅色模式适配 */
[data-theme='light'] .loading-spinner__text {
  color: #333333;
}

[data-theme='light'] .loading-spinner__progress {
  background: rgba(0, 0, 0, 0.1);
}

/* 尺寸变体 */
.loading-spinner--small .loading-spinner__spinner {
  width: 40px;
  height: 40px;
}

.loading-spinner--large .loading-spinner__spinner {
  width: 80px;
  height: 80px;
}

.loading-spinner--small .loading-spinner__ring {
  border-width: 2px;
}

.loading-spinner--large .loading-spinner__ring {
  border-width: 4px;
}
</style>
