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
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="project" class="project-content">
      <!-- 项目基本信息 -->
      <el-card class="project-info">
        <template #header>
          <div class="card-header">
            <h3>项目信息</h3>
            <el-button v-if="isAdmin" @click="editProject" type="primary" size="small">
              <el-icon><edit /></el-icon>
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
            <label>技术栈:</label>
            <div class="tech-tags">
              <el-tag
                v-for="tech in project.technologies"
                :key="tech"
                type="info"
                size="small"
                class="tech-tag"
              >
                {{ tech }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <label>项目状态:</label>
            <el-tag :type="getStatusType(project.status)" size="small">
              {{ getStatusText(project.status) }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>创建时间:</label>
            <span>{{ formatDate(project.created_at) }}</span>
          </div>
          <div class="info-item">
            <label>更新时间:</label>
            <span>{{ formatDate(project.updated_at) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 项目图片 -->
      <el-card v-if="project.images && project.images.length > 0" class="project-images">
        <template #header>
          <h3>项目截图</h3>
        </template>

        <div class="image-grid">
          <div
            v-for="(image, index) in project.images"
            :key="index"
            class="image-item"
            @click="previewImage(image)"
          >
            <img :src="image.url" :alt="`项目截图 ${index + 1}`" />
            <div class="image-overlay">
              <el-icon><zoom-in /></el-icon>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 项目文件 -->
      <el-card v-if="project.files && project.files.length > 0" class="project-files">
        <template #header>
          <h3>项目文件</h3>
        </template>

        <div class="file-list">
          <div v-for="file in project.files" :key="file.id" class="file-item">
            <el-icon class="file-icon"><document /></el-icon>
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <div class="file-actions">
              <el-button @click="downloadFile(file)" type="primary" size="small">
                <el-icon><download /></el-icon>
                下载
              </el-button>
              <el-button v-if="isAdmin" @click="deleteFile(file)" type="danger" size="small">
                <el-icon><delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 项目链接 -->
      <el-card v-if="project.links && project.links.length > 0" class="project-links">
        <template #header>
          <h3>相关链接</h3>
        </template>

        <div class="link-list">
          <a
            v-for="link in project.links"
            :key="link.id"
            :href="link.url"
            target="_blank"
            class="link-item"
          >
            <el-icon><link /></el-icon>
            <span>{{ link.title }}</span>
            <el-icon class="external-icon"><link /></el-icon>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Document, Download, Delete, ZoomIn, Link } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth'

// 路由相关
const route = useRoute()
const router = useRouter()

// 认证相关
const { isAdmin } = useAuth()

// 状态管理
const loading = ref(true)
const project = ref<any>(null)
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

// 获取项目详情
const fetchProject = async () => {
  try {
    loading.value = true
    const projectId = route.params.id as string

    // 模拟数据，实际应该从API获取
    await new Promise((resolve) => setTimeout(resolve, 1000))

    project.value = {
      id: projectId,
      title: 'Vue 3 项目展示系统',
      description:
        '一个基于 Vue 3 + TypeScript + Supabase 的现代化个人主页展示系统，包含完整的前端展示和后台管理功能。',
      technologies: ['Vue 3', 'TypeScript', 'Supabase', 'Element Plus', 'Vite'],
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      images: [
        { id: 1, url: 'https://via.placeholder.com/600x400/4CAF50/FFFFFF?text=项目截图1' },
        { id: 2, url: 'https://via.placeholder.com/600x400/2196F3/FFFFFF?text=项目截图2' },
        { id: 3, url: 'https://via.placeholder.com/600x400/FF9800/FFFFFF?text=项目截图3' },
      ],
      files: [
        { id: 1, name: '项目文档.pdf', size: 1024 * 1024 * 2, url: '#' },
        { id: 2, name: '源代码.zip', size: 1024 * 1024 * 10, url: '#' },
      ],
      links: [
        { id: 1, title: '在线演示', url: 'https://example.com' },
        { id: 2, title: 'GitHub 仓库', url: 'https://github.com/example' },
        { id: 3, title: 'API 文档', url: 'https://docs.example.com' },
      ],
    }
  } catch (error) {
    console.error('获取项目详情失败:', error)
    ElMessage.error('获取项目详情失败')
  } finally {
    loading.value = false
  }
}

// 状态相关方法
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    completed: 'info',
    archived: 'warning',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    archived: '已归档',
  }
  return statusMap[status] || '未知'
}

// 格式化方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatFileSize = (size: number) => {
  if (size === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(size) / Math.log(1024))
  const formattedSize = size / Math.pow(1024, index)
  return `${formattedSize.toFixed(2)} ${units[index]}`
}

// 操作方法
const editProject = () => {
  router.push(`/admin/projects/${project.value?.id}/edit`)
}

const previewImage = (image: any) => {
  previewImageUrl.value = image.url
  imagePreviewVisible.value = true
}

const downloadFile = (file: any) => {
  // 模拟文件下载
  ElMessage.success(`开始下载 ${file.name}`)
  // 实际项目中应该调用下载API
  window.open(file.url, '_blank')
}

const deleteFile = async (file: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 "${file.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    ElMessage.success('文件删除成功')
    // 实际项目中应该调用删除API并更新数据
  } catch {
    // 用户取消删除
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProject()
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
.project-images,
.project-files,
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
  color: var(--text-primary);
  font-size: 16px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  margin: 0;
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
}
</style>
