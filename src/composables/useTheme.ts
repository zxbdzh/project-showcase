import { ref, watch, onMounted, onUnmounted, computed, readonly } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'app-theme'

export function useTheme() {
  const theme = ref<ThemeMode>('system')
  const systemTheme = ref<'light' | 'dark'>('light')
  const actualTheme = ref<'light' | 'dark'>('light')

  // 检测系统主题
  const detectSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // 应用主题
  const applyTheme = (newTheme: 'light' | 'dark') => {
    actualTheme.value = newTheme

    // 立即应用主题到document
    const root = document.documentElement

    // 设置data-theme属性
    root.setAttribute('data-theme', newTheme)

    // 更新Element Plus主题 - 添加或移除dark类
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 应用CSS变量
    applyThemeVariables(newTheme)

    // 更新Element Plus CSS变量
    updateElementPlusTheme(newTheme)

    // 更新meta标签
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0a0a0a' : '#ffffff')
    }

    // 强制重绘以确保主题立即生效
    requestAnimationFrame(() => {
      root.style.display = 'none'
      root.offsetHeight // 触发重排
      root.style.display = ''

      // 触发全局主题更新事件
      window.dispatchEvent(
        new CustomEvent('theme-changed', {
          detail: { theme: newTheme },
        }),
      )
    })
  }

  // 更新Element Plus主题
  const updateElementPlusTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement

    // Element Plus CSS变量
    const elVariables = {
      light: {
        '--el-bg-color': '#ffffff',
        '--el-bg-color-page': '#f2f3f5',
        '--el-bg-color-overlay': '#ffffff',
        '--el-text-color-primary': '#303133',
        '--el-text-color-regular': '#606266',
        '--el-text-color-secondary': '#909399',
        '--el-text-color-placeholder': '#a8abb2',
        '--el-text-color-disabled': '#c0c4cc',
        '--el-border-color': '#dcdfe6',
        '--el-border-color-light': '#e4e7ed',
        '--el-border-color-lighter': '#ebeef5',
        '--el-border-color-extra-light': '#f2f6fc',
        '--el-border-color-dark': '#dcdfe6',
        '--el-border-color-darker': '#cdd0d6',
        '--el-fill-color': '#f0f2f5',
        '--el-fill-color-light': '#f5f7fa',
        '--el-fill-color-lighter': '#fafafa',
        '--el-fill-color-extra-light': '#fafcff',
        '--el-fill-color-dark': '#ebedf0',
        '--el-fill-color-darker': '#e6e8eb',
        '--el-fill-color-blank': '#ffffff',
        '--el-box-shadow':
          '0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px rgba(0, 0, 0, 0.08)',
        '--el-box-shadow-light': '0px 0px 12px rgba(0, 0, 0, 0.12)',
        '--el-box-shadow-lighter': '0px 0px 6px rgba(0, 0, 0, 0.04)',
        '--el-box-shadow-dark':
          '0px 16px 48px 16px rgba(0, 0, 0, 0.08), 0px 12px 32px rgba(0, 0, 0, 0.12), 0px 8px 16px -8px rgba(0, 0, 0, 0.16)',
        '--el-disabled-bg-color': '#f5f7fa',
        '--el-disabled-text-color': '#c0c4cc',
        '--el-disabled-border-color': '#e4e7ed',
        '--el-overlay-color': 'rgba(0, 0, 0, 0.8)',
        '--el-overlay-color-light': 'rgba(0, 0, 0, 0.7)',
        '--el-overlay-color-lighter': 'rgba(0, 0, 0, 0.5)',
        '--el-mask-color': 'rgba(255, 255, 255, 0.9)',
        '--el-mask-color-extra-light': 'rgba(255, 255, 255, 0.3)',
      },
      dark: {
        '--el-bg-color': '#141414',
        '--el-bg-color-page': '#0a0a0a',
        '--el-bg-color-overlay': '#1d1e1f',
        '--el-text-color-primary': '#e5eaf3',
        '--el-text-color-regular': '#cfd3dc',
        '--el-text-color-secondary': '#a3a6ad',
        '--el-text-color-placeholder': '#8d9095',
        '--el-text-color-disabled': '#6c6e72',
        '--el-border-color': '#4c4d4f',
        '--el-border-color-light': '#414243',
        '--el-border-color-lighter': '#363637',
        '--el-border-color-extra-light': '#2b2b2c',
        '--el-border-color-dark': '#58585b',
        '--el-border-color-darker': '#636466',
        '--el-fill-color': '#2b2b2c',
        '--el-fill-color-light': '#262727',
        '--el-fill-color-lighter': '#1f1f1f',
        '--el-fill-color-extra-light': '#191919',
        '--el-fill-color-dark': '#303030',
        '--el-fill-color-darker': '#363636',
        '--el-fill-color-blank': '#141414',
        '--el-box-shadow':
          '0px 12px 32px 4px rgba(0, 0, 0, 0.36), 0px 8px 20px rgba(0, 0, 0, 0.72)',
        '--el-box-shadow-light': '0px 0px 12px rgba(0, 0, 0, 0.72)',
        '--el-box-shadow-lighter': '0px 0px 6px rgba(0, 0, 0, 0.24)',
        '--el-box-shadow-dark':
          '0px 16px 48px 16px rgba(0, 0, 0, 0.72), 0px 12px 32px rgba(0, 0, 0, 0.84), 0px 8px 16px -8px rgba(0, 0, 0, 0.9)',
        '--el-disabled-bg-color': '#262727',
        '--el-disabled-text-color': '#6c6e72',
        '--el-disabled-border-color': '#414243',
        '--el-overlay-color': 'rgba(0, 0, 0, 0.8)',
        '--el-overlay-color-light': 'rgba(0, 0, 0, 0.7)',
        '--el-overlay-color-lighter': 'rgba(0, 0, 0, 0.5)',
        '--el-mask-color': 'rgba(0, 0, 0, 0.8)',
        '--el-mask-color-extra-light': 'rgba(0, 0, 0, 0.3)',
      },
    }

    const variables = elVariables[theme]
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  // 切换主题
  const setTheme = (newTheme: ThemeMode) => {
    theme.value = newTheme
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)

    if (newTheme === 'system') {
      applyTheme(systemTheme.value)
    } else {
      applyTheme(newTheme)
    }
  }

  // 切换到下一个主题
  const toggleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % themes.length : 0
    setTheme(themes[nextIndex]!)
  }

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        systemTheme.value = e.matches ? 'dark' : 'light'
        if (theme.value === 'system') {
          applyTheme(systemTheme.value)
        }
      }

      // 现代浏览器
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      }
      // 兼容旧版浏览器
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange)
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange)
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleChange)
        }
      }
    }
    return () => {}
  }

  // 初始化主题
  const initTheme = () => {
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    theme.value = savedTheme || 'system'

    // 检测系统主题
    systemTheme.value = detectSystemTheme()

    // 应用主题
    if (theme.value === 'system') {
      applyTheme(systemTheme.value)
    } else {
      applyTheme(theme.value)
    }
  }

  // 获取主题图标
  const getThemeIcon = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      case 'system':
        return '💻'
      default:
        return '💻'
    }
  }

  // 获取当前主题图标
  const currentThemeIcon = computed(() => getThemeIcon(theme.value))

  // 获取实际主题图标
  const actualThemeIcon = computed(() => getThemeIcon(actualTheme.value))

  // 检查是否为深色主题
  const isDark = computed(() => actualTheme.value === 'dark')

  // 检查是否为浅色主题
  const isLight = computed(() => actualTheme.value === 'light')

  // 检查是否跟随系统
  const isSystem = computed(() => theme.value === 'system')

  // 监听主题变化
  watch(theme, (newTheme) => {
    if (newTheme === 'system') {
      applyTheme(systemTheme.value)
    } else {
      applyTheme(newTheme)
    }
  })

  // 监听系统主题变化
  watch(systemTheme, (newSystemTheme) => {
    if (theme.value === 'system') {
      applyTheme(newSystemTheme)
    }
  })

  // 组件挂载时初始化
  onMounted(() => {
    initTheme()
    const cleanup = setupSystemThemeListener()

    // 组件卸载时清理监听器
    onUnmounted(() => {
      cleanup()
    })
  })

  return {
    // 状态
    theme: readonly(theme),
    systemTheme: readonly(systemTheme),
    actualTheme: readonly(actualTheme),

    // 计算属性
    currentThemeIcon,
    actualThemeIcon,
    isDark,
    isLight,
    isSystem,

    // 方法
    setTheme,
    toggleTheme,
    applyTheme,
    detectSystemTheme,
    getThemeIcon,
    initTheme,
  }
}

