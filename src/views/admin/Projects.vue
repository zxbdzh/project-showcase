<template>
  <div class="admin-projects">
    <!-- 页面头部 -->
    <header class="admin-projects__header">
      <div class="admin-projects__header-content">
        <h1 class="admin-projects__title">
          <glitch-text text="PROJECT MANAGEMENT" />
        </h1>
        <p class="admin-projects__subtitle">管理所有项目内容</p>
      </div>
      <div class="admin-projects__actions">
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>
    </header>

    <!-- 搜索和筛选 -->
    <section class="admin-projects__filters">
      <div class="admin-projects__filters-content">
        <div class="admin-projects__search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索项目标题或描述..."
            size="large"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="admin-projects__filter-controls">
          <el-select v-model="statusFilter" placeholder="项目状态" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="暂停" value="paused" />
          </el-select>

          <el-select
            v-model="featuredFilter"
            placeholder="精选状态"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option label="精选" value="true" />
            <el-option label="普通" value="false" />
          </el-select>
        </div>
      </div>
    </section>

    <!-- 项目列表 -->
    <section class="admin-projects__list">
      <div class="admin-projects__list-content">
        <el-table
          :data="filteredProjects"
          v-loading="loading"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />

          <el-table-column label="项目" min-width="300">
            <template #default="{ row }">
              <div class="project-info">
                <div class="project-info__image" v-if="row.cover_image">
                  <img :src="row.cover_image" :alt="row.title" />
                </div>
                <div class="project-info__content">
                  <h3 class="project-info__title">{{ row.title }}</h3>
                  <p class="project-info__description">{{ row.description }}</p>
                  <div class="project-info__tags" v-if="row.tags && row.tags.length">
                    <el-tag
                      v-for="tag in row.tags.slice(0, 3)"
                      :key="tag.id"
                      size="small"
                      :color="tag.color"
                    >
                      {{ tag.name }}
                    </el-tag>
                    <span v-if="row.tags.length > 3" class="project-info__more">
                      +{{ row.tags.length - 3 }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="精选" width="80">
            <template #default="{ row }">
              <el-switch v-model="row.featured" @change="handleFeaturedChange(row)" />
            </template>
          </el-table-column>

          <el-table-column label="排序" width="100">
            <template #default="{ row }">
              <el-input-number
                v-model="row.sort_order"
                :min="0"
                :max="999"
                size="small"
                @change="handleSortOrderChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" @click="viewProject(row)">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button size="small" type="primary" @click="editProject(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" type="danger" @click="deleteProject(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="admin-projects__pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </section>

    <!-- 批量操作 -->
    <div class="admin-projects__batch" v-if="selectedProjects.length > 0">
      <div class="admin-projects__batch-content">
        <span>已选择 {{ selectedProjects.length }} 个项目</span>
        <div class="admin-projects__batch-actions">
          <el-button @click="batchDelete">批量删除</el-button>
          <el-button type="primary" @click="batchSetFeatured(true)">设为精选</el-button>
          <el-button type="warning" @click="batchSetFeatured(false)">取消精选</el-button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingProject ? '编辑项目' : '新建项目'"
      width="80%"
      :before-close="handleDialogClose"
    >
      <project-form
        :project="editingProject"
        @submit="handleProjectSubmit"
        @cancel="handleDialogClose"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, View, Edit, Delete, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useProjects } from '@/composables/useData'
import { projectService } from '@/services/database'
import type { Project } from '@/utils/supabase'
import GlitchText from '@/components/GlitchText.vue'
import ProjectForm from '@/components/ProjectForm.vue'

const router = useRouter()
const {
  projects,
  loading,
  loadProjects,
  createProject,
  updateProject,
  deleteProject: deleteProjectData,
} = useProjects()

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const featuredFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedProjects = ref([])
const showCreateDialog = ref(false)
const editingProject = ref(null)

// 计算属性
const filteredProjects = computed(() => {
  let result = projects.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query),
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    result = result.filter((project) => project.status === statusFilter.value)
  }

  // 精选过滤
  if (featuredFilter.value !== '') {
    const isFeatured = featuredFilter.value === 'true'
    result = result.filter((project) => project.featured === isFeatured)
  }

  return result
})

const total = computed(() => filteredProjects.value.length)

// 方法
const goBack = () => {
  router.back()
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedProjects.value = selection
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'completed':
      return 'info'
    case 'paused':
      return 'warning'
    default:
      return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '进行中'
    case 'completed':
      return '已完成'
    case 'paused':
      return '暂停'
    default:
      return '未知'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const viewProject = (project) => {
  router.push(`/project/${project.id}`)
}

const editProject = (project) => {
  editingProject.value = { ...project }
  showCreateDialog.value = true
}

const deleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await deleteProjectData(project.id)
    ElMessage.success('项目删除成功')
    await loadProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除项目失败')
    }
  }
}

