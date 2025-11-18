<template>
  <div class="theme-toggle">
    <el-dropdown @command="handleThemeChange" trigger="click">
      <button class="theme-button" :title="`当前主题: ${themeLabel}`">
        <span class="theme-icon">{{ currentThemeIcon }}</span>
        <span class="theme-label">{{ themeLabel }}</span>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="mode in themeModes"
            :key="mode.value"
            :command="mode.value"
            :class="{ 'is-active': theme === mode.value }"
          >
            <span class="theme-option-icon">{{ mode.icon }}</span>
            <span class="theme-option-label">{{ mode.label }}</span>
            <el-icon v-if="theme === mode.value" class="check-icon">
              <check />
            </el-icon>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, Check } from '@element-plus/icons-vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'

const { theme, currentThemeIcon, setTheme } = useTheme()

// 主题模式配置
const themeModes = [
  {
    value: 'light' as ThemeMode,
    label: '浅色主题',
    icon: '☀️',
    description: '明亮的界面风格',
  },
  {
    value: 'dark' as ThemeMode,
    label: '深色主题',
    icon: '🌙',
    description: '经典的极客暗色风格',
  },
  {
    value: 'system' as ThemeMode,
    label: '跟随系统',
    icon: '💻',
    description: '自动跟随系统主题设置',
  },
]

// 当前主题标签
const themeLabel = computed(() => {
  const currentMode = themeModes.find((mode) => mode.value === theme.value)
  return currentMode?.label || '未知主题'
})

// 处理主题切换
const handleThemeChange = (newTheme: ThemeMode) => {
  setTheme(newTheme)
}
</script>

<style scoped>
.theme-toggle {
  display: inline-block;
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-family: inherit;
}

.theme-button:hover {
  background: var(--hover-bg);
  border-color: var(--accent-primary);
  box-shadow: 0 0 8px var(--shadow-color);
}

.theme-button:active {
  transform: translateY(1px);
}

.theme-icon {
  font-size: 18px;
  line-height: 1;
}

.theme-label {
  font-weight: 500;
}

.theme-option-icon {
  margin-right: 8px;
  font-size: 16px;
}

.theme-option-label {
  flex: 1;
}

.check-icon {
  color: var(--accent-primary);
  margin-left: 8px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  min-width: 160px;
}

:deep(.el-dropdown-menu__item.is-active) {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

:deep(.el-dropdown-menu__item:hover) {
  background: var(--hover-bg);
}

/* 深色主题样式 */
[data-theme='dark'] .theme-button {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

[data-theme='dark'] .theme-button:hover {
  background: var(--hover-bg);
  box-shadow: 0 0 12px rgba(0, 255, 65, 0.4);
}

/* 浅色主题样式 */
[data-theme='light'] .theme-button:hover {
  box-shadow: 0 0 12px rgba(0, 255, 65, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .theme-icon {
    font-size: 16px;
  }

  .theme-label {
    display: none;
  }

  :deep(.el-dropdown-menu) {
    min-width: 140px;
  }
}

/* 动画效果 */
@keyframes theme-switch {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.theme-button:active .theme-icon {
  animation: theme-switch 0.6s ease-in-out;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .theme-button {
    border-width: 2px;
  }

  :deep(.el-dropdown-menu__item.is-active) {
    outline: 2px solid var(--text-primary);
    outline-offset: -2px;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .theme-button {
    transition: none;
  }

  .theme-button:active .theme-icon {
    animation: none;
  }
}
</style>
