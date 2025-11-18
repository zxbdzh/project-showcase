<template>
  <div class="admin-tags">
    <!-- 页面头部 -->
    <header class="admin-tags__header">
      <div class="admin-tags__header-content">
        <h1 class="admin-tags__title">
          <glitch-text text="TAG MANAGEMENT" />
        </h1>
        <p class="admin-tags__subtitle">管理项目标签</p>
      </div>
      <div class="admin-tags__actions">
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建标签
        </el-button>
      </div>
    </header>

    <!-- 搜索和筛选 -->
    <section class="admin-tags__filters">
      <div class="admin-tags__filters-content">
        <div class="admin-tags__search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索标签名称..."
            size="large"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="admin-tags__filter-controls">
          <el-select v-model="colorFilter" placeholder="颜色筛选" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="蓝色" value="#409EFF" />
            <el-option label="绿色" value="#67C23A" />
            <el-option label="橙色" value="#E6A23C" />
            <el-option label="红色" value="#F56C6C" />
            <el-option label="紫色" value="#909399" />
          </el-select>
        </div>
      </div>
    </section>

    <!-- 标签列表 -->
    <section class="admin-tags__list">
      <div class="admin-tags__list-content">
        <el-row :gutter="16">
          <el-col
            v-for="tag in filteredTags"
            :key="tag.id"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="4"
            :xl="3"
          >
            <el-card class="tag-card" shadow="hover">
              <div class="tag-card__content">
                <div class="tag-card__header">
                  <el-tag :color="tag.color" size="large" class="tag-card__tag">
                    {{ tag.name }}
                  </el-tag>
                  <div class="tag-card__actions">
                    <el-dropdown @command="handleTagAction">
                      <el-button text size="small">
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item :command="{ action: 'edit', tag }">
                            <el-icon><Edit /></el-icon>
                            编辑
                          </el-dropdown-item>
                          <el-dropdown-item :command="{ action: 'delete', tag }" divided>
                            <el-icon><Delete /></el-icon>
                            删除
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>

                <div class="tag-card__stats">
                  <div class="stat-item">
                    <span class="stat-label">使用次数</span>
                    <span class="stat-value">{{ tag.project_count || 0 }}</span>
                  </div>
                </div>

                <div class="tag-card__footer">
                  <el-color-picker
                    v-model="tag.color"
                    size="small"
                    @change="handleColorChange(tag)"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 空状态 -->
        <el-empty v-if="filteredTags.length === 0 && !loading" description="暂无标签数据">
          <el-button type="primary" @click="showCreateDialog = true"> 创建第一个标签 </el-button>
        </el-empty>
      </div>
    </section>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingTag ? '编辑标签' : '新建标签'"
      width="400px"
      :before-close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入标签名称" />
        </el-form-item>

        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="formData.color" />
        </el-form-item>

        <el-form-item label="预览">
          <el-tag :color="formData.color" size="large">
            {{ formData.name || '标签预览' }}
          </el-tag>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingTag ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Search, Edit, Delete, MoreFilled, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import GlitchText from '@/components/GlitchText.vue'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const colorFilter = ref('')
