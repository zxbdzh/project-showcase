<template>
  <div class="icon-selector">
    <el-form-item :label="label" :required="required">
      <el-popover placement="left" :width="500" trigger="click">
        <template #reference>
          <div class="icon-display" @click="showIconPicker = true">
            <!-- SVG图标显示 -->
            <div v-if="modelValue && modelValue.startsWith('http')" class="svg-display">
              <img :src="modelValue" />
            </div>
            <font-awesome-icon
              v-else-if="modelValue"
              :icon="getIconPath(modelValue)"
              :style="iconDisplayStyle"
            />
            <span v-else>选择图标</span>
          </div>
        </template>
        <div class="icon-picker">
          <!-- 搜索框 -->
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索图标..."
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <font-awesome-icon icon="fa-solid fa-search" :style="searchIconStyle" />
              </template>
            </el-input>
          </div>

          <!-- 分类标签 -->
          <div class="category-tabs">
            <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
              <el-tab-pane label="全部" name="all" />
              <el-tab-pane label="界面" name="interface" />
              <el-tab-pane label="箭头" name="arrow" />
              <el-tab-pane label="媒体" name="media" />
              <el-tab-pane label="文件" name="file" />
              <el-tab-pane label="品牌" name="brand" />
              <el-tab-pane label="自定义" name="custom" />
            </el-tabs>
          </div>

          <!-- 自定义图标添加区域 -->
          <div v-if="activeCategory === 'custom'" class="custom-icon-section">
            <!-- SVG文件上传区域 -->
            <div class="svg-upload-section">
              <div class="section-subtitle">或上传SVG图标：</div>
              <div class="svg-upload-area">
                <file-upload
                  v-model="svgUploadResult"
                  :multiple="false"
                  accept=".svg"
                  :max-size="1"
                  :drag="false"
                  :limit="1"
                  :show-file-list="true"
                  :auto-upload="true"
                  bucket="project-showcase"
                  folder="custom-icons"
                  @success="handleSvgUploadSuccess"
                  @error="handleSvgUploadError"
                  @remove="handleSvgRemove"
                />
              </div>

              <!-- 上传进度显示 -->
              <div v-if="svgUploading" class="svg-upload-progress">
                <el-progress :percentage="svgUploadProgress" :status="svgUploadStatus" />
                <span class="progress-text">{{ svgUploadText }}</span>
              </div>
            </div>

            <div v-if="customIcons.length > 0" class="custom-icons-list">
              <div class="section-title">已添加的自定义图标：</div>
              <div class="icon-grid">
                <div
                  v-for="icon in paginatedCustomIcons"
                  :key="`custom-${icon.id || icon.name}`"
                  class="icon-item custom-icon-item"
                  :class="{ selected: modelValue === (icon.url || icon.name) }"
                  @click="selectIcon(icon.url || icon.name)"
                  :title="icon.name || icon"
                >
                  <!-- SVG图标显示 -->
                  <div v-if="icon.type === 'svg'" class="svg-icon-container">
                    <img :src="icon.url" />
                  </div>

                  <!-- FontAwesome图标显示 -->
                  <font-awesome-icon v-else :icon="icon.name" :style="getIconItemStyle(icon)" />

                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click.stop="removeCustomIcon(icon)"
                    class="remove-btn"
                    style="color: white"
                  >
                    ×
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 图标网格 -->
          <div v-else class="icon-grid">
            <div
              v-for="icon in paginatedIcons"
              :key="icon"
              class="icon-item"
              :class="{ selected: modelValue === icon }"
              @click="selectIcon(icon)"
              :title="icon"
            >
              <font-awesome-icon :icon="getIconPath(icon)" :style="getIconItemStyle(icon)" />
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="activeCategory === 'custom' ? customIcons.length : filteredIcons.length"
              layout="prev, pager, next"
              small
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-popover>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getAllFreeIcons,
  getIconsByCategory,
  getIconPath as getIconPathUtil,
} from '../utils/fontawesomeIcons'
import FileUpload from './FileUpload.vue'
import MinIOService from '@/utils/minio'
import { useCustomIcons, type CustomIcon as CustomIconType } from '@/composables/useCustomIcons'

