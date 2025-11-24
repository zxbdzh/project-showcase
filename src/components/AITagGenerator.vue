<template>
  <div class="ai-tag-generator">
    <el-button
      type="primary"
      :loading="loading"
      :disabled="!canGenerate"
      @click="generateTags"
      :icon="MagicStick"
      size="small"
    >
      {{ suggestions.length > 0 ? '重新生成' : 'AI 生成标签' }}
    </el-button>

    <!-- 继续生成按钮 -->
    <el-button
      v-if="suggestions.length > 0 && canGenerate"
      type="success"
      :loading="continueLoading"
      @click="continueGenerateTags"
      :icon="Plus"
      size="small"
    >
      继续生成
    </el-button>

    <!-- AI 生成的标签建议 -->
    <div v-if="suggestions.length > 0" class="suggestions-panel">
      <div class="panel-header">
        <h4>AI 标签建议</h4>
        <el-button size="small" text @click="closeSuggestions">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="suggestions-list">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.name"
          class="suggestion-item"
          :class="{ selected: selectedTags.includes(suggestion.name) }"
        >
          <div class="suggestion-content">
            <el-checkbox
              :model-value="selectedTags.includes(suggestion.name)"
              @change="toggleTag(suggestion.name)"
            >
              <span class="tag-name">{{ suggestion.name }}</span>
              <el-tag size="small" type="info" class="confidence-tag">
                {{ Math.round(suggestion.confidence * 100) }}%
              </el-tag>
            </el-checkbox>

            <!-- 标签状态指示 -->
            <div class="tag-status">
              <el-tag v-if="existingTagNames.includes(suggestion.name)" size="small" type="success">
                已存在
              </el-tag>
              <el-tag v-else size="small" type="warning"> 新建 </el-tag>
            </div>
          </div>
          <div class="suggestion-reason" v-if="suggestion.reason">
            <small>{{ suggestion.reason }}</small>
          </div>
        </div>
      </div>

      <div class="suggestions-actions">
        <el-button size="small" @click="selectAll">全选</el-button>
        <el-button size="small" @click="clearSelection">清空</el-button>
        <el-button
          type="primary"
          size="small"
          :loading="applying"
          @click="applySelectedTags"
          :disabled="selectedTags.length === 0"
        >
          应用标签 ({{ selectedTags.length }})
        </el-button>
      </div>
    </div>

    <!-- 新建标签确认对话框 -->
    <el-dialog
      v-model="showConfirmDialog"
      title="确认新建标签"
      width="400px"
      :before-close="handleCloseConfirmDialog"
    >
      <div class="confirm-content">
        <p>以下标签为新标签，是否确认创建？</p>
        <div class="new-tags-list">
          <el-tag v-for="tag in newTagsToCreate" :key="tag" class="new-tag-item">
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <el-button @click="handleCloseConfirmDialog">取消</el-button>
        <el-button type="primary" @click="confirmCreateTags" :loading="creating">
          确认创建 ({{ newTagsToCreate.length }})
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Close, Plus } from '@element-plus/icons-vue'
import type { Tag } from '@/utils/supabase'
import { glmApiService, type GLMTagSuggestion } from '@/utils/glmApi'

interface ProjectContent {
  title: string
  description: string
  content?: string
}

interface Props {
  existingTags: Tag[]
  projectContent: ProjectContent
}

interface Emits {
  (e: 'tags-generated', tagIds: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const continueLoading = ref(false)
const applying = ref(false)
const creating = ref(false)
const suggestions = ref<GLMTagSuggestion[]>([])
const selectedTags = ref<string[]>([])
const showConfirmDialog = ref(false)
const newTagsToCreate = ref<string[]>([])

// 计算属性
const existingTagNames = computed(() => props.existingTags.map((tag) => tag.name))

const canGenerate = computed(() => {
  return (
    props.projectContent.title.trim() &&
    props.projectContent.description.trim() &&
    glmApiService.isConfigured()
  )
})

// 方法
const generateTags = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请填写项目标题和描述后再生成标签')
    return
  }

  loading.value = true
  try {
    const result = await glmApiService.generateTags(props.projectContent)
    suggestions.value = result
    selectedTags.value = []
    ElMessage.success('AI 标签生成完成')
  } catch (error) {
    console.error('AI 标签生成失败:', error)
    ElMessage.error(error instanceof Error ? error.message : 'AI 标签生成失败')
  } finally {
    loading.value = false
  }
}

const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagName)
  }
}

const selectAll = () => {
  selectedTags.value = suggestions.value.map((s) => s.name)
}

