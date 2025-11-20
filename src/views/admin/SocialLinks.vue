<template>
  <div class="admin-social-links">
    <!-- 页面头部 -->
    <header class="admin-social-links__header">
      <div class="admin-social-links__header-content">
        <h1 class="admin-social-links__title">
          <glitch-text text="SOCIAL LINKS MANAGEMENT" />
        </h1>
        <p class="admin-social-links__subtitle">管理社交链接</p>
      </div>
      <div class="admin-social-links__actions">
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建链接
        </el-button>
      </div>
    </header>

    <!-- 搜索和筛选 -->
    <section class="admin-social-links__filters">
      <div class="admin-social-links__filters-content">
        <div class="admin-social-links__search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索链接名称或URL..."
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

    <!-- 社交链接列表 -->
    <section class="admin-social-links__list">
      <div class="admin-social-links__list-content">
        <el-row :gutter="20">
          <el-col v-for="link in filteredLinks" :key="link.id" :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="social-link-card" shadow="hover">
              <div class="social-link-card__content">
                <div class="social-link-card__header">
                  <div class="social-link-card__icon" :style="{ backgroundColor: '#409EFF' }">
                    <el-icon :size="24">
                      <component :is="getLinkIcon(link.icon || 'Link')" />
                    </el-icon>
                  </div>
                  <div class="social-link-card__actions">
                    <el-dropdown @command="handleLinkAction">
                      <el-button text>
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item :command="{ action: 'edit', link }">
                            <el-icon><Edit /></el-icon>
                            编辑
                          </el-dropdown-item>
                          <el-dropdown-item :command="{ action: 'delete', link }" divided>
                            <el-icon><Delete /></el-icon>
                            删除
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>

                <div class="social-link-card__body">
                  <h3 class="social-link-card__title">{{ link.platform }}</h3>
                  <p class="social-link-card__url">{{ link.url }}</p>

                  <div class="social-link-card__stats">
                    <div class="stat-item">
                      <span class="stat-label">排序</span>
                      <span class="stat-value">{{ link.sort_order }}</span>
                    </div>
                  </div>

                  <div class="social-link-card__footer">
                    <el-input-number
                      v-model="link.sort_order"
                      :min="0"
                      :max="999"
                      size="small"
                      @change="handleSortOrderChange(link)"
                    />
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 空状态 -->
        <el-empty v-if="filteredLinks.length === 0 && !loading" description="暂无社交链接数据">
          <el-button type="primary" @click="showCreateDialog = true">
            创建第一个社交链接
          </el-button>
        </el-empty>
      </div>
    </section>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingLink ? '编辑社交链接' : '新建社交链接'"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="链接名称" prop="platform">
          <el-input v-model="formData.platform" placeholder="请输入链接名称" />
        </el-form-item>

        <el-form-item label="链接URL" prop="url">
          <el-input v-model="formData.url" placeholder="https://example.com" />
        </el-form-item>

        <el-form-item label="链接图标" prop="icon_url">
          <IconSelector v-model="formData.icon_url" label="链接图标" />
        </el-form-item>

        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="formData.sort_order" :min="0" :max="999" placeholder="排序值" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingLink ? '更新' : '创建' }}
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
  Link,
  Message,
  Phone,
  Location,
  User,
  Star,
  Document,
  ArrowLeft,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import GlitchText from '@/components/GlitchText.vue'
import IconSelector from '@/components/IconSelector.vue'
import { useSocialLinks } from '@/composables/useData'

const router = useRouter()
const {
  socialLinks,
  loading,
  loadSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} = useSocialLinks()

// 响应式数据
const searchQuery = ref('')
const showCreateDialog = ref(false)
const editingLink = ref<any>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  platform: '',
  url: '',
  icon_url: '',
  sort_order: 0,
})