// 文件上传响应接口
interface UploadResponse {
  url: string
  fileName: string
}

// Element Plus 文件上传接口
interface UploadUserFile {
  name: string
  raw?: UploadRawFile
}

// 上传原始文件接口
interface UploadRawFile {
  name: string
  size: number
  type: string
  lastModified: number
}

// 兼容性接口
interface CustomIcon {
  id?: string
  type: 'svg' | 'fa'
  name: string
  url?: string
}

const props = defineProps<{
  modelValue: string
  label?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showIconPicker = ref(false)
const searchQuery = ref('')
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(48)
const customIconName = ref('')

// 使用自定义图标composable
const {
  customIcons,
  loadCustomIcons,
  addCustomIcon: addCustomIconToDb,
  removeCustomIcon: removeCustomIconFromDb,
} = useCustomIcons()

// SVG上传相关
const svgUploadResult = ref<string>('')
const svgUploading = ref(false)
const svgUploadProgress = ref(0)
const svgUploadStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const svgUploadText = ref('')

// 验证FontAwesome图标是否存在
const validateFontAwesomeIcon = (iconName: string): boolean => {
  try {
    // 提取图标名称（去掉fa-solid或fa-brands前缀）
    const iconNameOnly = iconName.split(' ').pop()
    if (!iconNameOnly) return false

    // 检查是否在可用图标列表中
    return allFreeIcons.value.includes(iconNameOnly)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('验证图标失败:', error)
    }
    return false
  }
}

// 添加自定义图标
const addCustomIcon = async () => {
  const icon = customIconName.value.trim()
  if (!icon) return

  // 验证格式
  if (!icon.startsWith('fa-solid ') && !icon.startsWith('fa-brands ')) {
    // 尝试自动补全格式 - 修复这里的问题
    if (!icon.includes(' ')) {
      customIconName.value = `fa-solid fa-${icon}`
      return
    }
  }

  // 检查是否已存在
  const exists = customIcons.value.some(
    (customIcon) => customIcon.type === 'fa' && customIcon.name === icon,
  )

  if (!exists) {
    // 验证图标是否存在
    if (!validateFontAwesomeIcon(icon)) {
      ElMessage.error(`图标 "${icon}" 不存在，请检查图标名称`)
      return
    }

    try {
      await addCustomIconToDb({
        type: 'fa',
        name: icon,
        icon_name: icon,
      })
      customIconName.value = ''
      ElMessage.success('图标添加成功')
    } catch (error) {
      ElMessage.error('添加图标失败')
    }
  } else {
    ElMessage.warning('该图标已存在')
  }
}

// SVG上传成功处理
const handleSvgUploadSuccess = async (response: unknown, file: UploadUserFile) => {
  try {
    const uploadResponse = response as UploadResponse
    if (uploadResponse && uploadResponse.url) {
      // 添加到自定义图标列表
      await addCustomIconToDb({
        type: 'svg',
        name: file.name,
        url: uploadResponse.url,
      })

      ElMessage.success('SVG图标上传成功')
      svgUploadResult.value = ''
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('上传响应格式错误:', uploadResponse)
      }
      ElMessage.error('SVG上传响应格式错误')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('处理SVG上传结果失败:', error)
    }
    ElMessage.error('SVG图标处理失败')
  }
}

// SVG上传失败处理
const handleSvgUploadError = (error: Error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('SVG上传失败:', error)
  }
  ElMessage.error('SVG图标上传失败')
}

// SVG文件删除处理
const handleSvgRemove = () => {
  // 清空上传结果，避免显示已删除的文件
  svgUploadResult.value = ''
  ElMessage.info('文件已移除')
}

