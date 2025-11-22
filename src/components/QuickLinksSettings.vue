<template>
  <div class="quick-links-settings">
    <el-form :model="settings" label-width="120px" label-position="top">
      <!-- 启用快捷跳转 -->
      <el-form-item>
        <template #label>
          <div class="setting-label">
            <el-icon><Link /></el-icon>
            <span>启用快捷跳转</span>
          </div>
        </template>
        <el-switch v-model="settings.enabled" />
      </el-form-item>

      <!-- 快捷跳转列表 -->
      <el-form-item v-if="settings.enabled">
        <template #label>
          <div class="setting-label">
            <el-icon><Operation /></el-icon>
            <span>快捷跳转链接</span>
          </div>
        </template>

        <div class="links-list">
          <div v-if="quickLinks.length === 0" class="empty-state">
            <el-empty description="暂无快捷跳转链接">
              <el-button type="primary" @click="addQuickLink">添加链接</el-button>
            </el-empty>
          </div>

          <div v-else class="links-grid">
            <div
              v-for="(link, index) in quickLinks"
              :key="link.order"
              class="link-card"
            >
              <div class="link-card__header">
                <div class="link-card__title">{{ link.title }}</div>
                <div class="link-card__actions">
                  <el-button size="small" text @click="editLink(index)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button size="small" text type="danger" @click="deleteLink(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>

              <div class="link-card__content">
                <div class="link-preview">
                  <component
                    :is="'font-awesome-icon'"
                    :icon="link.icon"
                    size="small"
                    class="link-icon"
                  />
                  <span class="link-url">{{ getDisplayUrl(link.url) }}</span>
                </div>

                <div class="link-info">
                  <el-tag :type="link.type === 'external' ? 'primary' : 'success'" size="small">
                    {{ link.type === 'external' ? '外部链接' : '内部页面' }}
                  </el-tag>
                  <el-switch v-model="link.enabled" size="small">
                    <template #active>显示</template>
                    <template #inactive>隐藏</template>
                  </el-switch>
                </div>
              </div>
            </div>
          </div>

          <div class="add-button-container">
            <el-button type="primary" @click="addQuickLink">
              <el-icon><Plus /></el-icon>
              添加快捷跳转
            </el-button>
          </div>
        </div>
      </el-form-item>

      <!-- 默认示例 -->
      <el-form-item v-if="settings.enabled">
        <template #label>
          <div class="setting-label">
            <el-icon><MagicStick /></el-icon>
            <span>快速添加示例</span>
          </div>
        </template>
        <div class="examples-grid">
          <el-button
            v-for="example in quickLinkExamples"
            :key="example.title"
            size="small"
            @click="addExample(example)"
          >
            <component
              :is="'font-awesome-icon'"
              :icon="example.icon"
              size="small"
              class="example-icon"
            />
            {{ example.title }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="isEditing ? '编辑快捷跳转' : '添加快捷跳转'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入链接标题" />
        </el-form-item>

        <el-form-item label="URL" prop="url">
          <el-input v-model="formData.url" placeholder="请输入链接地址" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio value="external">外部链接</el-radio>
            <el-radio value="internal">内部页面</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <icon-selector v-model="formData.icon" placeholder="选择图标" />
        </el-form-item>

        <el-form-item label="排序" prop="order">
          <el-input-number v-model="formData.order" :min="1" :max="99" />
        </el-form-item>

        <el-form-item label="启用" prop="enabled">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveLink" :loading="saving">
          {{ isEditing ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Link, Operation, Edit, Delete, Plus, MagicStick } from '@element-plus/icons-vue'
import IconSelector from '@/components/IconSelector.vue'
import { useSystemSettings } from '@/composables/useData'

interface QuickLink {
  title: string
  url: string
  icon: string
  type: 'internal' | 'external'
  order: number
  enabled: boolean
}

const { getSettingValue, batchUpdateSystemSettings } = useSystemSettings()

// 设置数据
const settings = ref({
  enabled: false,
})

// 快捷跳转链接
const quickLinks = ref<QuickLink[]>([])

// 表单数据
const showEditDialog = ref(false)
const isEditing = ref(false)
const editingIndex = ref(-1)
const saving = ref(false)

const formData = ref<QuickLink>({
  title: '',
  url: '',
  icon: '',
  type: 'external',
  order: 1,
  enabled: true,
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入链接标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度为1-50个字符', trigger: 'blur' },
  ],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
  ],
  icon: [
    { required: true, message: '请选择图标', trigger: 'blur' },
  ],
  order: [
    { required: true, message: '请输入排序', trigger: 'blur' },
    { type: 'number', min: 1, max: 99, message: '排序范围为1-99', trigger: 'blur' },
  ],
}

// 快捷链接示例
const quickLinkExamples = ref([
  {
    title: '个人博客',
    url: 'https://blog.example.com',
    icon: 'fas fa-blog',
    type: 'external',
    order: 1,
    enabled: true,
  },
  {
    title: 'GitHub',
    url: 'https://github.com/username',
    icon: 'fab fa-github',
    type: 'external',
    order: 2,
    enabled: true,
  },
  {
    title: '项目列表',
    url: '/projects',
    icon: 'fas fa-folder',
    type: 'internal',
    order: 3,
    enabled: true,
  },
  {
    title: '关于我',
    url: '/about',
    icon: 'fas fa-user',
    type: 'internal',
    order: 4,
    enabled: true,
  },
])

// 加载设置
const loadSettings = () => {
  settings.value.enabled = getSettingValue('header_quick_links_enabled', 'false') === 'true'

  try {
    const linksStr = getSettingValue('header_quick_links', '[]')
    quickLinks.value = JSON.parse(linksStr)
  } catch {
    quickLinks.value = []
  }
}

// 获取显示URL
const getDisplayUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url.replace(/^https?:\/\//, '')
  }
  return url
}

// 添加快捷链接
const addQuickLink = () => {
  isEditing.value = false
  editingIndex.value = -1
  formData.value = {
    title: '',
    url: '',
    icon: '',
    type: 'external',
    order: Math.max(...quickLinks.value.map(l => l.order), 0) + 1,
    enabled: true,
  }
  showEditDialog.value = true
}

// 编辑链接
const editLink = (index: number) => {
  isEditing.value = true
  editingIndex.value = index
  formData.value = { ...quickLinks.value[index] }
  showEditDialog.value = true
}

// 删除链接
const deleteLink = async (index: number) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除快捷跳转"${quickLinks.value[index].title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    quickLinks.value.splice(index, 1)
    await saveSettings()
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 添加示例
const addExample = (example: QuickLink) => {
  const newLink = {
    ...example,
    order: Math.max(...quickLinks.value.map(l => l.order), 0) + 1,
  }
  quickLinks.value.push(newLink)
  saveSettings()
}

// 保存链接
const saveLink = async () => {
  try {
    saving.value = true

    if (isEditing.value && editingIndex.value >= 0) {
      // 更新现有链接
      quickLinks.value[editingIndex.value] = { ...formData.value }
    } else {
      // 添加新链接
      quickLinks.value.push({ ...formData.value })
    }

    await saveSettings()
    showEditDialog.value = false
    resetForm()
    ElMessage.success(isEditing.value ? '更新成功' : '添加成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    title: '',
    url: '',
    icon: '',
    type: 'external',
    order: 1,
    enabled: true,
  }
  isEditing.value = false
  editingIndex.value = -1
}

// 保存设置
const saveSettings = async () => {
  try {
    const settingsData = {
      header_quick_links_enabled: { value: settings.value.enabled.toString(), description: '启用快捷跳转' },
      header_quick_links: { value: JSON.stringify(quickLinks.value), description: '快捷跳转链接配置' },
    }

    await batchUpdateSystemSettings(settingsData)
  } catch (error) {
    ElMessage.error('保存设置失败')
    throw error
  }
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.quick-links-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  border: 2px dashed var(--border-primary);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.link-card {
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-secondary);
  overflow: hidden;
}

.link-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.link-card__title {
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-card__actions {
  display: flex;
  gap: 0.25rem;
}

.link-card__content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 6px;
  border: 1px solid var(--border-primary);
}

.link-icon {
  color: var(--accent-primary);
}

.link-url {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.example-icon {
  margin-right: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }

  .examples-grid {
    grid-template-columns: 1fr;
  }

  .link-card__header {
    padding: 0.75rem;
  }

  .link-card__content {
    padding: 0.75rem;
  }
}

/* 深色主题适配 */
[data-theme='dark'] .link-card {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
}

[data-theme='dark'] .link-card__header {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

[data-theme='dark'] .link-preview {
  background: var(--bg-primary);
  border-color: var(--border-secondary);
}

[data-theme='dark'] .empty-state {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
}
</style>