const loading = ref(false)
const showCreateDialog = ref(false)
const editingTag = ref(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 模拟标签数据
const tags = ref([
  {
    id: 1,
    name: 'Vue.js',
    color: '#409EFF',
    project_count: 5,
  },
  {
    id: 2,
    name: 'React',
    color: '#67C23A',
    project_count: 3,
  },
  {
    id: 3,
    name: 'Node.js',
    color: '#E6A23C',
    project_count: 4,
  },
  {
    id: 4,
    name: 'TypeScript',
    color: '#F56C6C',
    project_count: 6,
  },
  {
    id: 5,
    name: 'Docker',
    color: '#909399',
    project_count: 2,
  },
  {
    id: 6,
    name: 'MongoDB',
    color: '#409EFF',
    project_count: 3,
  },
  {
    id: 7,
    name: 'Python',
    color: '#67C23A',
    project_count: 4,
  },
  {
    id: 8,
    name: 'Redis',
    color: '#E6A23C',
    project_count: 2,
  },
])

// 表单数据
const formData = reactive({
  name: '',
  color: '#409EFF',
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 20, message: '名称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  color: [{ required: true, message: '请选择标签颜色', trigger: 'change' }],
}

// 计算属性
const filteredTags = computed(() => {
  let result = tags.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((tag) => tag.name.toLowerCase().includes(query))
  }

  // 颜色过滤
  if (colorFilter.value) {
    result = result.filter((tag) => tag.color === colorFilter.value)
  }

  return result
})

// 方法
const goBack = () => {
  router.back()
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleTagAction = async ({ action, tag }) => {
  switch (action) {
    case 'edit':
      editTag(tag)
      break
    case 'delete':
      await deleteTag(tag)
      break
  }
}

const editTag = (tag) => {
  editingTag.value = tag
  Object.assign(formData, {
    name: tag.name,
    color: tag.color,
  })
  showCreateDialog.value = true
}

const deleteTag = async (tag) => {
  try {
    await ElMessageBox.confirm(`确定要删除标签 "${tag.name}" 吗？此操作不可恢复。`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 这里应该调用API删除标签
    const index = tags.value.findIndex((t) => t.id === tag.id)
    if (index > -1) {
      tags.value.splice(index, 1)
    }

    ElMessage.success('标签删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除标签失败')
    }
  }
}

const handleColorChange = async (tag) => {
  try {
    // 这里应该调用API更新颜色
    ElMessage.success('颜色更新成功')
  } catch (error) {
    ElMessage.error('更新颜色失败')
  }
}

const handleDialogClose = () => {
  showCreateDialog.value = false
  editingTag.value = null
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    color: '#409EFF',
  })
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingTag.value) {
      // 更新标签
      const index = tags.value.findIndex((t) => t.id === editingTag.value.id)
      if (index > -1) {
        tags.value[index] = {
          ...tags.value[index],
          ...formData,
        }
      }
      ElMessage.success('标签更新成功')
    } else {
      // 创建标签
      const newTag = {
        id: Date.now(),
        ...formData,
        project_count: 0,
      }
      tags.value.push(newTag)
      ElMessage.success('标签创建成功')
    }

    handleDialogClose()
  } catch (error) {
    ElMessage.error(editingTag.value ? '更新标签失败' : '创建标签失败')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  // 这里可以加载标签数据
})
</script>

<style scoped>
.admin-tags {
  min-height: 100vh;
  background: var(--bg-primary);
}

.admin-tags__header {
  padding: 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-tags__header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-tags__title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.admin-tags__subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.admin-tags__filters {
  padding: 2rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-tags__filters-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.admin-tags__search {
  flex: 1;
  min-width: 300px;
}

.admin-tags__filter-controls {
  display: flex;
  gap: 1rem;
}

.admin-tags__list {
  padding: 2rem;
  background: var(--bg-primary);
}

.admin-tags__list-content {
  max-width: 1200px;
  margin: 0 auto;
}

.tag-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tag-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--shadow-color);
}

.tag-card__content {
  padding: 1rem;
}

.tag-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tag-card__tag {
  font-weight: 600;
  font-size: 14px;
}

.tag-card__actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tag-card:hover .tag-card__actions {
  opacity: 1;
}

.tag-card__stats {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-top: 1px solid var(--border-primary);
  border-bottom: 1px solid var(--border-primary);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tag-card__footer {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-tags__header {
    padding: 1.5rem 1rem;
  }

  .admin-tags__header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-tags__title {
    font-size: 1.5rem;
  }

  .admin-tags__filters {
    padding: 1.5rem 1rem;
  }

  .admin-tags__filters-content {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-tags__search {
    min-width: auto;
  }

  .admin-tags__filter-controls {
    flex-direction: column;
  }

  .admin-tags__list {
    padding: 1.5rem 1rem;
  }

  .tag-card__header {
    margin-bottom: 0.75rem;
  }

  .tag-card__tag {
    font-size: 12px;
  }
}
</style>
