<template>
  <div class="project-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="top"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="项目标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入项目标题" size="large" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="项目描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入项目描述"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择项目状态">
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="是否精选" prop="featured">
            <el-switch v-model="formData.featured" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="排序" prop="sort_order">
            <el-input-number
              v-model="formData.sort_order"
              :min="0"
              :max="999"
              placeholder="排序值"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="演示链接" prop="demo_url">
            <el-input v-model="formData.demo_url" placeholder="https://example.com" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="GitHub链接" prop="github_url">
            <el-input
              v-model="formData.github_url"
              placeholder="https://github.com/username/repo"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="封面图片" prop="cover_image">
            <file-upload
              v-model="formData.cover_image"
              :multiple="false"
              :limit="1"
              accept=".png,.jpg,.jpeg"
              :drag="false"
              :show-file-list="true"
              bucket="project-showcase"
              folder="covers"
              @success="handleCoverUploadSuccess"
              @error="handleCoverUploadError"
              @remove="handleCoverRemove"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="项目内容" prop="content">
            <el-input
              v-model="formData.content"
              type="textarea"
              :rows="8"
              placeholder="请输入详细的项目介绍，支持Markdown格式"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目分类" prop="category">
            <el-select v-model="formData.category" placeholder="请选择项目分类" style="width: 100%">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目标签" prop="tags">
            <el-select
              v-model="formData.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入项目标签"
              style="width: 100%"
            >
              <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24" class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import { useAuth } from '@/composables/useAuth'
import { useCategories, useTags } from '@/composables/useData'

interface ProjectData {
  id: string
  title: string
  description?: string
  content?: string
  demo_url?: string
  github_url?: string
  cover_image?: string
  featured: boolean
  status: 'draft' | 'published' | 'archived'
  sort_order: number
  categories?: { id: string; name: string }[]
  tags?: { id: string; name: string }[]
}

interface Props {
  project?: ProjectData
}

interface Emits {
  (
    e: 'submit',
    data: {
      project: Record<string, unknown>
      category: string
      tags: string[]
    },
  ): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const { user } = useAuth()

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  content: '',
  demo_url: '',
  github_url: '',
  cover_image: '',
  featured: false,
  status: 'draft' as 'draft' | 'published' | 'archived',
  sort_order: 0,
  category: '',
  tags: [] as string[],
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入项目标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 5, max: 500, message: '描述长度在 5 到 500 个字符', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入项目内容', trigger: 'blur' },
    { min: 5, message: '内容至少需要 5 个字符', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
}

// 计算属性
const isEdit = computed(() => !!props.project)

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    title: '',
    description: '',
    content: '',
    demo_url: '',
    github_url: '',
    cover_image: '',
    featured: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
    sort_order: 0,
    category: '',
    tags: [] as string[],
  })
  formRef.value?.clearValidate()
}

// 从API获取真实数据
const { categories, loadCategories } = useCategories()
const { tags, loadTags } = useTags()

// 监听props变化，初始化表单数据
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      Object.assign(formData, {
        title: newProject.title || '',
        description: newProject.description || '',
        content: newProject.content || '',
        demo_url: newProject.demo_url || '',
        github_url: newProject.github_url || '',
        cover_image: newProject.cover_image || '',
        featured: newProject.featured || false,
        status: newProject.status || 'draft',
        sort_order: newProject.sort_order || 0,
        category: newProject.categories?.[0]?.id || '',
        tags: newProject.tags?.map((t: { id: string }) => t.id) || [],
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 准备提交数据
    const { category, tags, ...projectData } = formData

    const submitData = {
      ...projectData,
      // 如果是编辑模式，包含ID
      ...(isEdit.value && { id: props.project?.id }),
      // 创建项目时需要user_id
      ...(!isEdit.value && user.value && { user_id: user.value.id }),
    }

    // 发送项目数据和关联数据
    emit('submit', {
      project: submitData,
      category,
      tags,
    })
  } catch {
    ElMessage.error('请检查表单输入')
  } finally {
    submitting.value = false
  }
}

// 处理封面图片上传成功
const handleCoverUploadSuccess = () => {
  // v-model会自动更新formData.cover_image
}

// 处理封面图片上传失败
const handleCoverUploadError = () => {
  ElMessage.error('封面图片上传失败')
}

// 处理封面图片删除
const handleCoverRemove = () => {
  // v-model会自动更新formData.cover_image为空字符串
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
}

// 组件挂载时初始化
onMounted(async () => {
  // 加载分类和标签数据
  try {
    await Promise.all([loadCategories(), loadTags()])
  } catch (error) {
    console.error('Failed to load categories and tags:', error)
  }
})
</script>

<style scoped>
.project-form {
  padding: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
  margin-top: 2rem;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-form {
    padding: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-actions .el-button {
    width: 100%;
  }
}
</style>
