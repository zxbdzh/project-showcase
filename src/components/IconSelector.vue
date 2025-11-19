<template>
  <div class="icon-selector">
    <el-popover :width="400" trigger="click" placement="bottom" :persistent="false">
      <template #reference>
        <el-button
          :size="size"
          :disabled="disabled"
          class="icon-selector__button"
          @click="togglePopover"
        >
          <div class="icon-selector__selected">
            <component
              v-if="selectedIcon"
              :is="selectedIcon"
              :size="iconSize"
              :color="iconColor"
              class="icon-selector__selected-icon"
            />
            <span v-else class="icon-selector__placeholder">
              {{ placeholder }}
            </span>
          </div>
          <el-icon class="icon-selector__arrow">
            <ArrowDown />
          </el-icon>
        </el-button>
      </template>

      <template #default>
        <div class="icon-selector__content">
          <!-- 搜索框 -->
          <div class="icon-selector__search">
            <el-input
              v-model="searchQuery"
              placeholder="搜索图标..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </div>

          <!-- 分类标签 -->
          <div class="icon-selector__categories">
            <el-radio-group v-model="selectedCategory" size="small">
              <el-radio-button
                v-for="category in categories"
                :key="category.key"
                :label="category.key"
              >
                {{ category.name }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <!-- 图标网格 -->
          <div class="icon-selector__grid">
            <div
              v-for="icon in filteredIcons"
              :key="icon.name"
              class="icon-selector__item"
              :class="{ 'icon-selector__item--selected': isSelected(icon) }"
              @click="selectIcon(icon)"
            >
              <component
                :is="icon.component"
                :size="iconSize"
                :color="iconColor"
                class="icon-selector__icon"
              />
              <div class="icon-selector__tooltip">
                {{ icon.name }}
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="icon-selector__pagination">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredIcons.length"
              layout="prev, pager, next"
              small
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown, Search } from '@element-plus/icons-vue'
import * as LucideIcons from 'lucide-vue-next'

// 图标分类
interface IconCategory {
  key: string
  name: string
  icons: string[]
}

// 图标项
interface IconItem {
  name: string
  component: any
  category: string
}

