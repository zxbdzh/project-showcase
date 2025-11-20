<template>
  <div class="layout">
    <!-- 矩阵雨背景 -->
    <matrix-rain :is-active="isDark" />

    <!-- 导航栏 -->
    <header class="layout__header">
      <nav class="layout__nav">
        <div class="layout__nav-brand">
          <router-link to="/" class="brand-link" :class="brandTextClass">
            <!-- 如果有logo，显示logo；否则显示文字 -->
            <img
              v-if="siteLogo"
              :src="siteLogo"
              :alt="brandText"
              class="brand-logo"
              @error="handleLogoError"
            />
            <glitch-text v-else :text="brandText" :color="isDark ? '#00ff41' : '#0066cc'" />
          </router-link>
        </div>

        <div class="layout__nav-actions">
          <theme-toggle />
          <el-button v-if="!isAuthenticated" type="primary" @click="showLoginModal = true">
            登录
          </el-button>
          <el-dropdown v-else @command="handleUserAction">
            <el-avatar :size="40" :src="profile?.avatar_url">
              {{ userInitials }}
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="dashboard">管理后台</el-dropdown-item>
                <el-dropdown-item command="change-password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </nav>
    </header>

    <!-- 主要内容 -->
    <main class="layout__main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="layout__footer">
      <p>&copy; 2024 Geek Portfolio. Built with Vue 3 & Supabase.</p>
    </footer>

    <!-- 登录模态框 -->
    <el-dialog v-model="showLoginModal" title="用户登录" width="400px" :show-close="false" center>
      <login-form @success="handleLoginSuccess" @switch-mode="handleSwitchMode" />
    </el-dialog>

    <!-- 修改密码模态框 -->
    <change-password-dialog
      v-model="showChangePasswordModal"
      @success="handleChangePasswordSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import { useSystemSettings } from '@/composables/useData'
import MatrixRain from '@/components/MatrixRain.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import GlitchText from '@/components/GlitchText.vue'
import LoginForm from '@/components/Auth/LoginForm.vue'
import ChangePasswordDialog from '@/components/Auth/ChangePasswordDialog.vue'

const router = useRouter()
const { isAuthenticated, profile, userInitials, signOut } = useAuth()
const { isDark } = useTheme()
const {
  getSettingValue,
  loadSystemSettings,
  systemSettings,
  loading: settingsLoading,
} = useSystemSettings()

// 模态框状态
const showLoginModal = ref(false)
const showChangePasswordModal = ref(false)

// 加载状态
const isSettingsLoading = settingsLoading

// 动态品牌文字
const brandText = computed(() => getSettingValue('brand_text', 'GEEK'))

// 网站Logo
const siteLogo = computed(() => getSettingValue('site_logo', ''))

// 品牌文字动画类
const brandTextClass = computed(() => ({
  'brand-text--loading': isSettingsLoading.value,
  'brand-text--loaded': !isSettingsLoading.value,
}))

// 处理Logo加载错误
const handleLogoError = (event: Event) => {
  console.warn('Logo failed to load:', event)
  // 可以在这里设置一个默认logo或者回退到文字显示
}

// 处理用户操作
const handleUserAction = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'dashboard':
      router.push('/admin')
      break
    case 'change-password':
      showChangePasswordModal.value = true
      break
    case 'logout':
      try {
        await signOut()
        ElMessage.success('已退出登录')
      } catch {
        ElMessage.error('退出登录失败')
      }
      break
  }
}

// 处理登录成功
const handleLoginSuccess = () => {
  showLoginModal.value = false
  ElMessage.success('欢迎回来！')
}

// 处理修改密码成功
const handleChangePasswordSuccess = () => {
  showChangePasswordModal.value = false
  ElMessage.success('密码修改成功！')
}

// 处理切换模式
const handleSwitchMode = (mode: string) => {
  // 这里可以切换到注册表单
  // console.log('Switch to mode:', mode)
}

// 设置网页标题（参考favicon更新方法）
const updatePageTitle = (title: string) => {
  if (title && title !== document.title) {
    document.title = title
    // console.log('Page title updated:', title)
  }
}

