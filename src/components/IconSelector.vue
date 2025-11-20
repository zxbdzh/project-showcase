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
            </el-tabs>
          </div>

          <!-- 图标网格 -->
          <div class="icon-grid">
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
              :total="filteredIcons.length"
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

// 图标分类映射 - 只包含免费图标
const iconCategories: Record<string, string[]> = {
  interface: [
    'user',
    'users',
    'user-circle',
    'heart',
    'star',
    'check-circle',
    'times-circle',
    'plus-circle',
    'minus-circle',
    'plus-square',
    'minus-square',
    'eye',
    'eye-slash',
    'bell',
    'bell-slash',
    'lock',
    'lock-open',
    'key',
    'shield-alt',
    'cog',
    'cogs',
    'tools',
    'wrench',
    'hammer',
    'search',
    'filter',
    'download',
    'upload',
    'sync',
    'sync-alt',
    'undo',
    'redo',
    'copy',
    'paste',
    'cut',
    'save',
    'edit',
    'trash',
    'trash-alt',
    'plus',
    'minus',
    'times',
    'check',
    'info-circle',
    'question-circle',
    'exclamation-circle',
    'exclamation-triangle',
    'home',
    'building',
    'store',
    'shopping-cart',
    'shopping-bag',
    'credit-card',
    'money-bill',
    'money-bill-wave',
    'gift',
    'box',
    'boxes',
    'palette',
    'paint-brush',
    'eraser',
    'font',
    'heading',
    'paragraph',
    'list',
    'list-ul',
    'list-ol',
    'table',
    'th',
    'th-large',
    'bars',
    'ellipsis-h',
    'ellipsis-v',
    'expand',
    'compress',
    'expand-arrows-alt',
    'compress-arrows-alt',
    'arrows-alt',
    'arrows-alt-h',
    'arrows-alt-v',
    'random',
    'refresh',
    'retweet',
    'bookmark',
    'flag',
    'tags',
    'tag',
    'thumbtack',
    'pushpin',
    'link',
    'unlink',
    'paperclip',
    'print',
    'qrcode',
    'barcode',
    'camera',
    'video',
    'image',
    'play',
    'pause',
    'stop',
    'forward',
    'backward',
    'fast-forward',
    'fast-backward',
    'step-forward',
    'step-backward',
    'eject',
    'volume-up',
    'volume-down',
    'volume-mute',
    'volume-off',
    'microphone',
    'microphone-slash',
    'headphones',
    'phone',
    'phone-alt',
    'mobile',
    'tablet',
    'laptop',
    'desktop',
    'tv',
    'gamepad',
    'keyboard',
    'mouse',
    'wifi',
    'bluetooth',
    'battery-full',
    'battery-half',
    'battery-quarter',
    'battery-empty',
    'plug',
    'power-off',
    'sign-out-alt',
    'sign-in-alt',
    'user-plus',
    'user-minus',
    'user-check',
    'user-times',
    'users-cog',
    'clock',
    'calendar',
    'calendar-alt',
    'calendar-week',
    'hourglass',
    'hourglass-half',
    'history',
    'stopwatch',
    'timer',
  ],
  arrow: [
    'arrow-up',
    'arrow-down',
    'arrow-left',
    'arrow-right',
    'arrow-circle-up',
    'arrow-circle-down',
    'arrow-circle-left',
    'arrow-circle-right',
    'angle-up',
    'angle-down',
    'angle-left',
    'angle-right',
    'angle-double-up',
    'angle-double-down',
    'angle-double-left',
    'angle-double-right',
    'caret-up',
    'caret-down',
    'caret-left',
    'caret-right',
    'caret-square-up',
    'caret-square-down',
    'caret-square-left',
    'caret-square-right',
    'chevron-up',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'chevron-circle-up',
    'chevron-circle-down',
    'chevron-circle-left',
    'chevron-circle-right',
    'long-arrow-alt-up',
    'long-arrow-alt-down',
    'long-arrow-alt-left',
    'long-arrow-alt-right',
    'arrow-alt',
    'exchange-alt',
    'level-up-alt',
    'level-down-alt',
    'sort',
    'sort-up',
    'sort-down',
    'sort-amount-up',
    'sort-amount-down',
    'sort-alpha-down',
    'sort-alpha-up',
    'sort-numeric-down',
    'sort-numeric-up',
  ],
  media: [
    'play-circle',
    'play',
    'pause',
    'stop',
    'step-backward',
    'fast-backward',
    'backward',
    'forward',
    'fast-forward',
    'step-forward',
    'eject',
    'fullscreen',
    'resize-full',
    'resize-small',
    'camera',
    'camera-retro',
    'film',
    'video',
    'image',
    'photo-video',
    'music',
    'headphones',
    'microphone',
    'microphone-alt',
    'microphone-slash',
    'volume-up',
    'volume-down',
    'volume-off',
    'volume-mute',
    'tv',
    'desktop',
    'mobile',
    'tablet',
    'gamepad',
    'joystick',
  ],
  file: [
    'file',
    'folder',
    'folder-open',
    'file-alt',
    'file-image',
    'file-pdf',
    'file-code',
    'file-excel',
    'file-word',
    'file-powerpoint',
    'file-archive',
    'file-audio',
    'file-video',
    'envelope',
    'envelope-open',
    'comment',
    'comments',
    'share',
    'share-alt',
    'chart-bar',
    'chart-line',
    'chart-pie',
    'chart-area',
    'sun',
    'cloud',
    'cloud-sun',
    'cloud-rain',
    'snowflake',
    'map',
    'map-marker-alt',
    'compass',
    'globe',
    'earth',
    'wheelchair',
    'universal-access',
    'assistive-listening-systems',
    'sign-language',
    'bookmark',
    'flag',
    'tags',
    'tag',
    'thumbtack',
    'pushpin',
    'link',
    'unlink',
    'paperclip',
    'print',
    'qrcode',
    'barcode',
    'save',
    'copy',
    'paste',
    'cut',
    'edit',
    'trash',
    'trash-alt',
    'download',
    'upload',
    'sync',
    'sync-alt',
    'undo',
    'redo',
    'history',
    'clock',
    'calendar',
    'calendar-alt',
  ],
  brand: [
    'github',
    'twitter',
    'facebook',
    'facebook-f',
    'linkedin',
    'linkedin-in',
    'instagram',
    'youtube',
    'chrome',
    'firefox',
    'safari',
    'edge',
    'opera',
    'internet-explorer',
    'apple',
    'microsoft',
    'google',
    'google-plus',
    'google-plus-g',
    'amazon',
    'paypal',
    'stripe',
    'bitcoin',
    'ethereum',
    'discord',
    'slack',
    'telegram',
    'whatsapp',
    'weixin',
    'qq',
    'weibo',
    'vuejs',
    'react',
    'angular',
    'node-js',
    'npm',
    'yarn',
    'linux',
    'windows',
    'android',
    'apple-alt',
    'docker',
    'git',
    'git-alt',
    'bitbucket',
    'jenkins',
    'html5',
    'css3',
    'js',
    'js-square',
    'python',
    'java',
    'php',
    'swift',
    'kotlin',
    'rust',
    'go',
    'd-and-d',
    'steam',
    'steam-symbol',
    'twitch',
    'spotify',
    'soundcloud',
    'dropbox',
    'google-drive',
    'one-drive',
    'skyatlas',
    'ravelry',
    'sellcast',
    'scribd',
    'shirtsinbulk',
    'simplybuilt',
    'skyatlas-2',
    'facebook-messenger',
    'font-awesome',
    'font-awesome-alt',
    'font-awesome-flag',
    'fonticons',
    'fonticons-fi',
    'fort-awesome',
    'fort-awesome-alt',
  ],
}

