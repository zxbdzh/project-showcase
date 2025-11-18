<template>
  <div class="admin">
    <!-- 管理后台头部 -->
    <header class="admin__header">
      <div class="admin__header-content">
        <h1 class="admin__title">
          <glitch-text text="ADMIN DASHBOARD" />
        </h1>
        <p class="admin__subtitle">管理后台控制面板</p>
      </div>
    </header>

    <!-- 统计卡片 -->
    <section class="admin__stats">
      <div class="admin__stats-grid">
        <div class="admin__stat-card">
          <div class="admin__stat-icon">
            <el-icon :size="32" color="var(--accent-primary)">
              <Document />
            </el-icon>
          </div>
          <div class="admin__stat-content">
            <h3 class="admin__stat-number">{{ stats.projects }}</h3>
            <p class="admin__stat-label">项目总数</p>
          </div>
        </div>

        <div class="admin__stat-card">
          <div class="admin__stat-icon">
            <el-icon :size="32" color="var(--success)">
              <User />
            </el-icon>
          </div>
          <div class="admin__stat-content">
            <h3 class="admin__stat-number">{{ stats.users }}</h3>
            <p class="admin__stat-label">用户总数</p>
          </div>
        </div>

        <div class="admin__stat-card">
          <div class="admin__stat-icon">
            <el-icon :size="32" color="var(--warning)">
              <View />
            </el-icon>
          </div>
          <div class="admin__stat-content">
            <h3 class="admin__stat-number">{{ stats.views }}</h3>
            <p class="admin__stat-label">总访问量</p>
          </div>
        </div>

        <div class="admin__stat-card">
          <div class="admin__stat-icon">
            <el-icon :size="32" color="var(--error)">
              <Star />
            </el-icon>
          </div>
          <div class="admin__stat-content">
            <h3 class="admin__stat-number">{{ stats.likes }}</h3>
            <p class="admin__stat-label">获赞总数</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 快捷操作 -->
    <section class="admin__actions">
      <div class="admin__actions-content">
        <h2 class="admin__section-title">快捷操作</h2>
        <div class="admin__actions-grid">
          <el-button
            type="primary"
            size="large"
            class="admin__action-btn"
            @click="navigateToProjects"
          >
            <el-icon><Document /></el-icon>
            项目管理
          </el-button>

          <el-button
            type="success"
            size="large"
            class="admin__action-btn"
            @click="navigateToCategories"
          >
            <el-icon><Folder /></el-icon>
            分类管理
          </el-button>

          <el-button type="warning" size="large" class="admin__action-btn" @click="navigateToTags">
            <el-icon><CollectionTag /></el-icon>
            标签管理
          </el-button>

          <el-button type="info" size="large" class="admin__action-btn" @click="navigateToSkills">
            <el-icon><TrendCharts /></el-icon>
            技能管理
          </el-button>

          <el-button
            type="danger"
            size="large"
            class="admin__action-btn"
            @click="navigateToSocialLinks"
          >
            <el-icon><Link /></el-icon>
            社交链接
          </el-button>

          <el-button
            type="primary"
            size="large"
            class="admin__action-btn"
            @click="navigateToSiteSettings"
          >
            <el-icon><Setting /></el-icon>
            网站设置
          </el-button>
        </div>
      </div>
    </section>

    <!-- 最近活动 -->
    <section class="admin__activity">
      <div class="admin__activity-content">
        <h2 class="admin__section-title">最近活动</h2>
        <div class="admin__activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="admin__activity-item">
            <div class="admin__activity-icon">
              <el-icon :color="getActivityColor(activity.type)">
                <component :is="getActivityIcon(activity.type)" />
              </el-icon>
            </div>
            <div class="admin__activity-content">
              <p class="admin__activity-title">{{ activity.title }}</p>
              <p class="admin__activity-time">{{ formatTime(activity.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 系统状态 -->
    <section class="admin__status">
      <div class="admin__status-content">
        <h2 class="admin__section-title">系统状态</h2>
        <div class="admin__status-grid">
          <div class="admin__status-item">
            <div class="admin__status-label">数据库连接</div>
            <div class="admin__status-value">
              <el-tag :type="systemStatus.database ? 'success' : 'danger'">
                {{ systemStatus.database ? '正常' : '异常' }}
              </el-tag>
            </div>
          </div>

          <div class="admin__status-item">
            <div class="admin__status-label">文件存储</div>
            <div class="admin__status-value">
              <el-tag :type="systemStatus.storage ? 'success' : 'danger'">
                {{ systemStatus.storage ? '正常' : '异常' }}
              </el-tag>
            </div>
          </div>

          <div class="admin__status-item">
            <div class="admin__status-label">API服务</div>
            <div class="admin__status-value">
              <el-tag :type="systemStatus.api ? 'success' : 'danger'">
                {{ systemStatus.api ? '正常' : '异常' }}
              </el-tag>
            </div>
          </div>

          <div class="admin__status-item">
            <div class="admin__status-label">缓存服务</div>
            <div class="admin__status-value">
              <el-tag :type="systemStatus.cache ? 'success' : 'danger'">
                {{ systemStatus.cache ? '正常' : '异常' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  Document,
  User,
  View,
  Star,
  Folder,
  CollectionTag,
  TrendCharts,
  Link,
  Plus,
  Edit,
  Delete,
} from '@element-plus/icons-vue'

import GlitchText from '@/components/GlitchText.vue'
import { useData } from '@/composables/useData'

const router = useRouter()

// 数据相关
const { projects, categories, tags, skills, socialLinks } = useData()

// 统计数据
const stats = ref({
  projects: 0,
  users: 1,
  views: 0,
  likes: 0,
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    type: 'create',
    title: '创建了新项目',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'update',
    title: '更新了项目信息',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    type: 'delete',
    title: '删除了项目数据',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
])

// 系统状态
const systemStatus = ref({
  database: true,
  storage: true,
  api: true,
  cache: true,
})

// 获取活动图标
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'create':
      return markRaw(Plus)
    case 'update':
      return markRaw(Edit)
    case 'delete':
      return markRaw(Delete)
    default:
      return markRaw(Document)
  }
}

// 获取活动颜色
const getActivityColor = (type: string) => {
  switch (type) {
    case 'create':
      return 'var(--success)'
    case 'update':
      return 'var(--warning)'
    case 'delete':
      return 'var(--error)'
    default:
      return 'var(--text-secondary)'
  }
}

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 导航方法
const navigateToProjects = () => {
  router.push({ name: 'admin-projects' })
}

const navigateToCategories = () => {
  router.push({ name: 'admin-categories' })
}

const navigateToTags = () => {
  router.push({ name: 'admin-tags' })
}

const navigateToSkills = () => {
  router.push({ name: 'admin-skills' })
}

const navigateToSocialLinks = () => {
  router.push({ name: 'admin-social-links' })
}

const navigateToSiteSettings = () => {
  router.push({ name: 'admin-site-settings' })
}

// 组件挂载时加载数据
onMounted(async () => {
  try {
    // 更新统计数据
    stats.value.projects = projects.value.length
    stats.value.users = 1 // 暂时固定为1，后续可以从用户表获取

    ElMessage.success('欢迎来到管理后台')
  } catch {
    ElMessage.error('加载数据失败')
  }
})
</script>

<style scoped>
.admin {
  min-height: 100vh;
  background: var(--bg-primary);
}

.admin__header {
  padding: 4rem 2rem 2rem;
  text-align: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.admin__header-content {
  max-width: 800px;
  margin: 0 auto;
}

.admin__title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.admin__subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.admin__stats {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.admin__stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.admin__stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.admin__stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px var(--shadow-color);
  border-color: var(--accent-primary);
}

.admin__stat-icon {
  flex-shrink: 0;
}

.admin__stat-content {
  flex: 1;
}

.admin__stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.admin__stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.admin__actions {
  padding: 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.admin__actions-content {
  max-width: 1200px;
  margin: 0 auto;
}

.admin__section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.admin__actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.admin__action-btn {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.admin__activity {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.admin__activity-content {
  max-width: 800px;
}

.admin__activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin__activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.admin__activity-item:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.admin__activity-icon {
  flex-shrink: 0;
}

.admin__activity-content {
  flex: 1;
}

.admin__activity-title {
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.admin__activity-time {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.admin__status {
  padding: 2rem;
  background: var(--bg-secondary);
  max-width: 1200px;
  margin: 0 auto;
}

.admin__status-content {
  max-width: 800px;
}

.admin__status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.admin__status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.admin__status-label {
  color: var(--text-primary);
  font-weight: 500;
}

.admin__status-value {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin__header {
    padding: 3rem 1rem 1.5rem;
  }

  .admin__title {
    font-size: 2rem;
  }

  .admin__stats,
  .admin__activity,
  .admin__status {
    padding: 1.5rem 1rem;
  }

  .admin__actions {
    padding: 1.5rem 1rem;
  }

  .admin__stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .admin__actions-grid {
    grid-template-columns: 1fr;
  }

  .admin__status-grid {
    grid-template-columns: 1fr;
  }

  .admin__stat-card {
    padding: 1rem;
  }

  .admin__stat-number {
    font-size: 1.5rem;
  }

  .admin__action-btn {
    height: 50px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .admin__activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .admin__status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
