<template>
  <i :class="iconClasses" :style="iconStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  rotate: 0,
  flip: undefined,
  spin: false,
  pulse: false,
  border: false,
  pull: undefined,
})

const iconClasses = computed(() => {
  const classes = [props.type, props.icon]

  if (props.spin) classes.push('fa-spin')
  if (props.pulse) classes.push('fa-pulse')
  if (props.border) classes.push('fa-border')
  if (props.pull) classes.push(`fa-pull-${props.pull}`)
  if (props.flip) classes.push(`fa-flip-${props.flip}`)

  return classes
})

const iconStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.size) {
    if (typeof props.size === 'number') {
      style.fontSize = `${props.size}px`
    } else {
      style.fontSize = props.size
    }
  }

  if (props.color) {
    style.color = props.color
  }

  if (props.rotate) {
    style.transform = `rotate(${props.rotate}deg)`
  }

  return style
})
</script>

<style scoped>
/* Font Awesome styles will be loaded globally */
</style>
