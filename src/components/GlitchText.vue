<template>
  <span
    ref="textRef"
    class="glitch-text"
    :class="{
      'glitch-text--active': isActive,
      'glitch-text--hover': isHovered,
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :style="textStyle"
  >
    <span class="glitch-text__main">{{ text }}</span>
    <span class="glitch-text__before" :aria-hidden="true">{{ text }}</span>
    <span class="glitch-text__after" :aria-hidden="true">{{ text }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  text: string
  isActive?: boolean
  color?: string
  speed?: number
  intensity?: number
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: true,
  color: '#00ff41',
  speed: 2,
  intensity: 5,
  hover: true,
})

const textRef = ref<HTMLElement>()
const isHovered = ref(false)
let animationInterval: number | null = null

// 计算样式
const textStyle = computed(() => ({
  '--glitch-color': props.color,
  '--glitch-speed': `${props.speed}s`,
  '--glitch-intensity': `${props.intensity}px`,
}))

// 生成随机故障效果
const generateGlitch = () => {
  if (!props.isActive || (!props.hover && !isHovered.value)) return

  const before = textRef.value?.querySelector('.glitch-text__before') as HTMLElement
  const after = textRef.value?.querySelector('.glitch-text__after') as HTMLElement
  const main = textRef.value?.querySelector('.glitch-text__main') as HTMLElement

  if (before && after && main) {
    // 随机故障类型
    const glitchType = Math.floor(Math.random() * 4)

    switch (glitchType) {
      case 0: // 水平位移
        {
          const beforeTransform = `translateX(${Math.random() * props.intensity - props.intensity / 2}px)`
          const afterTransform = `translateX(${Math.random() * props.intensity - props.intensity / 2}px)`

          before.style.transform = beforeTransform
          after.style.transform = afterTransform
          before.style.opacity = '0.8'
          after.style.opacity = '0.6'
        }
        break

      case 1: // 垂直位移
        {
          const beforeTransform = `translateY(${Math.random() * props.intensity - props.intensity / 2}px)`
          const afterTransform = `translateY(${Math.random() * props.intensity - props.intensity / 2}px)`

          before.style.transform = beforeTransform
          after.style.transform = afterTransform
          before.style.opacity = '0.7'
          after.style.opacity = '0.9'
        }
        break

      case 2: // 裁剪效果
        {
          const beforeClip = `polygon(${Math.random() * 30}% 0, ${Math.random() * 30 + 70}% 0, ${Math.random() * 30 + 70}% 100%, ${Math.random() * 30}% 100%)`
          const afterClip = `polygon(${Math.random() * 30 + 70}% 0, 100% 0, 100% 100%, ${Math.random() * 30 + 70}% 100%)`

          before.style.clipPath = beforeClip
          after.style.clipPath = afterClip
          before.style.opacity = '0.9'
          after.style.opacity = '0.8'
        }
        break

      case 3: // 颜色故障
        {
          const hue = Math.random() * 360
          before.style.color = `hsl(${hue}, 100%, 50%)`
          after.style.color = `hsl(${hue + 180}, 100%, 50%)`
          before.style.opacity = '0.7'
          after.style.opacity = '0.7'
        }
        break
    }

    // 添加闪烁效果
    main.style.textShadow = `0 0 ${Math.random() * 20}px ${props.color}`

    // 短暂后重置
    setTimeout(
      () => {
        before.style.transform = ''
        before.style.clipPath = ''
        before.style.opacity = ''
        before.style.color = ''
        after.style.transform = ''
        after.style.clipPath = ''
        after.style.opacity = ''
        after.style.color = ''
        main.style.textShadow = ''
      },
      Math.random() * 150 + 50,
    )
  }
}

// 开始动画
const startAnimation = () => {
  if (animationInterval) return

  animationInterval = window.setInterval(() => {
    generateGlitch()
  }, props.speed * 1000)
}

// 停止动画
const stopAnimation = () => {
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
}

// 监听激活状态
watch(
  () => props.isActive,
  (isActive) => {
    if (isActive) {
      startAnimation()
    } else {
      stopAnimation()
    }
  },
)

