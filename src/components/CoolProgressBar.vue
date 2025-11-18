<template>
  <div
    class="cool-progress-bar"
    :class="{
      'cool-progress-bar--completed': isCompleted,
      'cool-progress-bar--hover': isHovered,
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 背景轨道 -->
    <div class="cool-progress-bar__track">
      <!-- 进度条主体 -->
      <div class="cool-progress-bar__fill" :style="fillStyle">
        <!-- 流动光效 -->
        <div class="cool-progress-bar__shimmer"></div>

        <!-- 波纹效果 -->
        <div v-if="showRipple" class="cool-progress-bar__ripple" :style="rippleStyle"></div>
      </div>

      <!-- 发光边框 -->
      <div class="cool-progress-bar__glow" :style="glowStyle"></div>
    </div>

    <!-- 百分比显示 -->
    <div class="cool-progress-bar__percentage">
      <span class="cool-progress-bar__percentage-text" :style="percentageTextStyle">
        {{ Math.round(props.percentage) }}%
      </span>
    </div>

    <!-- 完成时的粒子效果 -->
    <div v-if="showParticles" class="cool-progress-bar__particles">
      <div
        v-for="i in 6"
        :key="i"
        class="cool-progress-bar__particle"
        :style="particleStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

interface Props {
  percentage: number
  color?: string
  height?: number
  animated?: boolean
  showLevel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0,
  color: '#00ff41',
  height: 8,
  animated: true,
  showLevel: true,
})

const isHovered = ref(false)
const showRipple = ref(false)
const showParticles = ref(false)
const ripplePosition = ref(0)

// 计算属性
const isCompleted = computed(() => props.percentage >= 100)

// 根据进度获取颜色
const getProgressColor = computed(() => {
  if (props.percentage >= 90) return '#a8e6cf' // 专家 - 薄荷绿
  if (props.percentage >= 75) return '#4ecdc4' // 高级 - 青色
  if (props.percentage >= 50) return '#6bcf7f' // 中级 - 绿色
  if (props.percentage >= 25) return '#ffd93d' // 初级 - 黄色
  return '#ff6b6b' // 新手 - 红色
})

const fillStyle = computed(() => ({
  width: `${Math.min(props.percentage, 100)}%`,
  background: `linear-gradient(90deg,
    ${getProgressColor.value} 0%,
    ${adjustBrightness(getProgressColor.value, 20)} 50%,
    ${getProgressColor.value} 100%)`,
  transition: props.animated ? 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
}))

const glowStyle = computed(() => ({
  width: `${Math.min(props.percentage, 100)}%`,
  boxShadow: `0 0 20px ${getProgressColor.value}40, 0 0 40px ${getProgressColor.value}20`,
  transition: props.animated ? 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
}))

const percentageTextStyle = computed(() => ({
  color: getProgressColor.value,
  fontWeight: 'bold' as const,
  fontSize: '14px',
  textShadow: `0 0 10px ${getProgressColor.value}40`,
}))

const rippleStyle = computed(() => ({
  left: `${ripplePosition.value}%`,
}))

// 工具函数
const adjustBrightness = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}

const particleStyle = (index: number) => {
  const angle = (index * 60 * Math.PI) / 180
  const distance = 30 + Math.random() * 20
  return {
    '--tx': `${Math.cos(angle) * distance}px`,
    '--ty': `${Math.sin(angle) * distance}px`,
    '--delay': `${index * 0.1}s`,
  }
}

// 监听进度变化
watch(
  () => props.percentage,
  async (newVal, oldVal = 0) => {
    if (newVal > oldVal && props.animated) {
      // 显示波纹效果
      ripplePosition.value = newVal
      showRipple.value = true
      setTimeout(() => {
        showRipple.value = false
      }, 1000)

      // 如果达到100%，显示粒子效果
      if (newVal >= 100 && oldVal < 100) {
        await nextTick()
        showParticles.value = true
        setTimeout(() => {
          showParticles.value = false
        }, 2000)
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.cool-progress-bar {
  position: relative;
  width: 100%;
  padding: 8px 0;
  cursor: pointer;
}

.cool-progress-bar__track {
  position: relative;
  width: 100%;
  height: v-bind('props.height + "px"');
  background: rgba(255, 255, 255, 0.1);
  border-radius: v-bind('props.height / 2 + "px"');
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cool-progress-bar__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: v-bind('props.height / 2 + "px"');
  overflow: hidden;
  position: relative;
}

/* 流动光效 */
.cool-progress-bar__shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 波纹效果 */
.cool-progress-bar__ripple {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 60px;
    height: 60px;
    opacity: 0;
  }
}

/* 发光边框 */
.cool-progress-bar__glow {
  position: absolute;
  top: -2px;
  left: 0;
  height: v-bind('props.height + 4 + "px"');
  border-radius: v-bind('props.height / 2 + 2 + "px"');
  pointer-events: none;
}

/* 百分比显示 */
.cool-progress-bar__percentage {
  margin-top: 8px;
  text-align: center;
}

.cool-progress-bar__percentage-text {
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s ease;
  display: inline-block;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 粒子效果 */
.cool-progress-bar__particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.cool-progress-bar__particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: v-bind('getProgressColor');
  border-radius: 50%;
  animation: particle-burst 2s ease-out forwards;
  animation-delay: var(--delay);
  transform: translate(var(--tx), var(--ty));
}

@keyframes particle-burst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

/* 悬停效果 */
.cool-progress-bar--hover .cool-progress-bar__fill {
  filter: brightness(1.2);
}

.cool-progress-bar--hover .cool-progress-bar__percentage-text {
  transform: scale(1.1);
}

/* 完成状态 */
.cool-progress-bar--completed .cool-progress-bar__percentage-text {
  animation: celebrate 0.5s ease-out;
}

@keyframes celebrate {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cool-progress-bar__percentage-text {
    font-size: 12px;
  }

  .cool-progress-bar__track {
    height: v-bind('Math.max(props.height - 2, 4) + "px"');
  }
}
</style>
