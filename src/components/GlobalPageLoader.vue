<template>
  <Transition name="page-loader" appear>
    <div v-if="state.isLoading" class="global-page-loader">
      <!-- 矩阵雨背景 -->
      <MatrixRain :isActive="true" :color="matrixColor" :fontSize="12" :speed="60" />

      <!-- 主加载容器 -->
      <div class="loader-container">
        <!-- 终端风格头部 -->
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <div class="terminal-title">
            <GlitchText text="SYSTEM INIT" :color="glitchColor" :speed="3" />
          </div>
        </div>

        <!-- 终端内容区域 -->
        <div class="terminal-content">
          <!-- 系统信息 -->
          <div class="system-info">
            <div class="info-line">
              <span class="prompt">$</span>
              <span class="command">./system_init.sh</span>
            </div>
            <div class="info-line">
              <span class="output">Initializing system...</span>
            </div>
          </div>

          <!-- 进度显示 -->
          <div class="progress-section">
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: `${state.progress}%` }">
                <div class="progress-glow"></div>
              </div>
            </div>
            <div class="progress-text">{{ state.progress }}%</div>
          </div>

          <!-- 当前任务 -->
          <div class="current-task">
            <div v-if="state.currentTask" class="task-line">
              <span class="prompt">></span>
              <span class="task-text">{{ state.currentTask }}</span>
              <span class="loading-dots"> <span>.</span><span>.</span><span>.</span> </span>
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="task-list">
            <div
              v-for="task in sortedTasks"
              :key="task.id"
              class="task-item"
              :class="{
                'task--loading': task.status === 'loading',
                'task--completed': task.status === 'completed',
                'task--error': task.status === 'error',
              }"
            >
              <span class="task-icon">
                <LoadingIcon v-if="task.status === 'loading'" />
                <CheckIcon v-else-if="task.status === 'completed'" />
                <ErrorIcon v-else-if="task.status === 'error'" />
                <ClockIcon v-else />
              </span>
              <span class="task-name">{{ task.name }}</span>
              <span v-if="task.progress !== undefined" class="task-progress">
                {{ task.progress }}%
              </span>
            </div>
          </div>

          <!-- 系统消息 -->
          <div class="system-message">
            <span class="prompt">$</span>
            <span class="message-text">{{ state.message }}</span>
          </div>
        </div>

        <!-- 终端底部 -->
        <div class="terminal-footer">
          <div class="loading-time" v-if="state.startTime">
            <ClockIcon class="time-icon" />
            <span>{{ formatTime(getLoadingTime()) }}</span>
          </div>
          <div class="system-status">
            <span class="status-dot status--active"></span>
            <span>SYSTEM ACTIVE</span>
          </div>
        </div>
      </div>

      <!-- 扫描线效果 -->
      <div class="scan-line"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { usePageLoading } from '@/composables/usePageLoading'
import MatrixRain from './MatrixRain.vue'
import GlitchText from './GlitchText.vue'

const { state, getLoadingTime } = usePageLoading()

// 计算排序后的任务列表
const sortedTasks = computed(() => {
  return [...state.value.tasks].sort((a, b) => {
    // 首先按状态排序：loading > pending > completed > error
    const statusOrder = {
      loading: 0,
      pending: 1,
      completed: 2,
      error: 3,
    }

    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }

    // 状态相同时按优先级排序
    return b.priority - a.priority
  })
})

// 根据主题调整颜色
const matrixColor = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'rgba(0, 100, 0, 0.3)'
    : '#00ff41'
})

const glitchColor = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'light' ? '#00aa00' : '#00ff41'
})

// 格式化时间
const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
}

