<template>
  <font-awesome-icon
    :icon="iconDefinition"
    :size="normalizedSize"
    :color="iconColor"
    :rotation="rotate"
    :flip="flip"
    :spin="spin"
    :pulse="pulse"
    :border="border"
    :pull="pull"
    :class="iconClass"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

// 获取图标定义
const iconDefinition = computed((): IconDefinition => {
  const iconLibrary = props.type === 'fas' ? fas : props.type === 'far' ? far : fab
  const iconName = props.icon.replace(/^(fa|fas|far|fab)-?/, '') as IconName

  const icon = iconLibrary[iconName]

  if (!icon) {
    // 如果找不到图标，尝试在其他库中查找
    if (props.type !== 'fab' && fab[iconName]) {
      return fab[iconName] as IconDefinition
    }
    if (props.type !== 'fas' && fas[iconName]) {
      return fas[iconName] as IconDefinition
    }
    if (props.type !== 'far' && far && far[iconName]) {
      return far[iconName] as IconDefinition
    }

    // 如果都找不到，返回一个默认图标
    console.warn(`Icon "${props.icon}" not found in any Font Awesome library`)
    return fas['question'] as IconDefinition // 使用问号图标作为默认
  }
  return icon
})

// 标准化尺寸
const normalizedSize = computed((): SizeProp | undefined => {
  if (!props.size) return undefined

  if (typeof props.size === 'number') {
    if (props.size <= 12) return '2xs'
    if (props.size <= 16) return 'xs'
    if (props.size <= 20) return 'sm'
    if (props.size <= 24) return undefined // default
    if (props.size <= 32) return 'lg'
    if (props.size <= 40) return 'xl'
    if (props.size <= 48) return '2xl'
    return '2xl' // 使用2xl作为最大尺寸，因为3xl可能在Font Awesome 7.x中不支持
  }

  // 字符串尺寸直接返回，移除可能不支持的尺寸
  const sizeMap: Record<string, SizeProp> = {
    '2xs': '2xs',
    xs: 'xs',
    sm: 'sm',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
  }

  return sizeMap[props.size] || undefined
})

// 图标颜色处理
const iconColor = computed(() => {
  // 如果有明确指定颜色，使用指定颜色
  if (props.color) {
    return props.color
  }

  // 否则根据当前主题返回合适的颜色
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? '#e5eaf3' : '#606266'
})

// 图标样式类
const iconClass = computed(() => {
  return ['fa-icon', props.type].filter(Boolean).join(' ')
})
</script>

<style scoped>
.fa-icon {
  transition: color 0.3s ease;
}

/* 确保图标在深色模式下有正确的颜色 */
html.dark .fa-icon {
  color: #e5eaf3 !important;
}

html:not(.dark) .fa-icon {
  color: #606266 !important;
}

/* 如果有明确指定颜色，优先使用 */
.fa-icon[style*='color'] {
  color: inherit !important;
}
</style>
