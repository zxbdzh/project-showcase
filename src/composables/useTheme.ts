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

  // 应用主题到DOM - 按照Element Plus官方方式
  const applyThemeToDOM = (themeValue: 'light' | 'dark') => {
    const root = document.documentElement

    // Element Plus暗色模式只需要在html上添加dark类
    if (themeValue === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 设置data-theme属性用于自定义样式
    root.setAttribute('data-theme', themeValue)

    // 应用自定义CSS变量
    applyThemeVariables(themeValue)

    // 更新meta标签
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeValue === 'dark' ? '#0a0a0a' : '#ffffff')
    }

    // 触发全局主题更新事件
    window.dispatchEvent(
      new CustomEvent('theme-changed', {
        detail: { theme: themeValue },
      }),
    )
  }

  // 使用页面刷新切换主题
  const applyThemeWithTransition = (newTheme: 'light' | 'dark') => {
    // 直接应用主题到localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme.value)

    // 应用主题到DOM
    actualTheme.value = newTheme
    applyThemeToDOM(newTheme)

    // 刷新页面以确保所有组件正确应用主题
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  // 切换主题
  const setTheme = (newTheme: ThemeMode, showTransition = false) => {
    theme.value = newTheme
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)

    const targetTheme = newTheme === 'system' ? systemTheme.value : newTheme

    if (showTransition) {
      applyThemeWithTransition(targetTheme)
    } else {
      actualTheme.value = targetTheme
      applyThemeToDOM(targetTheme)
    }
  }

  // 切换到下一个主题
  const toggleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % themes.length : 0
    setTheme(themes[nextIndex]!, true) // 手动切换时显示过渡动画
  }

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        systemTheme.value = e.matches ? 'dark' : 'light'
        if (theme.value === 'system') {
          setTheme('system', false) // 系统主题变化不显示过渡
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

    // 应用主题（不显示过渡动画）
    const initialTheme = theme.value === 'system' ? systemTheme.value : theme.value
    actualTheme.value = initialTheme
    applyThemeToDOM(initialTheme)
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
    const targetTheme = newTheme === 'system' ? systemTheme.value : newTheme
    if (actualTheme.value !== targetTheme) {
      setTheme(newTheme, false) // watch触发的变化不显示过渡
    }
  })

  // 监听系统主题变化
  watch(systemTheme, (newSystemTheme) => {
    if (theme.value === 'system' && actualTheme.value !== newSystemTheme) {
      setTheme('system', false) // 系统主题变化不显示过渡
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
    applyThemeWithTransition,
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
