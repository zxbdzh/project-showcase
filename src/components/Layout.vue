<template>
  <div class="layout">
    <!-- 矩阵雨背景 -->
    <matrix-rain :is-active="isDark" />

    <!-- 导航栏 -->
    <header class="layout__header">
      <nav class="layout__nav">
        <div class="layout__nav-brand">
          <router-link to="/" class="brand-link">
            <glitch-text text="GEEK" :color="isDark ? '#00ff41' : '#0066cc'" />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import MatrixRain from '@/components/MatrixRain.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import GlitchText from '@/components/GlitchText.vue'
import LoginForm from '@/components/Auth/LoginForm.vue'

const router = useRouter()
const { isAuthenticated, profile, userInitials, signOut } = useAuth()
const { isDark } = useTheme()

// 模态框状态
const showLoginModal = ref(false)

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
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
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
