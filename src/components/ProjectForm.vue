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
              <el-option label="进行中" value="active" />
              <el-option label="已完成" value="completed" />
              <el-option label="暂停" value="paused" />
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
        <el-col :span="12">
          <el-form-item label="演示链接" prop="demo_url">
            <el-input v-model="formData.demo_url" placeholder="https://example.com" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
              :limit="1"
              accept="image/*"
              list-type="picture-card"
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
          <el-form-item label="项目分类" prop="categories">
            <el-select
              v-model="formData.categories"
              multiple
              placeholder="请选择项目分类"
              style="width: 100%"
            >
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

interface Props {
  project?: any
}

interface Emits {
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  content: '',
  demo_url: '',
  github_url: '',
  cover_image: '',
  featured: false,
  status: 'active',
  sort_order: 0,
  categories: [],
  tags: [],
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入项目标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入项目内容', trigger: 'blur' },
    { min: 20, message: '内容至少需要 20 个字符', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
}

// 计算属性
const isEdit = computed(() => !!props.project)

// 模拟数据（实际应该从API获取）
const categories = ref([
  { id: 1, name: 'Web开发' },
  { id: 2, name: '移动应用' },
  { id: 3, name: '后端开发' },
  { id: 4, name: '人工智能' },
  { id: 5, name: '数据科学' },
])

const tags = ref([
  { id: 1, name: 'Vue.js' },
  { id: 2, name: 'React' },
  { id: 3, name: 'Node.js' },
  { id: 4, name: 'Python' },
  { id: 5, name: 'Docker' },
  { id: 6, name: 'MongoDB' },
])

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
        status: newProject.status || 'active',
        sort_order: newProject.sort_order || 0,
        categories: newProject.categories?.map((c: any) => c.id) || [],
        tags: newProject.tags?.map((t: any) => t.id) || [],
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

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
    status: 'active',
    sort_order: 0,
    categories: [],
    tags: [],
  })
  formRef.value?.clearValidate()
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 准备提交数据
    const submitData = {
      ...formData,
      // 如果是编辑模式，包含ID
      ...(isEdit.value && { id: props.project.id }),
    }

    emit('submit', submitData)
  } catch (error) {
    ElMessage.error('请检查表单输入')
  } finally {
    submitting.value = false
  }
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
}

// 组件挂载时初始化
onMounted(() => {
  // 这里可以加载分类和标签数据
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
