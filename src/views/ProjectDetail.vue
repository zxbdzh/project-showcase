<template>
  <div class="project-detail">
    <div class="project-header">
      <el-button @click="router.back()" type="default" class="back-button">
        <el-icon><arrow-left /></el-icon>
        返回
      </el-button>
      <h1 class="project-title">{{ project?.title || '项目详情' }}</h1>
    </div>

    <div v-if="loading" class="loading-container">
      <loading-spinner :overlay="false" text="正在加载项目详情..." size="large" />
    </div>

    <div v-else-if="project" class="project-content">
      <!-- 项目基本信息 -->
      <el-card class="project-info">
        <template #header>
          <div class="card-header">
            <h3>项目信息</h3>
            <el-button v-if="isAdmin" @click="editProject" type="primary" size="small">
              <el-icon>
                <edit />
              </el-icon>
              编辑
            </el-button>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-item">
            <label>项目名称:</label>
            <span>{{ project.title }}</span>
          </div>
          <div class="info-item">
            <label>项目描述:</label>
            <span>{{ project.description }}</span>
          </div>
          <div class="info-item">
            <label>项目分类:</label>
            <div class="tech-tags">
              <el-tag
                v-for="category in getProjectCategories(project)"
                :key="category.id"
                :color="category.color"
                size="small"
                class="tech-tag"
              >
                {{ category.name }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <label>项目标签:</label>
            <div class="tech-tags">
              <el-tag
                v-for="tag in getProjectTags(project)"
                :key="tag.id"
                :color="tag.color"
                size="small"
                class="tech-tag"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <label>项目状态:</label>
            <el-tag :type="getStatusType(project.status || '')" size="small" class="status-tag">
              {{ getStatusText(project.status || '') }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>创建时间:</label>
            <span>{{ formatDate(project.created_at || '') }}</span>
          </div>
          <div class="info-item">
            <label>更新时间:</label>
            <span>{{ formatDate(project.updated_at || '') }}</span>
          </div>
        </div>
      </el-card>

      <!-- 项目内容 -->
      <el-card v-if="project.content" class="project-content-card">
        <template #header>
          <h3>项目详情</h3>
        </template>
        <div class="project-content-text" v-html="renderedContent"></div>
      </el-card>

      <!-- 项目链接 -->
      <el-card class="project-links">
        <template #header>
          <h3>相关链接</h3>
        </template>

        <div class="link-list">
          <div v-if="project.demo_url" class="demo-preview">
            <a :href="project.demo_url" target="_blank" class="link-item">
              <div class="link-content">
                <el-icon>
                  <link />
                </el-icon>
                <span>在线演示</span>
                <el-icon class="external-icon">
                  <link />
                </el-icon>
              </div>
            </a>
            <div class="preview-container">
              <iframe
                :src="project.demo_url"
                :title="project.title + ' 预览'"
                class="demo-preview-iframe"
                frameborder="0"
                loading="lazy"
                @load="handleIframeLoad"
                @error="handleIframeError"
              />
              <div v-if="previewLoading" class="preview-loading">
                <el-icon class="is-loading">
                  <loading />
                </el-icon>
                <span>加载预览中...</span>
              </div>
              <div class="preview-controls">
                <el-button type="primary" size="small" @click="openDemoSite" class="open-demo-btn">
                  <el-icon>
                    <link />
                  </el-icon>
                  在新窗口打开
                </el-button>
              </div>
            </div>
          </div>
          <a v-if="project.github_url" :href="project.github_url" target="_blank" class="link-item">
            <el-icon>
              <link />
            </el-icon>
            <span>GitHub 仓库</span>
            <el-icon class="external-icon">
              <link />
            </el-icon>
          </a>
        </div>
      </el-card>
    </div>

    <div v-else class="empty-state">
      <el-empty description="项目不存在或已被删除" />
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="80%">
      <div class="image-preview">
        <img :src="previewImageUrl" alt="项目图片预览" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import { useAuth } from '@/composables/useAuth'
import { useProjects } from '@/composables/useData'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { Project } from '@/utils/supabase'

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

// 路由相关
const route = useRoute()
const router = useRouter()

// 认证相关
const { isAdmin } = useAuth()

// 数据相关
const { getProject } = useProjects()

// 状态管理
const loading = ref(true)
const project = ref<Project | null>(null)
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')
const previewLoading = ref(false)

// 计算属性：解析后的 markdown 内容
const renderedContent = computed(() => {
  if (!project.value?.content) return ''
  return md.render(project.value.content)
})

// 获取项目详情
const fetchProject = async () => {
  try {
    loading.value = true
    const projectId = route.params.id as string

    // 从真实API获取项目数据
    const projectData = await getProject(projectId)

    if (projectData) {
      project.value = projectData

      // 如果有演示链接，设置预览
      if (projectData.demo_url) {
        previewLoading.value = true
      }
    } else {
      ElMessage.warning('项目不存在或已被删除')
    }
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('获取项目详情失败:', error)
    }
    ElMessage.error('获取项目详情失败')
  } finally {
    loading.value = false
  }
}

// 处理iframe加载完成
const handleIframeLoad = () => {
  previewLoading.value = false
  console.log('预览加载成功')

  // 尝试检测iframe内容是否包含登录相关内容
  setTimeout(() => {
    try {
      const iframe = document.querySelector('.demo-preview-iframe') as HTMLIFrameElement
      if (iframe && iframe.contentDocument) {
        // 检查是否有登录页面或401错误的特征
        const content =
          iframe.contentDocument.body.innerText || iframe.contentDocument.body.textContent || ''
        if (
          content.includes('401') ||
          content.includes('Unauthorized') ||
          content.includes('登录') ||
          content.includes('login')
        ) {
          ElMessage.warning('演示网站需要登录，请在新窗口中打开进行登录操作')
        }
      }
    } catch {
      // 跨域访问限制，无法检测iframe内容
      console.log('无法检测iframe内容，可能是跨域限制')
    }
  }, 2000) // 延迟2秒检测，给页面加载时间
}

// 处理iframe加载错误
const handleIframeError = () => {
  previewLoading.value = false
  console.error('预览加载失败')
}

// 处理iframe消息
const handleIframeMessage = (event: MessageEvent) => {
  // 检查消息来源是否为演示网站
  if (project.value?.demo_url && event.origin === new URL(project.value.demo_url).origin) {
    // 检查是否为401错误
    if (event.data && event.data.type === 'auth-error' && event.data.status === 401) {
      ElMessage.warning('演示网站需要登录，请在新窗口中打开进行登录操作')
    }
  }
}

// 监听控制台错误
const handleConsoleError = (event: ErrorEvent) => {
  // 检查是否为401错误
  if (event.message && event.message.includes('401')) {
    ElMessage.warning('演示网站需要登录，请在新窗口中打开进行登录操作')
  }
}

// 打开演示网站
const openDemoSite = () => {
  if (project.value?.demo_url) {
    window.open(project.value.demo_url, '_blank')
  }
}

// 状态相关方法 - 修复状态映射
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'warning',
    published: 'success',
    archived: 'info',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
  }
  return statusMap[status] || '未知'
}