// 主题相关的CSS变量
export const themeVariables = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8f9fa',
    '--bg-tertiary': '#e9ecef',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#6c757d',
    '--text-tertiary': '#adb5bd',
    '--border-primary': '#dee2e6',
    '--border-secondary': '#e9ecef',
    '--accent-primary': '#00ff41',
    '--accent-secondary': '#0066cc',
    '--accent-tertiary': '#7209b7',
    '--shadow-color': 'rgba(0, 0, 0, 0.1)',
    '--card-bg': '#ffffff',
    '--card-border': '#dee2e6',
    '--hover-bg': '#f8f9fa',
    '--code-bg': '#f1f3f4',
    '--code-text': '#1f2328',
  },
  dark: {
    '--bg-primary': '#0a0a0a',
    '--bg-secondary': '#1a1a1a',
    '--bg-tertiary': '#2d2d2d',
    '--text-primary': '#ffffff',
    '--text-secondary': '#b0b0b0',
    '--text-tertiary': '#6c757d',
    '--border-primary': '#404040',
    '--border-secondary': '#2d2d2d',
    '--accent-primary': '#00ff41',
    '--accent-secondary': '#00ffff',
    '--accent-tertiary': '#ff00ff',
    '--shadow-color': 'rgba(0, 255, 65, 0.3)',
    '--card-bg': '#1a1a1a',
    '--card-border': '#404040',
    '--hover-bg': '#2d2d2d',
    '--code-bg': '#0d1117',
    '--code-text': '#c9d1d9',
  },
}

// 应用主题CSS变量
export const applyThemeVariables = (theme: 'light' | 'dark') => {
  const root = document.documentElement
  const variables = themeVariables[theme]

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
