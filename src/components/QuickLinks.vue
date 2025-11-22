<template>
  <div v-if="quickLinks.length > 0" class="quick-links">
    <div class="quick-links__container">
      <a
        v-for="link in sortedQuickLinks"
        :key="link.order"
        :href="link.url"
        :target="link.type === 'external' ? '_blank' : '_self'"
        :title="link.title"
        class="quick-links__item"
        @click="handleLinkClick(link)"
      >
        <component
          :is="'font-awesome-icon'"
          :icon="link.icon"
          size="small"
          class="quick-links__icon"
        />
        <span class="quick-links__tooltip">{{ link.title }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemSettings } from '@/composables/useData'

interface QuickLink {
  title: string
  url: string
  icon: string
  type: 'internal' | 'external'
  order: number
  enabled: boolean
}

const router = useRouter()
const { getSettingValue } = useSystemSettings()

// 快捷跳转链接
const quickLinks = computed<QuickLink[]>(() => {
  try {
    const linksStr = getSettingValue('header_quick_links', '[]')
    return JSON.parse(linksStr)
  } catch {
    return []
  }
})

// 按order排序的快捷链接
const sortedQuickLinks = computed(() => {
  return quickLinks.value
    .filter(link => link.enabled)
    .sort((a, b) => a.order - b.order)
})

// 处理链接点击
const handleLinkClick = (link: QuickLink) => {
  if (link.type === 'internal') {
    // 内部链接使用路由跳转
    const path = link.url.startsWith('/') ? link.url : `/${link.url}`
    router.push(path)
    return false // 阻止默认行为
  }
  // 外部链接使用默认行为（新窗口打开）
  return true
}
</script>

<style scoped>
.quick-links {
  display: flex;
  align-items: center;
}

.quick-links__container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quick-links__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid var(--border-primary);
}

.quick-links__item:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quick-links__icon {
  font-size: 16px;
}

.quick-links__tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  pointer-events: none;
  border: 1px solid var(--border-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-links__item:hover .quick-links__tooltip {
  opacity: 1;
  visibility: visible;
  bottom: -35px;
}

/* 深色主题适配 */
[data-theme='dark'] .quick-links__item {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
}

[data-theme='dark'] .quick-links__tooltip {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-links__container {
    gap: 0.5rem;
  }

  .quick-links__item {
    width: 36px;
    height: 36px;
  }

  .quick-links__icon {
    font-size: 14px;
  }

  .quick-links__tooltip {
    font-size: 11px;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  .quick-links__container {
    gap: 0.4rem;
  }

  .quick-links__item {
    width: 32px;
    height: 32px;
  }

  .quick-links__icon {
    font-size: 12px;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .quick-links__item {
    border-width: 2px;
  }

  .quick-links__tooltip {
    border-width: 2px;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .quick-links__item {
    transition: none;
  }

  .quick-links__tooltip {
    transition: none;
  }

  .quick-links__item:hover {
    transform: none;
  }
}
</style>