// 格式化方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 辅助方法
interface ProjectWithRelations extends Project {
  categories?: Array<{ id: string; name: string; color: string }>
  tags?: Array<{ id: string; name: string; color: string }>
}

const getProjectCategories = (project: ProjectWithRelations) => {
  return project.categories || []
}

const getProjectTags = (project: ProjectWithRelations) => {
  return project.tags || []
}

// 操作方法
const editProject = () => {
  router.push(`/admin/projects/${project.value?.id}/edit`)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProject()
  // 添加消息监听器
  window.addEventListener('message', handleIframeMessage)
  // 添加控制台错误监听器
  window.addEventListener('error', handleConsoleError)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('message', handleIframeMessage)
  window.removeEventListener('error', handleConsoleError)
})
</script>

<style scoped>
.project-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.project-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.loading-container {
  padding: 20px;
}

.project-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project-info,
.project-content-card,
.project-links {
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.info-grid {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 14px;
}

.info-item span {
  font-size: 16px;
  font-weight: 400;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  margin: 0;
  border: 1px solid var(--border-secondary) !important;
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  font-weight: 500;
}

.tech-tag:hover {
  background: var(--bg-hover) !important;
  border-color: var(--accent-primary) !important;
}

.status-tag {
  font-weight: 500 !important;
}

.demo-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
}

