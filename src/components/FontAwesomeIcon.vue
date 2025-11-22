<template>
  <font-awesome-icon :icon="iconDefinition" :size="normalizedSize" :rotation="rotate" :flip="flip" :spin="spin"
    :pulse="pulse" :border="border" :pull="pull" />
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition, IconName, SizeProp } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

interface Props {
  icon: string
  type?: 'fas' | 'far' | 'fab'
  size?: number | string
  color?: string
  rotate?: 90 | 180 | 270 | '90' | '180' | '270'
  flip?: 'horizontal' | 'vertical' | 'both'
  spin?: boolean
  pulse?: boolean
  border?: boolean
  pull?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'fas',
  size: undefined,
  color: undefined,
  rotate: undefined,
  flip: undefined,
  spin: false,
  pulse: false,
  border: false,
  pull: undefined,
})

// 图标定义（不变）
const iconDefinition = computed((): IconDefinition => {
  const iconLibrary = props.type === 'fas' ? fas : props.type === 'far' ? far : fab
  const iconName = props.icon.replace(/^(fa|fas|far|fab)-?/, '') as IconName

  const icon = iconLibrary[iconName]
  if (!icon) {
    if (props.type !== 'fab' && fab[iconName]) return fab[iconName] as IconDefinition
    if (props.type !== 'fas' && fas[iconName]) return fas[iconName] as IconDefinition
    if (props.type !== 'far' && far[iconName]) return far[iconName] as IconDefinition

    console.warn(`Icon "${props.icon}" not found in any Font Awesome library`)
    return fas['question'] as IconDefinition
  }
  return icon
})

// 标准化尺寸（补充完整类型定义中的尺寸）
const normalizedSize = computed((): SizeProp | undefined => {
  if (!props.size) return undefined

  if (typeof props.size === 'number') {
    if (props.size <= 12) return '2xs'
    if (props.size <= 16) return 'xs'
    if (props.size <= 20) return 'sm'
    if (props.size <= 24) return undefined
    if (props.size <= 32) return 'lg'
    if (props.size <= 40) return 'xl'
    if (props.size <= 48) return '2xl'
    if (props.size <= 64) return '3x'
    return '4x'
  }

  const sizeMap: Record<string, SizeProp> = {
    '2xs': '2xs',
    xs: 'xs',
    sm: 'sm',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
    '3xl': '3xl',
    '4xl': '4xl',
    '5xl': '5xl',
    '1x': '1x',
    '2x': '2x',
  }
  return sizeMap[props.size] || undefined
})

// 颜色处理（不变）
const isDark = computed(() => document.documentElement.classList.contains('dark'))
const iconColor = computed(() => {
  if (props.color) return props.color
  return isDark.value ? '#e5eaf3' : '#606266'
})

// 监听深色模式变化（确保动态更新）
watch(isDark, () => {
  iconColor.value = iconColor.value // 触发样式更新
})
onMounted(() => {
  iconColor.value = iconColor.value // 挂载后初始化
})
</script>

<style scoped>
/* 外层容器：承载颜色变量，控制过渡效果 */
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: --icon-color 0.3s ease;
  /* 过渡效果 */
}

/* 关键：穿透到 FontAwesome 内部的 SVG 元素，直接设色 */
::v-deep .icon-wrapper .svg-inline--fa svg,
::v-deep .icon-wrapper .svg-inline--fa path {
  /* 使用 CSS 变量传递颜色，优先级最高 */
  color: var(--icon-color) !important;
  fill: var(--icon-color) !important;
  /* 填充色 = 颜色变量 */
  stroke: var(--icon-color) !important;
  /* 描边色 = 颜色变量（兼容部分图标） */
  /* 清除可能的默认样式干扰 */
  fill-opacity: 1 !important;
  stroke-opacity: 1 !important;
}
</style>
