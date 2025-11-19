<template>
  <div class="icon-selector">
    <el-form-item :label="label" :required="required">
      <div class="icon-selector-container">
        <!-- 当前选中的图标预览 -->
        <div class="current-icon" @click="showSelector = !showSelector">
          <component :is="currentIcon" v-if="currentIcon" :size="24" />
          <span v-else class="placeholder">选择图标</span>
          <el-icon class="arrow" :class="{ 'is-open': showSelector }">
            <ArrowDown />
          </el-icon>
        </div>

        <!-- 图标选择器弹窗 -->
        <div v-if="showSelector" class="icon-selector-dropdown">
          <!-- 搜索框 -->
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索图标..."
              :prefix-icon="Search"
              clearable
              @input="filterIcons"
            />
          </div>

          <!-- 分类标签 -->
          <div class="category-tabs">
            <el-tabs v-model="activeCategory" @tab-change="filterIcons">
              <el-tab-pane
                v-for="category in iconCategories"
                :key="category.key"
                :label="category.name"
                :name="category.key"
              />
            </el-tabs>
          </div>

          <!-- 图标网格 -->
          <div class="icon-grid">
            <div
              v-for="icon in filteredIcons"
              :key="icon.name"
              class="icon-item"
              :class="{ 'is-selected': selectedIcon === icon.name }"
              @click="selectIcon(icon)"
            >
              <component :is="icon.component" :size="20" />
              <span class="icon-name">{{ icon.name }}</span>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <el-icon class="is-loading">
              <Loader2 />
            </el-icon>
            <span>加载图标中...</span>
          </div>

          <!-- 无结果状态 -->
          <div v-if="!loading && filteredIcons.length === 0" class="no-results">
            <el-icon>
              <SearchX />
            </el-icon>
            <span>未找到匹配的图标</span>
          </div>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as LucideIcons from 'lucide-vue-next'
import { ArrowDown, Search, Loader2, SearchX } from 'lucide-vue-next'

// Props
interface Props {
  modelValue?: string
  label?: string
  required?: boolean
  placeholder?: string
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '图标',
  required: false,
  placeholder: '选择图标',
  size: 'default',
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

// 响应式数据
const showSelector = ref(false)
const searchQuery = ref('')
const activeCategory = ref('all')
const selectedIcon = ref(props.modelValue)
const loading = ref(false)
const allIcons = ref<Array<{ name: string; component: unknown; category: string }>>([])

// 图标分类
const iconCategories = [
  { key: 'all', name: '全部' },
  { key: 'arrows', name: '箭头' },
  { key: 'ui', name: '界面' },
  { key: 'media', name: '媒体' },
  { key: 'files', name: '文件' },
  { key: 'communication', name: '通讯' },
  { key: 'business', name: '商务' },
  { key: 'development', name: '开发' },
  { key: 'design', name: '设计' },
  { key: 'social', name: '社交' },
]

// 图标分类映射
const iconCategoryMap: Record<string, string[]> = {
  arrows: [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ChevronUp',
    'ChevronDown',
    'ChevronLeft',
    'ChevronRight',
    'Expand',
    'Shrink',
    'Maximize2',
    'Minimize2',
  ],
  ui: [
    'Menu',
    'X',
    'Plus',
    'Minus',
    'Check',
    'Square',
    'Circle',
    'Star',
    'Heart',
    'Bookmark',
    'Flag',
    'Bell',
    'Eye',
    'EyeOff',
    'Lock',
    'Unlock',
    'Key',
    'Shield',
    'Home',
    'Settings',
    'Grid',
    'List',
    'Layers',
    'Layout',
  ],
  media: [
    'Play',
    'Pause',
    'SkipBack',
    'SkipForward',
    'Rewind',
    'FastForward',
    'Volume2',
    'VolumeX',
    'Mic',
    'MicOff',
    'Video',
    'VideoOff',
    'Camera',
    'CameraOff',
    'Image',
    'Film',
    'Tv',
    'Radio',
    'Speaker',
  ],
  files: [
    'File',
    'FileText',
    'FilePlus',
    'FileMinus',
    'FileX',
    'FileCheck',
    'Folder',
    'FolderOpen',
    'FolderPlus',
    'FolderMinus',
    'FolderX',
  ],
  communication: [
    'MessageSquare',
    'MessageCircle',
    'Send',
    'Share',
    'Mail',
    'MailOpen',
    'Phone',
    'PhoneCall',
    'PhoneOff',
    'AtSign',
    'Hash',
  ],
  business: [
    'Briefcase',
    'Building',
    'Store',
    'Factory',
    'CreditCard',
    'DollarSign',
    'TrendingUp',
    'TrendingDown',
    'BarChart',
    'PieChart',
    'Calendar',
  ],
  development: [
    'Code',
    'Terminal',
    'GitBranch',
    'GitCommit',
    'GitMerge',
    'GitPullRequest',
    'Database',
    'Server',
    'Cloud',
    'Download',
    'Upload',
    'Cpu',
  ],
  design: [
    'Palette',
    'Brush',
    'PenTool',
    'Eraser',
    'Droplet',
    'PaintBucket',
    'Type',
    'Image',
    'Crop',
    'Move',
    'RotateCw',
    'ZoomIn',
    'ZoomOut',
  ],
  social: [
    'Facebook',
    'Twitter',
    'Instagram',
    'Youtube',
    'Linkedin',
    'Github',
    'Discord',
    'Slack',
    'Telegram',
    'Whatsapp',
  ],
}

// 计算属性
const currentIcon = computed(() => {
  if (!selectedIcon.value) return null
  return (LucideIcons as Record<string, unknown>)[selectedIcon.value]
})

const filteredIcons = computed(() => {
  let icons = allIcons.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    const categoryIcons = iconCategoryMap[activeCategory.value] || []
    icons = icons.filter((icon) => categoryIcons.includes(icon.name))
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter((icon) => icon.name.toLowerCase().includes(query))
  }

  return icons
})

