<template>
  <div id="app" :data-theme="actualTheme">
    <ThemeTransition />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import { initializeData } from './composables/useData'
import ThemeTransition from './components/ThemeTransition.vue'

// 初始化主题系统
const { actualTheme, initTheme } = useTheme()

// 组件挂载时初始化
onMounted(() => {
  initTheme()
  // 初始化数据加载
  initializeData()
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
  min-height: 100vh;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* CSS 变量定义 */
:root {
  /* 基础颜色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --card-bg: #ffffff;

  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-muted: #adb5bd;

  --border-primary: #dee2e6;
  --border-secondary: #ced4da;

  --accent-primary: #0066cc;
  --accent-secondary: #0052a3;
  --accent-hover: #004085;

  --shadow-color: rgba(0, 0, 0, 0.1);
  --shadow-hover: rgba(0, 0, 0, 0.15);

  /* 状态颜色 */
  --success: #28a745;
  --warning: #ffc107;
  --error: #dc3545;
  --info: #17a2b8;

  /* 字体 */
  --font-mono: 'Fira Code', 'Courier New', monospace;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 深色主题 */
[data-theme='dark'] {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2a2a2a;
  --card-bg: #1a1a1a;

  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-muted: #808080;

  --border-primary: #333333;
  --border-secondary: #404040;

  --accent-primary: #00ff41;
  --accent-secondary: #00cc33;
  --accent-hover: #00aa29;

  --shadow-color: rgba(0, 255, 65, 0.2);
  --shadow-hover: rgba(0, 255, 65, 0.3);

  /* 状态颜色 - 深色模式调整 */
  --success: #00ff41;
  --warning: #ffaa00;
  --error: #ff4444;
  --info: #00ccff;
}

/* 浅色主题 */
[data-theme='light'] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --card-bg: #ffffff;

  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-muted: #adb5bd;

  --border-primary: #dee2e6;
  --border-secondary: #ced4da;

  --accent-primary: #0066cc;
  --accent-secondary: #0052a3;
  --accent-hover: #004085;

  --shadow-color: rgba(0, 102, 204, 0.1);
  --shadow-hover: rgba(0, 102, 204, 0.2);
}

/* 主题切换过渡 */
.theme-transitioning {
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-secondary);
}

/* 选择文本样式 */
::selection {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

::-moz-selection {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

/* 焦点样式 */
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* 链接样式 */
a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--accent-secondary);
}

/* 按钮基础样式 */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
}

/* 输入框基础样式 */
input,
textarea,
select {
  font-family: inherit;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 8px 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

/* 工具类 */
.text-center {
  text-align: center;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}

.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.flex-wrap {
  flex-wrap: wrap;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}

.grid {
  display: grid;
}
.grid-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}
.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.hidden {
  display: none;
}
.visible {
  display: block;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 响应式断点 */
@media (max-width: 640px) {
  html {
    font-size: 14px;
  }

  .grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

.pulse {
  animation: pulse 2s infinite;
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  :root {
    --border-primary: #000000;
    --border-secondary: #333333;
    --shadow-color: rgba(0, 0, 0, 0.3);
  }

  [data-theme='dark'] {
    --border-primary: #ffffff;
    --border-secondary: #cccccc;
    --shadow-color: rgba(255, 255, 255, 0.3);
  }
}

/* 打印样式 */
@media print {
  * {
    background: transparent !important;
    color: black !important;
    box-shadow: none !important;
  }

  a,
  a:visited {
    text-decoration: underline;
  }

  .no-print {
    display: none !important;
  }
}
</style>