// 获取图标路径
const getIconPath = (iconName: string): string => {
  // 逻辑：判断 fa 开头 → 截取后文本 → 驼峰转连字符 → 转小写
  if (iconName.startsWith('fa')) {
    iconName = iconName
      // 1. 优先移除开头的 fas 或 fa 前缀（fas 优先，避免 fast-forward 拆错）
      .replace(/^fas?/, '')
      // 2. 处理连字符：将 - 转为空格（针对 fast-forward 这类带连字符的场景）
      .replace(/-/g, ' ')
      // 3. 处理驼峰：小写字母后接大写字母时加空格（兼容原有驼峰命名，如 UserInfo）
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // 4. 统一转为小写
      .toLowerCase()
      // 5. （可选）去除首尾空格：避免前缀移除后可能残留的空字符（如 "fa-" 转为 ""）
      .trim()
  }

  // if (iconName.includes('-')) iconName = iconName.replace('-', '')

  // 检查是否是品牌图标
  if (iconCategories.brand?.includes(iconName)) {
    return `fa-brands fa-${iconName}`
  }
  // 默认为solid图标
  return `fa-solid fa-${iconName}`
}

// 获取所有可用的图标名称
const getAllIcons = (): string[] => {
  const allIcons: string[] = []

  // 从预定义的分类中获取图标，确保图标可用
  Object.values(iconCategories).forEach((categoryIcons) => {
    allIcons.push(...categoryIcons)
  })

  // 去重
  return [...new Set(allIcons)]
}

const allIcons = ref<string[]>([])

// 初始化图标列表
onMounted(() => {
  allIcons.value = getAllIcons()
})

// 过滤图标
const filteredIcons = computed(() => {
  let icons = allIcons.value

  // 按分类过滤
  if (activeCategory.value !== 'all') {
    const categoryIcons = iconCategories[activeCategory.value] || []
    icons = icons.filter((icon) => categoryIcons.includes(icon))
  }

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
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  color: #606266;
  transition: all 0.3s;
}

.icon-display:hover {
  border-color: #409eff;
  color: #409eff;
}

.icon-picker {
  padding: 16px;
}

.search-box {
  margin-bottom: 16px;
}

.category-tabs {
  margin-bottom: 16px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 16px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: #606266;
  transition: all 0.3s;
  background: white;
}

.icon-item:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #f5f7fa;
  transform: scale(1.1);
}

.icon-item.selected {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
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
  background: #f1f1f1;
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