// Props
interface Props {
  modelValue?: string
  placeholder?: string
  size?: 'small' | 'default' | 'large'
  iconSize?: number
  iconColor?: string
  disabled?: boolean
  categories?: IconCategory[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '选择图标',
  size: 'default',
  iconSize: 20,
  iconColor: 'currentColor',
  disabled: false,
  categories: () => getDefaultCategories(),
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(48)

// 计算属性
const selectedIcon = computed(() => {
  if (!props.modelValue) return null
  return findIconByName(props.modelValue)
})

const filteredIcons = computed(() => {
  let icons = getAllIcons()

  // 按分类筛选
  if (selectedCategory.value !== 'all') {
    icons = icons.filter((icon) => icon.category === selectedCategory.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter((icon) => icon.name.toLowerCase().includes(query))
  }

  return icons
})

const totalPages = computed(() => {
  return Math.ceil(filteredIcons.value.length / pageSize.value)
})

const paginatedIcons = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredIcons.value.slice(start, end)
})

// 获取默认分类
function getDefaultCategories(): IconCategory[] {
  return [
    {
      key: 'all',
      name: '全部',
      icons: [],
    },
    {
      key: 'arrows',
      name: '箭头',
      icons: [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ChevronUp',
        'ChevronDown',
        'ChevronLeft',
        'ChevronRight',
      ],
    },
    {
      key: 'interface',
      name: '界面',
      icons: [
        'Menu',
        'Settings',
        'Home',
        'User',
        'Users',
        'Search',
        'Filter',
        'Plus',
        'Minus',
        'X',
        'Check',
      ],
    },
    {
      key: 'media',
      name: '媒体',
      icons: ['Play', 'Pause', 'Square', 'Circle', 'Image', 'Video', 'Music', 'Volume2', 'VolumeX'],
    },
    {
      key: 'files',
      name: '文件',
      icons: [
        'File',
        'FileText',
        'Folder',
        'FolderOpen',
        'Download',
        'Upload',
        'Save',
        'Copy',
        'Trash2',
      ],
    },
    {
      key: 'communication',
      name: '通信',
      icons: ['Mail', 'MessageSquare', 'Phone', 'PhoneCall', 'Share2', 'Link', 'Globe', 'Wifi'],
    },
    {
      key: 'social',
      name: '社交',
      icons: ['Github', 'Twitter', 'Linkedin', 'Facebook', 'Instagram', 'Youtube'],
    },
    {
      key: 'development',
      name: '开发',
      icons: ['Code', 'Code2', 'Terminal', 'Database', 'Server', 'Cloud', 'Package', 'GitBranch'],
    },
    {
      key: 'design',
      name: '设计',
      icons: ['Palette', 'Brush', 'PenTool', 'Eraser', 'Move', 'RotateCw', 'ZoomIn', 'ZoomOut'],
    },
  ]
}

// 获取所有图标
function getAllIcons(): IconItem[] {
  const allIcons: IconItem[] = []

  props.categories.forEach((category) => {
    category.icons.forEach((iconName) => {
      const component = (LucideIcons as any)[iconName]
      if (component) {
        allIcons.push({
          name: iconName,
          component,
          category: category.key,
        })
      }
    })
  })

  return allIcons
}

// 根据名称查找图标
function findIconByName(name: string): IconItem | null {
  const allIcons = getAllIcons()
  return allIcons.find((icon) => icon.name === name) || null
}

// 检查是否选中
function isSelected(icon: IconItem): boolean {
  return props.modelValue === icon.name
}

// 选择图标
function selectIcon(icon: IconItem) {
  emit('update:modelValue', icon.name)
  emit('change', icon.name)
  ElMessage.success(`已选择图标: ${icon.name}`)
}

// 搜索处理
function handleSearch() {
  currentPage.value = 1
}

// 分类切换
function handlePageChange(page: number) {
  currentPage.value = page
}

// 切换弹出框
function togglePopover() {
  // 重置搜索和分页
  searchQuery.value = ''
  currentPage.value = 1
  selectedCategory.value = 'all'
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  () => {
    // 当外部值变化时，更新内部状态
  },
  { immediate: true },
)
</script>

<style scoped>
.icon-selector {
  display: inline-block;
}

.icon-selector__button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-selector__button:hover {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.icon-selector__selected {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.icon-selector__selected-icon {
  flex-shrink: 0;
}

.icon-selector__placeholder {
  color: var(--text-secondary);
  font-size: 14px;
}

.icon-selector__arrow {
  transition: transform 0.3s ease;
}

.icon-selector__button:hover .icon-selector__arrow {
  transform: rotate(180deg);
}

.icon-selector__content {
  padding: 16px;
  max-width: 400px;
  max-height: 500px;
}

.icon-selector__search {
  margin-bottom: 16px;
}

.icon-selector__categories {
  margin-bottom: 16px;
}

.icon-selector__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-secondary);
}

.icon-selector__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.icon-selector__item:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
  transform: scale(1.1);
}

.icon-selector__item--selected {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.icon-selector__icon {
  pointer-events: none;
}

.icon-selector__tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-tooltip);
  color: var(--text-tooltip);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 1000;
}

.icon-selector__item:hover .icon-selector__tooltip {
  opacity: 1;
}

.icon-selector__pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* 深色主题适配 */
:deep(.dark) .icon-selector__button {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
}

:deep(.dark) .icon-selector__button:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

:deep(.dark) .icon-selector__content {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
}

:deep(.dark) .icon-selector__grid {
  background: var(--bg-primary);
  border-color: var(--border-primary);
}

:deep(.dark) .icon-selector__item:hover {
  background: var(--bg-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .icon-selector__content {
    max-width: 320px;
    max-height: 400px;
    padding: 12px;
  }

  .icon-selector__grid {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 6px;
    max-height: 240px;
  }

  .icon-selector__item {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .icon-selector__content {
    max-width: 280px;
    padding: 8px;
  }

  .icon-selector__grid {
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    gap: 4px;
    max-height: 200px;
  }

  .icon-selector__item {
    width: 36px;
    height: 36px;
  }
}
</style>