const handleFeaturedChange = async (project) => {
  try {
    await updateProject(project.id, { featured: project.featured })
    ElMessage.success(project.featured ? '设为精选成功' : '取消精选成功')
  } catch (error) {
    ElMessage.error('操作失败')
    // 恢复原状态
    project.featured = !project.featured
  }
}

const handleSortOrderChange = async (project) => {
  try {
    await updateProject(project.id, { sort_order: project.sort_order })
    ElMessage.success('排序更新成功')
  } catch (error) {
    ElMessage.error('更新排序失败')
  }
}

const handleDialogClose = () => {
  showCreateDialog.value = false
  editingProject.value = null
}

const handleProjectSubmit = async (data) => {
  try {
    const { project, categories, tags } = data

    if (editingProject.value) {
      // 更新项目基本信息
      await updateProject(editingProject.value.id, project)

      // 更新分类和标签关联
      if (categories !== undefined) {
        await projectService.updateProjectCategories(editingProject.value.id, categories)
      }
      if (tags !== undefined) {
        await projectService.updateProjectTags(editingProject.value.id, tags)
      }

      ElMessage.success('项目更新成功')
    } else {
      // 创建项目
      const newProject = await createProject(project)

      // 创建分类和标签关联
      if (categories && categories.length > 0) {
        await projectService.updateProjectCategories(newProject.id, categories)
      }
      if (tags && tags.length > 0) {
        await projectService.updateProjectTags(newProject.id, tags)
      }

      ElMessage.success('项目创建成功')
    }

    handleDialogClose()
    await loadProjects()
  } catch (error) {
    console.error('项目提交错误:', error)
    ElMessage.error(editingProject.value ? '更新项目失败' : '创建项目失败')
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProjects.value.length} 个项目吗？此操作不可恢复。`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const deletePromises = selectedProjects.value.map((project) => deleteProjectData(project.id))
    await Promise.all(deletePromises)

    ElMessage.success('批量删除成功')
    selectedProjects.value = []
    await loadProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const batchSetFeatured = async (featured: boolean) => {
  try {
    const updatePromises = selectedProjects.value.map((project) =>
      updateProject(project.id, { featured }),
    )
    await Promise.all(updatePromises)

    ElMessage.success(featured ? '批量设为精选成功' : '批量取消精选成功')
    selectedProjects.value = []
    await loadProjects()
  } catch (error) {
    ElMessage.error('批量操作失败')
  }
}

// 生命周期
onMounted(async () => {
  await loadProjects()
})
</script>

<style scoped>
.admin-projects {
  min-height: 100vh;
  background: var(--bg-primary);
}

.admin-projects__header {
  padding: 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-projects__header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-projects__title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.admin-projects__subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.admin-projects__filters {
  padding: 2rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-projects__filters-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.admin-projects__search {
  flex: 1;
  min-width: 300px;
}

.admin-projects__filter-controls {
  display: flex;
  gap: 1rem;
}

.admin-projects__list {
  padding: 2rem;
  background: var(--bg-primary);
}

.admin-projects__list-content {
  max-width: 1200px;
  margin: 0 auto;
}

.project-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.project-info__image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.project-info__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-info__content {
  flex: 1;
  min-width: 0;
}

.project-info__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-info__description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-info__tags {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.project-info__more {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.admin-projects__pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.admin-projects__batch {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1rem 2rem;
  box-shadow: 0 8px 24px var(--shadow-color);
  z-index: 1000;
}

.admin-projects__batch-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-projects__batch-actions {
  display: flex;
  gap: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-projects__header {
    padding: 1.5rem 1rem;
  }

  .admin-projects__header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-projects__title {
    font-size: 1.5rem;
  }

  .admin-projects__filters {
    padding: 1.5rem 1rem;
  }

  .admin-projects__filters-content {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-projects__search {
    min-width: auto;
  }

  .admin-projects__filter-controls {
    flex-direction: column;
  }

  .admin-projects__list {
    padding: 1.5rem 1rem;
  }

  .project-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .project-info__image {
    width: 100%;
    height: 120px;
  }

  .admin-projects__batch {
    left: 1rem;
    right: 1rem;
    transform: none;
    bottom: 1rem;
  }

  .admin-projects__batch-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .admin-projects__batch-actions {
    justify-content: center;
  }
}
</style>
