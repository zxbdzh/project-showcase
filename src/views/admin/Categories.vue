<template>
  <div class="admin-categories">
    <!-- 页面头部 -->
    <header class="admin-categories__header">
      <div class="admin-categories__header-content">
        <h1 class="admin-categories__title">
          <glitch-text text="CATEGORY MANAGEMENT" />
        </h1>
        <p class="admin-categories__subtitle">管理项目分类</p>
      </div>
      <div class="admin-categories__actions">
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建分类
        </el-button>
      </div>
    </header>

    <!-- 搜索和筛选 -->
    <section class="admin-categories__filters">
      <div class="admin-categories__filters-content">
        <div class="admin-categories__search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索分类名称或描述..."
            size="large"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </section>

    <!-- 分类列表 -->
    <section class="admin-categories__list">
      <div class="admin-categories__list-content">
        <el-row :gutter="20">
          <el-col
            v-for="category in filteredCategories"
            :key="category.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card class="category-card" shadow="hover">
              <div class="category-card__header">
                <div class="category-card__icon" :style="{ backgroundColor: category.color }">
                  <el-icon :size="24">
                    <component :is="getCategoryIcon(category.icon)" />
                  </el-icon>
                </div>
                <div class="category-card__actions">
                  <el-dropdown @command="handleCategoryAction">
                    <el-button text>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :command="{ action: 'edit', category }">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'delete', category }" divided>
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="category-card__content">
                <h3 class="category-card__title">{{ category.name }}</h3>
                <p class="category-card__description">{{ category.description }}</p>

                <div class="category-card__stats">
                  <div class="stat-item">
                    <span class="stat-label">项目数量</span>
                    <span class="stat-value">{{ category.project_count || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">排序</span>
                    <span class="stat-value">{{ category.sort_order }}</span>
                  </div>
                </div>

                <div class="category-card__footer">
                  <el-input-number
                    v-model="category.sort_order"
                    :min="0"
                    :max="999"
                    size="small"
                    @change="handleSortOrderChange(category)"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 空状态 -->
        <el-empty v-if="filteredCategories.length === 0 && !loading" description="暂无分类数据">
          <el-button type="primary" @click="showCreateDialog = true"> 创建第一个分类 </el-button>
        </el-empty>
      </div>
    </section>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingCategory ? '编辑分类' : '新建分类'"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>

        <el-form-item label="分类图标" prop="icon">
          <el-select v-model="formData.icon" placeholder="请选择图标">
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <div style="display: flex; align-items: center; gap: 8px">
                <el-icon><component :is="icon.component" /></el-icon>
                <span>{{ icon.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="分类颜色" prop="color">
          <el-color-picker v-model="formData.color" />
        </el-form-item>

        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="formData.sort_order" :min="0" :max="999" placeholder="排序值" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingCategory ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  Delete,
  MoreFilled,
  Folder,
  Document,
  Monitor,
  Phone,
  Setting,
  Star,
  Tools,
  DataBoard,
  TrendCharts,
  ArrowLeft,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import GlitchText from '@/components/GlitchText.vue'
import { useCategories } from '@/composables/useData'

const router = useRouter()
const { categories, loading, loadCategories, createCategory, updateCategory, deleteCategory } =
  useCategories()

// 响应式数据
const searchQuery = ref('')
const showCreateDialog = ref(false)
const editingCategory = ref<any>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  icon: '',
  color: '#409EFF',
  sort_order: 0,
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '名称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入分类描述', trigger: 'blur' },
    { min: 5, max: 100, message: '描述长度在 5 到 100 个字符', trigger: 'blur' },
  ],
  icon: [{ required: true, message: '请选择分类图标', trigger: 'change' }],
  color: [{ required: true, message: '请选择分类颜色', trigger: 'change' }],
}

// 图标选项
const iconOptions = [
  { label: '文件夹', value: 'Folder', component: markRaw(Folder) },
  { label: '文档', value: 'Document', component: markRaw(Document) },
  { label: '显示器', value: 'Monitor', component: markRaw(Monitor) },
  { label: '手机', value: 'Phone', component: markRaw(Phone) },
  { label: '设置', value: 'Setting', component: markRaw(Setting) },
  { label: '星星', value: 'Star', component: markRaw(Star) },
  { label: '工具', value: 'Tools', component: markRaw(Tools) },
  { label: '数据板', value: 'DataBoard', component: markRaw(DataBoard) },
  { label: '趋势图', value: 'TrendCharts', component: markRaw(TrendCharts) },
]

// 计算属性
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value

  const query = searchQuery.value.toLowerCase()
  return categories.value.filter(
    (category) =>
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query),
  )
})

// 方法
const goBack = () => {
  router.back()
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const getCategoryIcon = (iconName: string) => {
  const icon = iconOptions.find((option) => option.value === iconName)
  return icon ? icon.component : markRaw(Folder)
}

const handleCategoryAction = async ({ action, category }: { action: string; category: any }) => {
  switch (action) {
    case 'edit':
      editCategoryItem(category)
      break
    case 'delete':
      await deleteCategoryItem(category)
      break
  }
}

const editCategoryItem = (category: any) => {
  editingCategory.value = category
  Object.assign(formData, {
    name: category.name,
    description: category.description || '',
    icon: category.icon || '',
    color: category.color || '#409EFF',
    sort_order: category.sort_order || 0,
  })
  showCreateDialog.value = true
}

const deleteCategoryItem = async (category: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类 "${category.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await deleteCategory(category.id)
    ElMessage.success('分类删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除分类失败')
    }
  }
}

const handleSortOrderChange = async (category: any) => {
  try {
    await updateCategory(category.id, { sort_order: category.sort_order })
    ElMessage.success('排序更新成功')
  } catch (error: any) {
    ElMessage.error('更新排序失败')
  }
}

const handleDialogClose = () => {
  showCreateDialog.value = false
  editingCategory.value = null
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    description: '',
    icon: '',
    color: '#409EFF',
    sort_order: 0,
  })
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingCategory.value) {
      // 更新分类
      await updateCategory(editingCategory.value.id, formData)
      ElMessage.success('分类更新成功')
    } else {
      // 创建分类
      await createCategory(formData)
      ElMessage.success('分类创建成功')
    }

    handleDialogClose()
  } catch (error: any) {
    ElMessage.error(editingCategory.value ? '更新分类失败' : '创建分类失败')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.admin-categories {
  min-height: 100vh;
  background: var(--bg-primary);
}

.admin-categories__header {
  padding: 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-categories__header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-categories__title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.admin-categories__subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.admin-categories__filters {
  padding: 2rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-categories__filters-content {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-categories__search {
  max-width: 400px;
}

.admin-categories__list {
  padding: 2rem;
  background: var(--bg-primary);
}

.admin-categories__list-content {
  max-width: 1200px;
  margin: 0 auto;
}

.category-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.category-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.category-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.category-card__actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-card__actions {
  opacity: 1;
}

.category-card__content {
  flex: 1;
}

.category-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.category-card__description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-card__stats {
  display: flex;
  justify-content: space-between;
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

.category-card__footer {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-categories__header {
    padding: 1.5rem 1rem;
  }

  .admin-categories__header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-categories__title {
    font-size: 1.5rem;
  }

  .admin-categories__filters {
    padding: 1.5rem 1rem;
  }

  .admin-categories__search {
    max-width: none;
  }

  .admin-categories__list {
    padding: 1.5rem 1rem;
  }

  .category-card__header {
    margin-bottom: 0.75rem;
  }

  .category-card__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .category-card__title {
    font-size: 1rem;
  }

  .category-card__description {
    font-size: 0.85rem;
  }
}
</style>
