<template>
  <div class="projects">
    <!-- 页面头部 -->
    <header class="projects__header">
      <div class="projects__header-content">
        <h1 class="projects__title">
          <glitch-text text="PROJECTS" />
        </h1>
        <p class="projects__subtitle">所有项目作品</p>
      </div>
    </header>

    <!-- 筛选和搜索 -->
    <section class="projects__filters">
      <div class="projects__filters-content">
        <div class="projects__search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索项目..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>

        <div class="projects__filter-tags">
          <el-tag
            v-for="category in categories"
            :key="category.id"
            :type="selectedCategory === category.id ? 'primary' : undefined"
            :effect="selectedCategory === category.id ? 'dark' : 'plain'"
            class="projects__filter-tag"
            @click="handleCategoryFilter(category.id)"
          >
            {{ category.name }}
          </el-tag>
        </div>
      </div>
    </section>

    <!-- 项目列表 -->
    <main class="projects__main">
      <div class="projects__grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="projects__card"
          @click="openProject(project)"
        >
          <div class="projects__card-image">
            <img
              :src="project.cover_image || '/placeholder-project.jpg'"
              :alt="project.title"
              loading="lazy"
            />
            <div class="projects__card-overlay">
              <el-button type="primary" size="small"> 查看详情 </el-button>
            </div>
          </div>

          <div class="projects__card-content">
            <h3 class="projects__card-title">{{ project.title }}</h3>
            <p class="projects__card-description">{{ project.description }}</p>

            <div class="projects__card-meta">
              <div class="projects__card-tags">
                <el-tag
                  v-for="tag in project.tags?.slice(0, 3)"
                  :key="tag"
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>

              <div class="projects__card-stats">
                <span class="projects__card-date">
                  {{ formatDate(project.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredProjects.length === 0" class="projects__empty">
        <el-empty description="暂无项目" />
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="projects__load-more">
        <el-button @click="loadMore" :loading="loading"> 加载更多 </el-button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import GlitchText from '@/components/GlitchText.vue'

// 定义项目类型接口
interface Project {
  id: number
  title: string
  description: string
  cover_image?: string
  tags: string[]
  category: string
  url: string
  created_at: string
}

interface Category {
  id: string
  name: string
}

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const loading = ref(false)
const hasMore = ref(true)

// 模拟项目数据
const projects = ref([
  {
    id: 1,
    title: 'Vue 3 项目展示系统',
    description: '基于 Vue 3 + Supabase 的现代化个人主页展示系统，包含完整的前端展示和后台管理功能',
    cover_image: '/project-1.jpg',
    tags: ['Vue.js', 'TypeScript', 'Supabase', 'Element Plus'],
    category: 'frontend',
    url: 'https://github.com/example/project1',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Spring Boot 微服务架构',
    description: '基于 Spring Boot 的微服务架构项目，包含完整的 CI/CD 流程和容器化部署',
    cover_image: '/project-2.jpg',
    tags: ['Java', 'Spring Boot', 'Docker', 'Kubernetes'],
    category: 'backend',
    url: 'https://github.com/example/project2',
    created_at: '2024-01-10T15:30:00Z',
  },
  {
    id: 3,
    title: '实时数据监控平台',
    description: '基于 WebSocket 的实时数据监控和可视化平台，支持多数据源接入',
    cover_image: '/project-3.jpg',
    tags: ['WebSocket', 'ECharts', 'Node.js', 'Redis'],
    category: 'fullstack',
    url: 'https://github.com/example/project3',
    created_at: '2024-01-05T09:15:00Z',
  },
  {
    id: 4,
    title: '智能推荐系统',
    description: '基于机器学习的智能推荐系统，支持协同过滤和内容推荐算法',
    cover_image: '/project-4.jpg',
    tags: ['Python', 'TensorFlow', 'Redis', 'MongoDB'],
    category: 'ai',
    url: 'https://github.com/example/project4',
    created_at: '2023-12-28T14:20:00Z',
  },
  {
    id: 5,
    title: '移动端商城应用',
    description: '基于 uni-app 的跨平台商城应用，支持微信小程序和APP',
    cover_image: '/project-5.jpg',
    tags: ['uni-app', 'Vue.js', '微信小程序', '移动端'],
    category: 'mobile',
    url: 'https://github.com/example/project5',
    created_at: '2023-12-20T11:45:00Z',
  },
  {
    id: 6,
    title: 'DevOps 自动化平台',
    description: '基于 Jenkins 和 Docker 的 DevOps 自动化平台，实现持续集成和部署',
    cover_image: '/project-6.jpg',
    tags: ['DevOps', 'Jenkins', 'Docker', 'CI/CD'],
    category: 'devops',
    url: 'https://github.com/example/project6',
    created_at: '2023-12-15T16:00:00Z',
  },
])

// 分类数据
const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'frontend', name: '前端' },
  { id: 'backend', name: '后端' },
  { id: 'fullstack', name: '全栈' },
  { id: 'mobile', name: '移动端' },
  { id: 'ai', name: '人工智能' },
  { id: 'devops', name: 'DevOps' },
])

// 计算属性
const filteredProjects = computed(() => {
  let filtered = projects.value

  // 按分类筛选
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter((project) => project.category === selectedCategory.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  return filtered
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleCategoryFilter = (categoryId: string) => {
  selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId
}

const openProject = (project: Project) => {
  window.open(project.url, '_blank')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const loadMore = async () => {
  loading.value = true
  try {
    // 模拟加载更多数据
    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElMessage.success('已加载更多项目')
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载
onMounted(() => {
  // 可以在这里加载真实数据
})
</script>

<style scoped>
.projects {
  min-height: 100vh;
  background: var(--bg-primary);
}

.projects__header {
  padding: 4rem 2rem 2rem;
  text-align: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.projects__header-content {
  max-width: 800px;
  margin: 0 auto;
}

.projects__title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.projects__subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.projects__filters {
  padding: 2rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.projects__filters-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.projects__search {
  max-width: 400px;
  margin: 0 auto;
}

.projects__filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.projects__filter-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.projects__filter-tag:hover {
  transform: translateY(-2px);
}

.projects__main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.projects__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.projects__card {
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.projects__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px var(--shadow-color);
  border-color: var(--accent-primary);
}

.projects__card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.projects__card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.projects__card:hover .projects__card-image img {
  transform: scale(1.05);
}

.projects__card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.projects__card:hover .projects__card-overlay {
  opacity: 1;
}

.projects__card-content {
  padding: 1.5rem;
}

.projects__card-title {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.projects__card-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.projects__card-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.projects__card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.projects__card-date {
  color: var(--text-muted);
  font-size: 0.9rem;
  white-space: nowrap;
}

.projects__empty {
  text-align: center;
  padding: 4rem 2rem;
}

.projects__load-more {
  text-align: center;
  padding: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .projects__header {
    padding: 3rem 1rem 1.5rem;
  }

  .projects__title {
    font-size: 2rem;
  }

  .projects__filters {
    padding: 1.5rem 1rem;
  }

  .projects__main {
    padding: 1.5rem 1rem;
  }

  .projects__grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .projects__card-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .projects__filter-tags {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .projects__search {
    max-width: 100%;
  }

  .projects__card-content {
    padding: 1rem;
  }

  .projects__card-title {
    font-size: 1.1rem;
  }
}
</style>