// 移除自定义图标
const removeCustomIcon = async (icon: CustomIcon) => {
  try {
    // 如果是SVG图标，需要从MinIO删除文件
    if (icon.type === 'svg' && icon.url) {
      const key = icon.url.split('/').pop()
      if (key) {
        await MinIOService.deleteFile(`custom-icons/${key}`)
      }
    }

    // 从数据库删除
    if (icon.id) {
      await removeCustomIconFromDb(icon.id)
    }

    ElMessage.success('图标删除成功')
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('删除图标失败:', error)
    }
    ElMessage.error('删除图标失败')
  }
}

// 自定义图标分页
const paginatedCustomIcons = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return customIcons.value.slice(start, end)
})

// 获取所有免费图标
const allFreeIcons = ref<string[]>([])

// 初始化图标列表
onMounted(async () => {
  try {
    const icons = getAllFreeIcons()
    allFreeIcons.value = icons.map((icon) => icon.name)
    loadCustomIcons()
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('加载FontAwesome图标失败:', error)
    }
    // 如果加载失败，使用备用图标列表
    allFreeIcons.value = [
      'user',
      'heart',
      'star',
      'home',
      'cog',
      'search',
      'arrow-left',
      'arrow-right',
      'github',
    ]
  }
})

// 获取分类图标
const categoryIcons = computed(() => {
  if (activeCategory.value === 'all') {
    return allFreeIcons.value
  }

  const categories = getIconsByCategory()
  return categories[activeCategory.value as keyof typeof categories] || []
})

// 过滤图标
const filteredIcons = computed(() => {
  let icons = categoryIcons.value

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter((icon) => icon.toLowerCase().includes(query))
  }

  return icons
})

// 分页图标
const paginatedIcons = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredIcons.value.slice(start, end)
})

// 获取图标路径
const getIconPath = (iconName: string): string => {
  // 如果是自定义图标（包含空格），直接返回
  if (iconName.includes(' ')) {
    return iconName
  }

  // 否则使用工具函数获取路径
  return getIconPathUtil(iconName)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理分类切换
const handleCategoryChange = () => {
  currentPage.value = 1
}

// 处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 图标显示样式
const iconDisplayStyle = computed(() => {
  // 检测是否为深色模式
  const isDark = document.documentElement.classList.contains('dark')
  return {
    color: isDark ? '#ffffff' : 'var(--el-color-text-regular)',
    fill: isDark ? '#ffffff' : 'currentColor',
  }
})

// 图标网格项目样式
const getIconItemStyle = (icon: string | CustomIcon) => {
  const isDark = document.documentElement.classList.contains('dark')
  const iconName = typeof icon === 'string' ? icon : icon.name || icon.url || ''
  const isSelected = props.modelValue === iconName
  return {
    color: isSelected ? '#409eff' : isDark ? '#ffffff' : 'var(--el-color-text-regular)',
    fill: isSelected ? '#409eff' : isDark ? '#ffffff' : 'currentColor',
  }
}

// 搜索图标样式
const searchIconStyle = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    color: isDark ? '#ffffff' : 'var(--el-color-text-regular)',
    fill: isDark ? '#ffffff' : 'currentColor',
  }
})

// 选择图标
const selectIcon = (icon: string) => {
  emit('update:modelValue', icon)
  showIconPicker.value = false
}
</script>

<style scoped>
.icon-selector {
  width: 100%;
}

.icon-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--el-color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  color: var(--el-color-text-regular);
  transition: all 0.3s;
  background: var(--el-color-fill-blank);
}

.icon-display:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.svg-display {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-display :deep(svg) {
  width: 100%;
  height: 100%;
  color: var(--el-color-text-regular);
  fill: currentColor;
}

.icon-picker {
  padding: 16px;
  background: var(--el-color-fill-blank);
}

.search-box {
  margin-bottom: 16px;
}

.category-tabs {
  margin-bottom: 16px;
}

.custom-icon-section {
  margin-bottom: 16px;
}

.svg-upload-section {
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-color-text-primary);
  margin-bottom: 8px;
}

