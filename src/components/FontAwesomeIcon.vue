<template>
  <font-awesome-icon
    :icon="iconDefinition"
    :size="normalizedSize"
    :color="color"
    :rotation="rotate"
    :flip="flip"
    :spin="spin"
    :pulse="pulse"
    :border="border"
    :pull="pull"
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
  rotate?: number
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
    // 如果找不到图标，返回一个默认图标或抛出错误
    console.warn(`Icon "${props.icon}" not found in ${props.type} library`)
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
</script>

<style scoped>
/* Font Awesome styles will be loaded globally */
</style>