// 表单验证规则
const formRules: FormRules = {
  platform: [
    { required: true, message: '请输入链接名称', trigger: 'blur' },
    { min: 2, max: 30, message: '名称长度在 2 到 30 个字符', trigger: 'blur' },
  ],
  url: [
    { required: true, message: '请输入链接URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
  ],
  icon_url: [{ required: true, message: '请选择链接图标', trigger: 'change' }],
}

// 图标选项
const iconOptions = [
  { label: '链接', value: 'Link', component: markRaw(Link) },
  { label: '消息', value: 'Message', component: markRaw(Message) },
  { label: '电话', value: 'Phone', component: markRaw(Phone) },
  { label: '位置', value: 'Location', component: markRaw(Location) },
  { label: '用户', value: 'User', component: markRaw(User) },
  { label: '星星', value: 'Star', component: markRaw(Star) },
  { label: '文档', value: 'Document', component: markRaw(Document) },
]

// 计算属性
const filteredLinks = computed(() => {
  if (!searchQuery.value) return socialLinks.value

  const query = searchQuery.value.toLowerCase()
  return socialLinks.value.filter(
    (link) => link.platform.toLowerCase().includes(query) || link.url.toLowerCase().includes(query),
  )
})

// 方法
const goBack = () => {
  router.back()
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const getLinkIcon = (iconName: string) => {
  const icon = iconOptions.find((option) => option.value === iconName)
  return icon ? icon.component : markRaw(Link)
}

const handleLinkAction = async ({ action, link }: { action: string; link: any }) => {
  switch (action) {
    case 'edit':
      editLink(link)
      break
    case 'delete':
      await deleteLink(link)
      break
  }
}

const editLink = (link: any) => {
  editingLink.value = link
  Object.assign(formData, {
    platform: link.platform,
    url: link.url,
    icon_url: link.icon_url || link.icon,
    sort_order: link.sort_order,
  })
  showCreateDialog.value = true
}

const deleteLink = async (link: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除社交链接 "${link.platform}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await deleteSocialLink(link.id)
    ElMessage.success('社交链接删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除社交链接失败')
    }
  }
}

const handleSortOrderChange = async (link: any) => {
  try {
    await updateSocialLink(link.id, { sort_order: link.sort_order })
    ElMessage.success('排序更新成功')
  } catch (error: any) {
    ElMessage.error('更新排序失败')
  }
}

const handleDialogClose = () => {
  showCreateDialog.value = false
  editingLink.value = null
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    platform: '',
    url: '',
    icon_url: '',
    sort_order: 0,
  })
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingLink.value) {
      // 更新链接
      await updateSocialLink(editingLink.value.id, formData)
      ElMessage.success('社交链接更新成功')
    } else {
      // 创建链接
      await createSocialLink(formData)
      ElMessage.success('社交链接创建成功')
    }

    handleDialogClose()
  } catch {
    ElMessage.error(editingLink.value ? '更新社交链接失败' : '创建社交链接失败')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  loadSocialLinks()
})
</script>

<style scoped>
.admin-social-links {
  min-height: 100vh;
  background: var(--bg-primary);
}

.admin-social-links__header {
  padding: 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-social-links__header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-social-links__title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.admin-social-links__subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.admin-social-links__filters {
  padding: 2rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-social-links__filters-content {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-social-links__search {
  max-width: 400px;
}

.admin-social-links__list {
  padding: 2rem;
  background: var(--bg-primary);
}

.admin-social-links__list-content {
  max-width: 1200px;
  margin: 0 auto;
}

.social-link-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.social-link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.social-link-card__content {
  padding: 1.5rem;
}

.social-link-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.social-link-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.social-link-card__actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.social-link-card:hover .social-link-card__actions {
  opacity: 1;
}

.social-link-card__body {
  flex: 1;
}

.social-link-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.social-link-card__url {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.social-link-card__stats {
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

.social-link-card__footer {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-social-links__header {
    padding: 1.5rem 1rem;
  }

  .admin-social-links__header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-social-links__title {
    font-size: 1.5rem;
  }

  .admin-social-links__filters {
    padding: 1.5rem 1rem;
  }

  .admin-social-links__search {
    max-width: none;
  }

  .admin-social-links__list {
    padding: 1.5rem 1rem;
  }

  .social-link-card__content {
    padding: 1rem;
  }

  .social-link-card__header {
    margin-bottom: 0.75rem;
  }

  .social-link-card__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .social-link-card__title {
    font-size: 1rem;
  }

  .social-link-card__url {
    font-size: 0.85rem;
  }
}
</style>
