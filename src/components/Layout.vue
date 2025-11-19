<template>
  <div class="layout">
    <!-- 矩阵雨背景 -->
    <matrix-rain :is-active="isDark" />

    <!-- 导航栏 -->
    <header class="layout__header">
      <nav class="layout__nav">
        <div class="layout__nav-brand">
          <router-link to="/" class="brand-link" :class="brandTextClass">
            <glitch-text :text="brandText" :color="isDark ? '#00ff41' : '#0066cc'" />
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
                <el-dropdown-item command="profile">个人档案</el-dropdown-item>
                <el-dropdown-item command="dashboard">管理后台</el-dropdown-item>
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

// 加载状态
const isSettingsLoading = settingsLoading

// 动态品牌文字
const brandText = computed(() => getSettingValue('brand_text', 'GEEK'))

// 品牌文字动画类
const brandTextClass = computed(() => ({
  'brand-text--loading': isSettingsLoading.value,
  'brand-text--loaded': !isSettingsLoading.value,
}))

// 处理用户操作
const handleUserAction = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'dashboard':
      router.push('/admin')
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

// 处理切换模式
const handleSwitchMode = (mode: string) => {
  // 这里可以切换到注册表单
  console.log('Switch to mode:', mode)
}

// 设置网页标题
const updatePageTitle = (title: string) => {
  document.title = title || 'Geek Portfolio'
}

// 初始化系统设置
const initializeSettings = async () => {
  try {
    await loadSystemSettings()
    // 设置网页标题
    const siteTitle = getSettingValue('site_title', 'Geek Portfolio')
    updatePageTitle(siteTitle)
  } catch (error) {
    console.error('Failed to load system settings:', error)
  }
}

// 监听系统设置变化，更新标题
watch(
  () => systemSettings.value,
  () => {
    const siteTitle = getSettingValue('site_title', 'Geek Portfolio')
    updatePageTitle(siteTitle)
  },
  { deep: true }
)

// 组件挂载时初始化设置
onMounted(() => {
  initializeSettings()
})