// 方法
const loadIcons = async () => {
  loading.value = true
  try {
    const icons = Object.entries(LucideIcons).map(([name, component]) => {
      // 确定图标分类
      let category = 'all'
      for (const [catName, iconList] of Object.entries(iconCategoryMap)) {
        if (iconList.includes(name)) {
          category = catName
          break
        }
      }

      return {
        name,
        component,
        category,
      }
    })

    allIcons.value = icons
  } catch (error) {
    console.error('Failed to load icons:', error)
    ElMessage.error('加载图标失败')
  } finally {
    loading.value = false
  }
}

const filterIcons = () => {
  // 搜索和分类筛选会自动通过计算属性处理
}

const selectIcon = (icon: { name: string; component: unknown; category: string }) => {
  selectedIcon.value = icon.name
  emit('update:modelValue', icon.name)
  emit('change', icon.name)
  showSelector.value = false
}

// 点击外部关闭选择器
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.icon-selector-container')) {
    showSelector.value = false
  }
}

// 监听器
watch(
  () => props.modelValue,
  (newValue) => {
    selectedIcon.value = newValue
  },
)

// 生命周期
onMounted(() => {
  loadIcons()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.icon-selector {
  width: 100%;
}

.icon-selector-container {
  position: relative;
}

.current-icon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  background: var(--el-bg-color);
  transition: all 0.3s ease;
  min-height: 40px;
}

.current-icon:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.1);
}

.current-icon .placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.current-icon .arrow {
  transition: transform 0.3s ease;
}

.current-icon .arrow.is-open {
  transform: rotate(180deg);
}

.icon-selector-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 2000;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 500px;
  overflow: hidden;
  margin-top: 4px;
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.category-tabs {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.category-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.category-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 12px;
}

.category-tabs :deep(.el-tabs__item) {
  padding: 0 16px;
  font-size: 12px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px;
}

.icon-item:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color);
  transform: translateY(-2px);
}

.icon-item.is-selected {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.icon-name {
  font-size: 10px;
  margin-top: 4px;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.loading-state,
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--el-text-color-secondary);
}

.loading-state span,
.no-results span {
  margin-top: 8px;
  font-size: 14px;
}

/* 深色主题适配 */
.dark .icon-selector-dropdown {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dark .icon-item:hover {
  background: var(--el-fill-color-dark);
}

.dark .icon-item.is-selected {
  background: rgba(var(--el-color-primary-rgb), 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .icon-selector-dropdown {
    max-height: 400px;
  }

  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 6px;
    padding: 8px;
    max-height: 250px;
  }

  .icon-item {
    min-height: 50px;
    padding: 6px;
  }

  .icon-name {
    font-size: 9px;
    margin-top: 2px;
  }
}

/* 滚动条样式 */
.icon-grid::-webkit-scrollbar {
  width: 6px;
}

.icon-grid::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}
</style>
