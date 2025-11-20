<template>
  <div class="icon-selector">
    <el-form-item :label="label" :required="required">
      <el-popover placement="bottom" :width="500" trigger="click">
        <template #reference>
          <div class="icon-display" @click="showIconPicker = true">
            <font-awesome-icon v-if="modelValue" :icon="getIconPath(modelValue)" />
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
                <font-awesome-icon icon="fa-solid fa-search" />
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
            <div class="custom-icon-input">
              <el-input
                v-model="customIconName"
                placeholder="输入图标名称 (如: fa-solid fa-user)"
                clearable
                @keyup.enter="addCustomIcon"
              >
                <template #append>
                  <el-button @click="addCustomIcon" type="primary">添加</el-button>
                </template>
              </el-input>
              <div class="help-text">支持格式：fa-solid fa-icon-name, fa-brands fa-icon-name</div>
            </div>

            <div v-if="customIcons.length > 0" class="custom-icons-list">
              <div class="section-title">已添加的自定义图标：</div>
              <div class="icon-grid">
                <div
                  v-for="icon in paginatedCustomIcons"
                  :key="`custom-${icon}`"
                  class="icon-item custom-icon-item"
                  :class="{ selected: modelValue === icon }"
                  @click="selectIcon(icon)"
                  :title="icon"
                >
                  <font-awesome-icon :icon="icon" />
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click.stop="removeCustomIcon(icon)"
                    class="remove-btn"
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
              <font-awesome-icon :icon="getIconPath(icon)" />
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
import {
  getAllFreeIcons,
  getIconsByCategory,
  getIconPath as getIconPathUtil,
} from '../utils/fontawesomeIcons'

defineProps<{
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
const customIcons = ref<string[]>([])

// 从localStorage加载自定义图标
const loadCustomIcons = () => {
  const saved = localStorage.getItem('custom-icons')
  if (saved) {
    customIcons.value = JSON.parse(saved)
  }
}

// 保存自定义图标到localStorage
const saveCustomIcons = () => {
  localStorage.setItem('custom-icons', JSON.stringify(customIcons.value))
}

// 添加自定义图标
const addCustomIcon = () => {
  const icon = customIconName.value.trim()
  if (!icon) return

  // 验证格式
  if (!icon.startsWith('fa-solid ') && !icon.startsWith('fa-brands ')) {
    // 尝试自动补全格式
    if (!icon.includes(' ')) {
      customIconName.value = `fa-solid ${icon}`
      return
    }
  }

  // 检查是否已存在
  if (!customIcons.value.includes(icon)) {
    customIcons.value.push(icon)
    saveCustomIcons()
    customIconName.value = ''
  }
}

// 移除自定义图标
const removeCustomIcon = (icon: string) => {
  const index = customIcons.value.indexOf(icon)
  if (index > -1) {
    customIcons.value.splice(index, 1)
    saveCustomIcons()
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
    console.error('加载FontAwesome图标失败:', error)
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

/* 深色模式特殊处理 */
html.dark .icon-display {
  border-color: var(--el-color-border-dark);
  color: var(--el-color-text-regular);
  background: var(--el-color-fill-dark);
}

html.dark .icon-display:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: rgba(0, 255, 65, 0.1);
}

html.dark .icon-grid {
  border-color: var(--el-color-border-dark);
  background: var(--el-color-fill-dark);
}

html.dark .icon-item {
  border-color: var(--el-color-border-dark);
  color: var(--el-color-text-regular);
  background: var(--el-color-fill-dark);
}

html.dark .icon-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: rgba(0, 255, 65, 0.15);
}

html.dark .icon-item.selected {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: rgba(0, 255, 65, 0.2);
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