// 更新favicon（使用博客园推荐的方法）
const updateFavicon = () => {
  const favicon = getSettingValue('site_favicon', '')
  if (favicon) {
    // 使用博客园推荐的方法：直接查找并更新现有的favicon
    let $favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement

    if ($favicon !== null) {
      // 如果存在现有的favicon，直接更新href
      $favicon.href = favicon
      // console.log('Layout favicon updated:', favicon)
    } else {
      // 如果不存在，创建新的favicon元素
      $favicon = document.createElement('link')
      $favicon.rel = 'icon'
      $favicon.type = 'image/x-icon'
      $favicon.href = favicon
      document.head.appendChild($favicon)
      console.log('Layout new favicon created:', favicon)
    }

    // 同时处理shortcut icon
    let $shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement
    if ($shortcutIcon !== null) {
      $shortcutIcon.href = favicon
      console.log('Layout shortcut icon updated:', favicon)
    } else {
      $shortcutIcon = document.createElement('link')
      $shortcutIcon.rel = 'shortcut icon'
      $shortcutIcon.type = 'image/x-icon'
      $shortcutIcon.href = favicon
      document.head.appendChild($shortcutIcon)
      console.log('Layout new shortcut icon created:', favicon)
    }

    // 额外的强制刷新技术
    setTimeout(() => {
      // 使用Image对象预加载强制浏览器重新下载
      const img = new Image()
      img.onload = () => {
        console.log('Layout favicon preloaded successfully')
      }
      img.onerror = () => {
        console.log('Layout favicon preload failed')
      }
      img.src = favicon

      // iframe隐藏加载技术强制刷新缓存
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = favicon
      document.body.appendChild(iframe)

      // 短暂延迟后移除iframe
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe)
        }
      }, 100)
    }, 50)
  }
}

// 应用所有页面设置（标题、favicon、meta等）
const applyPageSettings = () => {
  // 更新页面标题
  const siteTitle = getSettingValue('site_title', 'Geek Portfolio')
  updatePageTitle(siteTitle)

  // 更新favicon
  updateFavicon()

  // 更新meta标签
  const description = getSettingValue('site_description', '')
  if (description) {
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }

  const keywords = getSettingValue('seo_keywords', '')
  if (keywords) {
    let meta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'keywords'
      document.head.appendChild(meta)
    }
    meta.content = keywords
  }

  const author = getSettingValue('seo_author', '')
  if (author) {
    let meta = document.querySelector('meta[name="author"]') as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'author'
      document.head.appendChild(meta)
    }
    meta.content = author
  }

  console.log('Layout page settings applied')
}

// 初始化系统设置
const initializeSettings = async () => {
  try {
    await loadSystemSettings()
    // 应用所有页面设置
    applyPageSettings()
  } catch (error) {
    console.error('Failed to load system settings:', error)
  }
}

// 监听系统设置变化，更新页面设置
watch(
  () => systemSettings.value,
  () => {
    applyPageSettings()
  },
  { deep: true },
)

// 组件挂载时初始化设置
onMounted(() => {
  initializeSettings()
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.layout__header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-primary);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-primary);
}

.layout__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.layout__nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-link {
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.brand-logo {
  height: 40px;
  max-width: 200px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* 品牌文字加载动画 */
.brand-text--loading {
  opacity: 0.6;
  transform: scale(0.95);
  transition: all 0.3s ease;
}

.brand-text--loaded {
  opacity: 1;
  transform: scale(1);
  transition: all 0.3s ease;
}

.brand-text--loading:hover {
  opacity: 0.8;
  transform: scale(0.98);
}

.layout__nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.layout__main {
  flex: 1;
  padding-top: 80px;
  display: flex;
  flex-direction: column;
}

.layout__footer {
  text-align: center;
  padding: 2rem;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-primary);
  color: var(--text-secondary);
  margin-top: auto;
}

/* 页面切换动画 */
.page-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.55, 0.2);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
  filter: blur(2px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(1.05);
  filter: blur(1px);
}

/* 页面切换时的内容动画 */
.page-enter-active {
  animation: pageSlideIn 0.4s ease-out;
}

.page-leave-active {
  animation: pageSlideOut 0.3s ease-in;
}

@keyframes pageSlideIn {
  0% {
    opacity: 0;
    transform: translateX(50px) translateY(20px) scale(0.95);
    filter: blur(4px);
  }
  50% {
    opacity: 0.8;
    transform: translateX(10px) translateY(5px) scale(0.98);
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    transform: translateX(0) translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes pageSlideOut {
  0% {
    opacity: 1;
    transform: translateX(0) translateY(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50px) translateY(-20px) scale(1.05);
    filter: blur(3px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout__nav {
    padding: 1rem;
  }

  .layout__nav-brand {
    font-size: 1.2rem;
  }

  .layout__nav-actions {
    gap: 0.5rem;
  }
}
</style>