// 监听悬停状态
watch(isHovered, (hovered) => {
  if (props.hover && props.isActive) {
    if (hovered) {
      // 悬停时增加故障频率
      if (animationInterval) {
        clearInterval(animationInterval)
      }
      animationInterval = window.setInterval(() => {
        generateGlitch()
      }, props.speed * 200)
    } else {
      startAnimation()
    }
  }
})

onMounted(() => {
  if (props.isActive) {
    startAnimation()
  }
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.glitch-text {
  position: relative;
  display: inline-block;
  color: var(--text-primary, #ffffff);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: default;
  transition: color 0.3s ease;
}

.glitch-text__main {
  position: relative;
  z-index: 2;
}

.glitch-text__before,
.glitch-text__after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glitch-text--active .glitch-text__before,
.glitch-text--active .glitch-text__after {
  opacity: 0.8;
}

.glitch-text--hover .glitch-text__before,
.glitch-text--hover .glitch-text__after {
  opacity: 1;
}

.glitch-text__before {
  color: var(--glitch-color, #00ff41);
  animation: glitch-before var(--glitch-speed, 2s) infinite;
}

.glitch-text__after {
  color: var(--glitch-color, #00ff41);
  animation: glitch-after var(--glitch-speed, 2s) infinite;
}

/* 故障动画 */
@keyframes glitch-before {
  0% {
    transform: translate(0, 0);
    clip-path: inset(0 0 0 0);
  }
  20% {
    transform: translate(var(--glitch-intensity, 5px), 0);
    clip-path: inset(20% 0 30% 0);
  }
  40% {
    transform: translate(calc(-1 * var(--glitch-intensity, 5px)), var(--glitch-intensity, 5px));
    clip-path: inset(50% 0 20% 0);
  }
  60% {
    transform: translate(var(--glitch-intensity, 5px), calc(-1 * var(--glitch-intensity, 5px)));
    clip-path: inset(10% 0 60% 0);
  }
  80% {
    transform: translate(calc(-1 * var(--glitch-intensity, 5px)), 0);
    clip-path: inset(80% 0 10% 0);
  }
  100% {
    transform: translate(0, 0);
    clip-path: inset(0 0 0 0);
  }
}

@keyframes glitch-after {
  0% {
    transform: translate(0, 0);
    clip-path: inset(0 0 0 0);
  }
  20% {
    transform: translate(calc(-1 * var(--glitch-intensity, 5px)), 0);
    clip-path: inset(60% 0 10% 0);
  }
  40% {
    transform: translate(var(--glitch-intensity, 5px), var(--glitch-intensity, 5px));
    clip-path: inset(20% 0 40% 0);
  }
  60% {
    transform: translate(
      calc(-1 * var(--glitch-intensity, 5px)),
      calc(-1 * var(--glitch-intensity, 5px))
    );
    clip-path: inset(30% 0 50% 0);
  }
  80% {
    transform: translate(var(--glitch-intensity, 5px), 0);
    clip-path: inset(70% 0 20% 0);
  }
  100% {
    transform: translate(0, 0);
    clip-path: inset(0 0 0 0);
  }
}

/* 悬停效果 */
.glitch-text:hover {
  color: var(--glitch-color, #00ff41);
  text-shadow: 0 0 10px var(--glitch-color, #00ff41);
}

/* 深色主题样式 */
[data-theme='dark'] .glitch-text {
  color: var(--text-primary, #ffffff);
}

[data-theme='dark'] .glitch-text__before {
  color: var(--accent-primary, #00ff41);
}

[data-theme='dark'] .glitch-text__after {
  color: var(--accent-secondary, #00ffff);
}

/* 浅色主题样式 */
[data-theme='light'] .glitch-text {
  color: var(--text-primary, #1a1a1a);
}

[data-theme='light'] .glitch-text__before {
  color: var(--accent-primary, #00ff41);
}

[data-theme='light'] .glitch-text__after {
  color: var(--accent-tertiary, #7209b7);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .glitch-text {
    letter-spacing: 1px;
    font-size: 0.9em;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .glitch-text__before,
  .glitch-text__after {
    opacity: 0.6;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .glitch-text__before,
  .glitch-text__after {
    animation: none;
  }

  .glitch-text:hover {
    text-shadow: none;
  }
}
</style>