.demo-preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  background: white;
}

.preview-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;
}

.open-demo-btn {
  background: var(--accent-primary);
  border: none;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.open-demo-btn:hover {
  background: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.preview-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  background: var(--card-bg);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-loading .el-icon {
  font-size: 24px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-item:hover {
  transform: scale(1.02);
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
  font-size: 24px;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background: var(--bg-secondary);
}

.file-icon {
  color: var(--text-secondary);
  font-size: 20px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
}

.file-size {
  font-size: 12px;
  color: var(--text-secondary);
}

.file-actions {
  display: flex;
  gap: 8px;
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.link-item:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.external-icon {
  margin-left: auto;
  color: var(--text-secondary);
}

.project-content-text {
  line-height: 1.6;
  color: var(--text-primary);
  font-size: 16px;
}

/* Markdown 样式 */
.project-content-text :deep(h1),
.project-content-text :deep(h2),
.project-content-text :deep(h3),
.project-content-text :deep(h4),
.project-content-text :deep(h5),
.project-content-text :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.4;
}

.project-content-text :deep(h1) {
  font-size: 2em;
  border-bottom: 2px solid var(--border-primary);
  padding-bottom: 8px;
}

.project-content-text :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-secondary);
  padding-bottom: 6px;
}

.project-content-text :deep(h3) {
  font-size: 1.25em;
}

.project-content-text :deep(h4) {
  font-size: 1.1em;
}

.project-content-text :deep(h5) {
  font-size: 1em;
}

.project-content-text :deep(h6) {
  font-size: 0.9em;
  color: var(--text-secondary);
}

.project-content-text :deep(p) {
  margin-bottom: 16px;
  text-align: justify;
}

.project-content-text :deep(ul),
.project-content-text :deep(ol) {
  margin-bottom: 16px;
  padding-left: 24px;
}

.project-content-text :deep(li) {
  margin-bottom: 8px;
  line-height: 1.6;
}

.project-content-text :deep(blockquote) {
  border-left: 4px solid var(--accent-primary);
  padding: 16px 20px;
  margin: 16px 0;
  background: var(--bg-secondary);
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
  font-style: italic;
}

.project-content-text :deep(code) {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--accent-primary);
  border: 1px solid var(--border-secondary);
}

.project-content-text :deep(pre) {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid var(--border-secondary);
  position: relative;
}

.project-content-text :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  color: var(--text-primary);
  font-size: 0.9em;
  line-height: 1.5;
}

.project-content-text :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-content-text :deep(th),
.project-content-text :deep(td) {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-secondary);
}

.project-content-text :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.project-content-text :deep(tr:hover) {
  background: var(--bg-secondary);
}

.project-content-text :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.project-content-text :deep(a:hover) {
  border-bottom-color: var(--accent-primary);
}

.project-content-text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-content-text :deep(hr) {
  border: none;
  height: 2px;
  background: var(--border-secondary);
  margin: 24px 0;
  border-radius: 1px;
}

.project-content-text :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}

.project-content-text :deep(em) {
  color: var(--text-secondary);
  font-style: italic;
}

.image-preview {
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-detail {
    padding: 16px;
  }

  .project-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .project-title {
    font-size: 24px;
  }

  .demo-preview {
    gap: 8px;
  }

  .preview-container {
    height: 300px;
  }

  .preview-controls {
    bottom: 12px;
    right: 12px;
  }

  .link-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .project-content-text :deep(table) {
    font-size: 14px;
  }

  .project-content-text :deep(th),
  .project-content-text :deep(td) {
    padding: 8px 12px;
  }

  .project-content-text :deep(pre) {
    padding: 16px;
    overflow-x: scroll;
  }
}
</style>
