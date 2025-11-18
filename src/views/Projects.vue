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
            v-for="category in categoriesWithAll"
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
      <!-- 加载状态 -->
      <div v-if="isLoading" class="projects__grid">
        <skeleton-loader v-for="i in 6" :key="i" type="project-card" />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="loadingError" class="projects__error">
        <el-alert
          title="加载失败"
          :description="loadingError"
          type="error"
          show-icon
          :closable="false"
        />
        <el-button @click="loadData" type="primary" style="margin-top: 1rem"> 重新加载 </el-button>
      </div>

      <!-- 正常内容 -->
      <div v-else>
        <div class="projects__grid">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="projects__card"
            @click="openProject(project)"
          >
            <div class="projects__card-image">
              <img src="/placeholder-project.svg" :alt="project.title" loading="lazy" />
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
                    v-for="tag in ['Vue.js', 'TypeScript', 'Node.js']"
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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import GlitchText from '@/components/GlitchText.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import { useProjects, useCategories } from '@/composables/useData'
import type { Project, Category } from '@/utils/supabase'

const router = useRouter()

// 使用数据服务
const { publishedProjects, loadProjects } = useProjects()
const { categories, loadCategories } = useCategories()

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const loading = ref(false)
const hasMore = ref(true)
const isLoading = ref(true)
const loadingError = ref<string | null>(null)

// 计算属性 - 添加"全部"分类选项
const categoriesWithAll = computed(() => [{ id: 'all', name: '全部' }, ...categories.value])

// 计算属性
const filteredProjects = computed(() => {
  let filtered = publishedProjects.value

  // 按分类筛选
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter((project) => {
      const categoryIds = project.categories?.map((cat: any) => cat.id) || []
      return categoryIds.includes(selectedCategory.value)
    })
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query)) ||
        project.tags?.some((tag: any) => tag.name.toLowerCase().includes(query)),
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
  // 优先使用 demo_url，其次使用 github_url
  const url = project.demo_url || project.github_url
  if (url) {
    window.open(url, '_blank')
  } else {
    // 如果没有外部链接，跳转到项目详情页
    router.push(`/project/${project.id}`)
  }
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
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 加载数据
const loadData = async () => {
  isLoading.value = true
  loadingError.value = null

  try {
    await Promise.all([loadProjects({ status: 'published' }), loadCategories()])
  } catch (error) {
    console.error('Failed to load data:', error)
    loadingError.value = '加载数据失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 组件挂载
onMounted(() => {
  loadData()
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