.svg-upload-area {
  margin-bottom: 12px;
}

.svg-upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-text {
  font-size: 12px;
  color: var(--el-color-text-secondary);
}

.custom-icon-input {
  margin-bottom: 16px;
}

.help-text {
  font-size: 12px;
  color: var(--el-color-text-secondary);
  margin-top: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-color-text-primary);
  margin-bottom: 8px;
}

.custom-icons-list {
  margin-top: 16px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--el-color-border-light);
  border-radius: 4px;
  margin-bottom: 16px;
  background: var(--el-color-fill-blank);
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--el-color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: var(--el-color-text-regular);
  transition: all 0.3s;
  background: var(--el-color-fill-blank);
  position: relative;
}

.icon-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  transform: scale(1.1);
}

.icon-item.selected {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-8);
}

.custom-icon-item {
  position: relative;
}

.svg-icon-container {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-icon-container :deep(svg) {
  width: 100%;
  height: 100%;
  color: inherit;
  fill: currentColor;
}

.remove-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  padding: 0;
  font-size: 12px;
  line-height: 1;
  border-radius: 50%;
  z-index: 10;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

/* 滚动条样式 */
.icon-grid::-webkit-scrollbar {
  width: 6px;
}

.icon-grid::-webkit-scrollbar-track {
  background: var(--el-color-fill-light);
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-thumb {
  background: var(--el-color-text-placeholder);
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-text-secondary);
}

/* 深色模式样式 - 强制覆盖 */
html.dark .icon-selector svg,
html.dark .icon-selector svg *,
html.dark font-awesome-icon svg,
html.dark font-awesome-icon svg * {
  color: #ffffff !important;
  fill: #ffffff !important;
  opacity: 1 !important;
}

html.dark .icon-display:hover svg,
html.dark .icon-display:hover font-awesome-icon svg,
html.dark .icon-item:hover svg,
html.dark .icon-item:hover font-awesome-icon svg,
html.dark .icon-display:hover svg *,
html.dark .icon-display:hover font-awesome-icon svg *,
html.dark .icon-item:hover svg *,
html.dark .icon-item:hover font-awesome-icon svg * {
  color: #409eff !important;
  fill: #409eff !important;
  opacity: 1 !important;
}

html.dark .icon-item.selected svg,
html.dark .icon-item.selected font-awesome-icon svg,
html.dark .icon-item.selected svg *,
html.dark .icon-item.selected font-awesome-icon svg * {
  color: #409eff !important;
  fill: #409eff !important;
  opacity: 1 !important;
}

/* 针对FontAwesome的特定类 */
html.dark .icon-selector .fa-svg-inline--fa,
html.dark .icon-selector .svg-inline--fa {
  color: #ffffff !important;
  fill: #ffffff !important;
}

html.dark .icon-display:hover .fa-svg-inline--fa,
html.dark .icon-display:hover .svg-inline--fa,
html.dark .icon-item:hover .fa-svg-inline--fa,
html.dark .icon-item:hover .svg-inline--fa {
  color: #409eff !important;
  fill: #409eff !important;
}

html.dark .icon-item.selected .fa-svg-inline--fa,
html.dark .icon-item.selected .svg-inline--fa {
  color: #409eff !important;
  fill: #409eff !important;
}

/* 搜索框图标 */
html.dark .search-box .fa-svg-inline--fa,
html.dark .search-box .svg-inline--fa {
  color: #ffffff !important;
  fill: #ffffff !important;
}

html.dark .icon-grid::-webkit-scrollbar-track {
  background: var(--el-color-fill-darker);
}

html.dark .icon-grid::-webkit-scrollbar-thumb {
  background: var(--el-color-border-darker);
}

html.dark .icon-grid::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-border);
}
</style>