const clearSelection = () => {
  selectedTags.value = []
}

const applySelectedTags = async () => {
  if (selectedTags.value.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }

  // 检查是否有新标签需要创建
  const newTagsList = selectedTags.value.filter((tag) => !existingTagNames.value.includes(tag))

  if (newTagsList.length > 0) {
    newTagsToCreate.value = newTagsList
    showConfirmDialog.value = true
  } else {
    // 只有已存在的标签，直接应用
    await applyExistingTags()
  }
}

const applyExistingTags = async () => {
  applying.value = true
  try {
    // 获取选中标签的 ID
    const tagIds = selectedTags.value
      .filter((tagName) => existingTagNames.value.includes(tagName))
      .map((tagName) => {
        const tag = props.existingTags.find((t) => t.name === tagName)
        return tag?.id
      })
      .filter((id): id is string => id !== undefined)

    emit('tags-generated', tagIds)
    closeSuggestions()
    ElMessage.success('标签应用成功')
  } catch (error) {
    console.error('应用标签失败:', error)
    ElMessage.error('应用标签失败')
  } finally {
    applying.value = false
  }
}

const confirmCreateTags = async () => {
  creating.value = true
  try {
    const { createTag } = (await import('@/composables/useData')).useTags()

    // 创建新标签
    const newTagIds: string[] = []
    for (const tagName of newTagsToCreate.value) {
      try {
        const newTag = await createTag({
          name: tagName,
          color: generateRandomColor(),
        })
        if (newTag?.id) {
          newTagIds.push(newTag.id)
        }
      } catch (error) {
        console.error(`创建标签 ${tagName} 失败:`, error)
      }
    }

    // 获取已存在标签的 ID
    const existingTagIds = selectedTags.value
      .filter((tagName) => existingTagNames.value.includes(tagName))
      .map((tagName) => {
        const tag = props.existingTags.find((t) => t.name === tagName)
        return tag?.id
      })
      .filter((id): id is string => id !== undefined)

    // 合并发送所有标签 ID
    const allTagIds = [...existingTagIds, ...newTagIds]
    emit('tags-generated', allTagIds)

    showConfirmDialog.value = false
    closeSuggestions()
    ElMessage.success(`成功创建 ${newTagIds.length} 个新标签并应用`)
  } catch (error) {
    console.error('创建新标签失败:', error)
    ElMessage.error('创建新标签失败')
  } finally {
    creating.value = false
  }
}

const handleCloseConfirmDialog = () => {
  showConfirmDialog.value = false
  newTagsToCreate.value = []
}

const closeSuggestions = () => {
  suggestions.value = []
  selectedTags.value = []
}

const continueGenerateTags = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请填写项目标题和描述后再生成标签')
    return
  }

  continueLoading.value = true
  try {
    const result = await glmApiService.generateTags(props.projectContent)

    // 合并新建议到现有建议中，去重
    const existingNames = new Set(suggestions.value.map((s) => s.name))
    const newSuggestions = result.filter((s) => !existingNames.has(s.name))

    suggestions.value = [...suggestions.value, ...newSuggestions]
    ElMessage.success(`继续生成了 ${newSuggestions.length} 个新标签`)
  } catch (error) {
    console.error('继续生成标签失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '继续生成标签失败')
  } finally {
    continueLoading.value = false
  }
}

const generateRandomColor = (): string => {
  const colors = [
    '#F56565',
    '#ED8936',
    '#ECC94B',
    '#48BB78',
    '#38B2AC',
    '#4299E1',
    '#667EEA',
    '#9F7AEA',
    '#ED64A6',
    '#718096',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 监听器
watch(
  () => props.projectContent,
  () => {
    // 当项目内容变化时，关闭建议面板
    if (suggestions.value.length > 0) {
      closeSuggestions()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.ai-tag-generator {
  margin-top: 8px;
}

.suggestions-panel {
  margin-top: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #f9f9f9;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.suggestions-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.suggestion-item {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.suggestion-item.selected {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.suggestion-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-name {
  font-weight: 500;
  color: #303133;
}

.confidence-tag {
  margin-left: 8px;
}

.tag-status {
  margin-left: 12px;
}

.suggestion-reason {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.suggestions-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}

.suggestions-actions > * {
  margin-left: 8px;
}

.suggestions-actions > *:first-child {
  margin-left: 0;
}

.confirm-content p {
  margin-bottom: 16px;
  color: #303133;
}

.new-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.new-tag-item {
  margin: 0;
}
</style>
