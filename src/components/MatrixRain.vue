<template>
  <canvas ref="canvasRef" class="matrix-rain" :class="{ 'matrix-rain--active': isActive }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  isActive?: boolean
  color?: string
  fontSize?: number
  speed?: number
  density?: number
}

const props = withDefaults(defineProps<Props>(), {
  isActive: true,
  color: '#00ff41',
  fontSize: 14,
  speed: 50,
  density: 0.95,
})

const canvasRef = ref<HTMLCanvasElement>()
let animationId: number | null = null
let columns: number[] = []
let ctx: CanvasRenderingContext2D | null = null

// 矩阵雨字符集
const matrixChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?'

// 初始化画布
const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // 重新计算列数
    const columnCount = Math.floor(canvas.width / props.fontSize)
    columns = Array(columnCount).fill(1)
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  return () => {
    window.removeEventListener('resize', resizeCanvas)
  }
}

// 绘制矩阵雨
const drawMatrix = () => {
  if (!ctx || !canvasRef.value) return

  // 半透明黑色背景，创建拖尾效果
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // 设置文字样式
  ctx.fillStyle = props.color || '#00ff41'
  ctx.font = `${props.fontSize}px monospace`

  // 绘制字符
  columns.forEach((y, index) => {
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)]
    const x = index * props.fontSize

    if (char && ctx && canvasRef.value) {
      ctx.fillText(char, x, y * props.fontSize)
    }

    // 随机重置列
    if (
      canvasRef.value &&
      y * props.fontSize > canvasRef.value.height &&
      Math.random() > props.density
    ) {
      columns[index] = 0
    }

    // 递增列位置
    if (columns[index] !== undefined) {
      columns[index]++
    }
  })
}

// 动画循环
const animate = () => {
  if (!props.isActive) return

  drawMatrix()
  animationId = requestAnimationFrame(animate)
}

// 开始动画
const startAnimation = () => {
  if (animationId) return
  animate()
}

// 停止动画
const stopAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

// 清空画布
const clearCanvas = () => {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
}

// 监听激活状态变化
watch(
  () => props.isActive,
  (isActive) => {
    if (isActive) {
      startAnimation()
    } else {
      stopAnimation()
      clearCanvas()
    }
  },
  { immediate: true },
)

// 监听主题变化，确保在浅色模式下也正确处理
watch(
  () => props.isActive,
  (isActive) => {
    if (!isActive) {
      // 确保在非激活状态下清空画布
      clearCanvas()
    }
  },
)

// 监听颜色变化
watch(
  () => props.color,
  () => {
    if (ctx) {
      ctx.fillStyle = props.color
    }
  },
)

onMounted(() => {
  const cleanup = initCanvas()
  if (props.isActive) {
    startAnimation()
  }

  onUnmounted(() => {
    stopAnimation()
    cleanup?.()
  })
})
</script>

<style scoped>
.matrix-rain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.matrix-rain--active {
  opacity: 0.8;
}

.matrix-rain:not(.matrix-rain--active) {
  opacity: 0;
}

/* 深色主题下的样式 */
[data-theme='dark'] .matrix-rain {
  opacity: 0.6;
}

[data-theme='dark'] .matrix-rain--active {
  opacity: 0.6;
}

/* 浅色主题下的样式 - 完全隐藏 */
[data-theme='light'] .matrix-rain {
  opacity: 0;
  pointer-events: none;
}

[data-theme='light'] .matrix-rain--active {
  opacity: 0;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .matrix-rain {
    opacity: 0.4;
  }

  [data-theme='dark'] .matrix-rain--active {
    opacity: 0.4;
  }

  [data-theme='light'] .matrix-rain--active {
    opacity: 0.2;
  }
}

/* 高性能模式 */
@media (prefers-reduced-motion: reduce) {
  .matrix-rain {
    display: none;
  }
}

/* 省电模式 */
@media (prefers-reduced-data: reduce) {
  .matrix-rain {
    opacity: 0.2;
  }
}
</style>