// 图标组件（使用简单的SVG）
const LoadingIcon = () =>
  h(
    'svg',
    {
      class: 'icon icon-loading',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    [
      h('circle', { cx: '12', cy: '12', r: '10', strokeWidth: '2' }),
      h('path', {
        d: 'M12 2v4l2 2m-2-2v4l-2-2m2-2v4l2 2',
        strokeWidth: '2',
        strokeLinecap: 'round',
        class: 'loading-path',
      }),
    ],
  )

const CheckIcon = () =>
  h(
    'svg',
    {
      class: 'icon icon-check',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    [
      h('polyline', {
        points: '20 6 9 17 4 12',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    ],
  )

const ErrorIcon = () =>
  h(
    'svg',
    {
      class: 'icon icon-error',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    [
      h('circle', { cx: '12', cy: '12', r: '10', strokeWidth: '2' }),
      h('line', { x1: '15', y1: '9', x2: '9', y2: '15', strokeWidth: '2', strokeLinecap: 'round' }),
      h('line', { x1: '9', y1: '9', x2: '15', y2: '15', strokeWidth: '2', strokeLinecap: 'round' }),
    ],
  )

const ClockIcon = () =>
  h(
    'svg',
    {
      class: 'icon icon-clock',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    [
      h('circle', { cx: '12', cy: '12', r: '10', strokeWidth: '2' }),
      h('polyline', {
        points: '12 6 12 12 16 14',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    ],
  )
</script>

<style scoped>
.global-page-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.loader-container {
  position: relative;
  width: 90%;
  max-width: 600px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #00ff41;
  border-radius: 8px;
  box-shadow:
    0 0 50px rgba(0, 255, 65, 0.3),
    inset 0 0 20px rgba(0, 255, 65, 0.1);
  backdrop-filter: blur(10px);
  z-index: 10;
}

/* 终端头部 */
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(0, 255, 65, 0.1);
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
}

.terminal-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-red {
  background: #ff5f56;
}

.dot-yellow {
  background: #ffbd2e;
}

.dot-green {
  background: #27c93f;
}

.terminal-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #00ff41;
}

/* 终端内容 */
.terminal-content {
  padding: 2rem 1.5rem;
  color: #ffffff;
  font-family: 'Courier New', monospace;
}

.system-info {
  margin-bottom: 1.5rem;
}

.info-line {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.prompt {
  color: #00ff41;
  margin-right: 0.5rem;
  font-weight: bold;
}

.command {
  color: #00ff41;
}

.output {
  color: #ffffff;
  opacity: 0.8;
}

/* 进度条 */
.progress-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ff41, #00ff88);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progress-shine 2s infinite;
}

.progress-text {
  color: #00ff41;
  font-weight: bold;
  min-width: 50px;
  text-align: right;
}

/* 当前任务 */
.current-task {
  margin-bottom: 1.5rem;
}

.task-line {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.task-text {
  color: #00ff88;
  margin-left: 0.5rem;
}

.loading-dots {
  margin-left: 0.5rem;
  color: #00ff41;
}

.loading-dots span {
  animation: loading-dot 1.5s infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.3s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.6s;
}

/* 任务列表 */
.task-list {
  margin-bottom: 1.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.task--loading {
  color: #00ff88;
}

.task--completed {
  color: #27c93f;
}

.task--error {
  color: #ff5f56;
}

.task-icon {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
}

.task-name {
  flex: 1;
}

.task-progress {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 系统消息 */
.system-message {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.message-text {
  margin-left: 0.5rem;
  color: #00ff41;
}

/* 终端底部 */
.terminal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(0, 255, 65, 0.05);
  border-top: 1px solid rgba(0, 255, 65, 0.3);
  font-size: 0.8rem;
}

.loading-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  opacity: 0.7;
}

.time-icon {
  width: 14px;
  height: 14px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #27c93f;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27c93f;
  animation: status-pulse 2s infinite;
}

/* 扫描线 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff41, transparent);
  animation: scan-line 3s linear infinite;
}

/* 图标样式 */
.icon {
  width: 16px;
  height: 16px;
}

.icon-loading .loading-path {
  animation: icon-spin 1s linear infinite;
}

.icon-check {
  color: #27c93f;
}

.icon-error {
  color: #ff5f56;
}

.icon-clock {
  color: #00ff41;
}

/* 动画 */
@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes loading-dot {
  0%,
  80%,
  100% {
    opacity: 0;
  }

  40% {
    opacity: 1;
  }
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes scan-line {
  0% {
    top: 0;
  }

  100% {
    top: 100%;
  }
}

@keyframes icon-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 过渡动画 */
.page-loader-enter-active,
.page-loader-leave-active {
  transition: all 0.5s ease;
}

.page-loader-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.page-loader-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* 深色模式适配 */
[data-theme='dark'] .global-page-loader {
  background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);
}

[data-theme='dark'] .loader-container {
  background: rgba(0, 0, 0, 0.95);
}

/* 浅色模式适配 */
[data-theme='light'] .global-page-loader {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

[data-theme='light'] .loader-container {
  background: rgba(255, 255, 255, 0.95);
  border-color: #00aa00;
  color: #333333;
}

[data-theme='light'] .terminal-content,
[data-theme='light'] .info-line,
[data-theme='light'] .system-message,
[data-theme='light'] .loading-time {
  color: #333333;
}

[data-theme='light'] .prompt,
[data-theme='light'] .command,
[data-theme='light'] .terminal-title,
[data-theme='light'] .progress-text,
[data-theme='light'] .message-text {
  color: #00aa00;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loader-container {
    width: 95%;
    margin: 1rem;
  }

  .terminal-content {
    padding: 1.5rem 1rem;
  }

  .terminal-header,
  .terminal-footer {
    padding: 0.75rem 1rem;
  }

  .terminal-title {
    font-size: 1rem;
  }

  .task-list {
    max-height: 150px;
  }
}

/* 高性能模式 */
@media (prefers-reduced-motion: reduce) {
  .scan-line {
    display: none;
  }

  .icon-loading .loading-path {
    animation: none;
  }

  .status-dot {
    animation: none;
  }
}
</style>
