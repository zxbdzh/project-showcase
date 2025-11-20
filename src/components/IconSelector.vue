<template>
  <div class="icon-selector">
    <el-form-item :label="label" :required="required">
      <div class="icon-selector-container">
        <!-- 当前选中的图标预览 -->
        <div class="current-icon" @click="showSelector = !showSelector">
          <component
            :is="currentIcon"
            v-if="currentIcon"
            :size="24"
            :icon="getCurrentIconProps()?.icon || ''"
            v-bind="getCurrentIconProps()"
          />
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

          <!-- 图标库选择 -->
          <div class="library-tabs">
            <el-tabs v-model="activeLibrary" @tab-change="handleLibraryChange">
              <el-tab-pane label="Font Awesome" name="fontawesome" />
              <el-tab-pane label="Element Plus" name="elementplus" />
              <el-tab-pane label="Lucide" name="lucide" />
            </el-tabs>
          </div>

          <!-- 分类标签 -->
          <div class="category-tabs">
            <el-tabs v-model="activeCategory" @tab-change="filterIcons">
              <el-tab-pane
                v-for="category in currentCategories"
                :key="category.key"
                :label="category.name"
                :name="category.key"
              />
            </el-tabs>
          </div>

          <!-- 工具栏 -->
          <div class="icon-toolbar">
            <div class="toolbar-left">
              <el-button-group>
                <el-button
                  size="small"
                  :type="viewMode === 'grid' ? 'primary' : 'default'"
                  @click="viewMode = 'grid'"
                >
                  <el-icon><Grid /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  :type="viewMode === 'list' ? 'primary' : 'default'"
                  @click="viewMode = 'list'"
                >
                  <el-icon><List /></el-icon>
                </el-button>
              </el-button-group>
              <el-switch
                v-model="showRecent"
                size="small"
                active-text="最近使用"
                inactive-text="全部图标"
              />
            </div>
            <div class="toolbar-right">
              <el-button size="small" @click="clearRecent"> 清除历史 </el-button>
            </div>
          </div>

          <!-- 图标网格 -->
          <div class="icon-grid" :class="{ 'list-view': viewMode === 'list' }">
            <div
              v-for="icon in displayIcons"
              :key="icon.name"
              class="icon-item"
              :class="{
                'is-selected': selectedIcon === icon.name,
                'is-favorite': favoriteIcons.includes(icon.name),
                'is-recent': recentIcons.includes(icon.name),
              }"
              @click="selectIcon(icon)"
              @mouseenter="showIconPreview(icon)"
              @mouseleave="hideIconPreview"
            >
              <div class="icon-wrapper">
                <component
                  :is="icon.component"
                  v-bind="icon.props"
                  :size="viewMode === 'list' ? 16 : 20"
                  :icon="icon.props?.icon || ''"
                />
                <div class="icon-actions">
                  <el-button
                    size="small"
                    text
                    @click.stop="toggleFavorite(icon.name)"
                    :class="{ 'is-favorite': favoriteIcons.includes(icon.name) }"
                  >
                    <el-icon><Star /></el-icon>
                  </el-button>
                  <el-button size="small" text @click.stop="copyIconName(icon.name)">
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>
              </div>
              <span class="icon-name">{{ icon.displayName }}</span>
              <span v-if="recentIcons.includes(icon.name)" class="recent-badge">最近</span>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>加载图标中...</span>
          </div>

          <!-- 无结果状态 -->
          <div v-if="!loading && filteredIcons.length === 0" class="no-results">
            <el-icon>
              <Close />
            </el-icon>
            <span>未找到匹配的图标</span>
          </div>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, markRaw, defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  Search,
  Loading,
  Grid,
  List,
  Star,
  DocumentCopy,
  Plus,
  Edit,
  Delete,
  Folder,
  Monitor,
  Phone,
  Setting,
  Tools,
  TrendCharts,
  DataBoard,
  Link,
  Message,
  Location,
  User,
  ArrowLeft,
  ArrowUp,
  ArrowRight,
  Bell,
  Lock,
  Key,
  Check,
  Close,
  Refresh,
  Download,
  Upload,
  Share,
  Camera,
  Picture,
  Calendar,
  Clock,
  Position,
  Compass,
  Flag,
  Warning,
  InfoFilled,
  SuccessFilled,
  CircleCloseFilled,
} from '@element-plus/icons-vue'

// 异步导入Lucide图标
import * as LucideIcons from 'lucide-vue-next'

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
const activeLibrary = ref('fontawesome')
const activeCategory = ref('all')
const selectedIcon = ref(props.modelValue)
const loading = ref(false)
const allIcons = ref<
  Array<{
    name: string
    displayName: string
    component: unknown
    props?: Record<string, unknown>
    category: string
    library: string
  }>
>([])
const viewMode = ref<'grid' | 'list'>('grid')
const showRecent = ref(false)
const favoriteIcons = ref<string[]>([])
const recentIcons = ref<string[]>([])

// Font Awesome 图标分类
const fontAwesomeCategories = [
  { key: 'all', name: '全部' },
  { key: 'solid', name: '实心图标' },
  { key: 'regular', name: '空心图标' },
  { key: 'brands', name: '品牌图标' },
  { key: 'arrows', name: '箭头' },
  { key: 'interface', name: '界面' },
  { key: 'media', name: '媒体' },
  { key: 'files', name: '文件' },
  { key: 'communication', name: '通讯' },
  { key: 'business', name: '商务' },
  { key: 'development', name: '开发' },
  { key: 'social', name: '社交' },
  { key: 'weather', name: '天气' },
  { key: 'maps', name: '地图' },
  { key: 'accessibility', name: '无障碍' },
]

// Element Plus 图标分类
const elementPlusCategories = [
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

// Lucide 图标分类
const lucideCategories = [
  { key: 'all', name: '全部' },
  { key: 'arrows', name: '箭头' },
  { key: 'interface', name: '界面' },
  { key: 'media', name: '媒体' },
  { key: 'files', name: '文件' },
  { key: 'communication', name: '通讯' },
  { key: 'business', name: '商务' },
  { key: 'development', name: '开发' },
  { key: 'design', name: '设计' },
  { key: 'social', name: '社交' },
  { key: 'weather', name: '天气' },
  { key: 'maps', name: '地图' },
  { key: 'accessibility', name: '无障碍' },
]

// 计算当前分类
const currentCategories = computed(() => {
  switch (activeLibrary.value) {
    case 'fontawesome':
      return fontAwesomeCategories
    case 'elementplus':
      return elementPlusCategories
    case 'lucide':
      return lucideCategories
    default:
      return fontAwesomeCategories
  }
})

// Element Plus 图标映射
const elementPlusIcons: Record<string, unknown> = {
  // 箭头
  ArrowUp: markRaw(ArrowUp),
  ArrowDown: markRaw(ArrowDown),
  ArrowLeft: markRaw(ArrowLeft),
  ArrowRight: markRaw(ArrowRight),

  // 界面
  Plus: markRaw(Plus),
  Edit: markRaw(Edit),
  Delete: markRaw(Delete),
  Close: markRaw(Close),
  Check: markRaw(Check),
  Star: markRaw(Star),
  Flag: markRaw(Flag),
  Bell: markRaw(Bell),
  Lock: markRaw(Lock),
  Key: markRaw(Key),
  Setting: markRaw(Setting),
  Grid: markRaw(Grid),
  List: markRaw(List),

  // 媒体
  Camera: markRaw(Camera),
  Picture: markRaw(Picture),

  // 文件
  Folder: markRaw(Folder),
  DocumentCopy: markRaw(DocumentCopy),

  // 通讯
  Message: markRaw(Message),
  Phone: markRaw(Phone),
  Share: markRaw(Share),

  // 商务
  TrendCharts: markRaw(TrendCharts),
  DataBoard: markRaw(DataBoard),
  Calendar: markRaw(Calendar),
  Clock: markRaw(Clock),

  // 开发
  Tools: markRaw(Tools),
  Monitor: markRaw(Monitor),
  Download: markRaw(Download),
  Upload: markRaw(Upload),
  Refresh: markRaw(Refresh),

  // 社交
  User: markRaw(User),
  Position: markRaw(Position),
  Compass: markRaw(Compass),
  Link: markRaw(Link),
  Location: markRaw(Location),

  // 其他
  Warning: markRaw(Warning),
  InfoFilled: markRaw(InfoFilled),
  SuccessFilled: markRaw(SuccessFilled),
  CircleCloseFilled: markRaw(CircleCloseFilled),
}

// Element Plus 图标分类映射
const elementPlusCategoryMap: Record<string, string[]> = {
  arrows: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
  ui: [
    'Plus',
    'Edit',
    'Delete',
    'Close',
    'Check',
    'Star',
    'Flag',
    'Bell',
    'Lock',
    'Key',
    'Setting',
    'Grid',
    'List',
  ],
  media: ['Camera', 'Picture'],
  files: ['Folder', 'DocumentCopy'],
  communication: ['Message', 'Phone', 'Share'],
  business: ['TrendCharts', 'DataBoard', 'Calendar', 'Clock'],
  development: ['Tools', 'Monitor', 'Download', 'Upload', 'Refresh'],
  design: ['Picture'],
  social: ['User', 'Position', 'Compass', 'Link', 'Location'],
}

// Font Awesome 图标分类映射
const fontAwesomeCategoryMap: Record<string, string[]> = {
  solid: ['faHome', 'faUser', 'faHeart', 'faStar', 'faCheck', 'faTimes', 'faPlus', 'faMinus'],
  regular: ['farUser', 'farHeart', 'farStar', 'farCheckCircle', 'farTimesCircle', 'farPlusSquare'],
  brands: ['faGithub', 'faTwitter', 'faFacebook', 'faLinkedin', 'faInstagram', 'faYoutube'],
  arrows: ['faArrowUp', 'faArrowDown', 'faArrowLeft', 'faArrowRight', 'faArrowCircleUp'],
  interface: ['faCog', 'faBars', 'faEllipsisH', 'faEllipsisV', 'faExpand', 'faCompress'],
  media: ['faPlay', 'faPause', 'faStop', 'faVolumeUp', 'faVolumeDown', 'faVolumeMute'],
  files: ['faFile', 'faFolder', 'faFileAlt', 'faFileCode', 'faFileImage', 'faFilePdf'],
  communication: ['faEnvelope', 'faPhone', 'faComment', 'faComments', 'faShare', 'faShareAlt'],
  business: [
    'faChartBar',
    'faChartLine',
    'faChartPie',
    'faDollarSign',
    'faShoppingCart',
    'faCreditCard',
  ],
  development: ['faCode', 'faTerminal', 'faDatabase', 'faServer', 'faCloud', 'faGit'],
  social: ['faUser', 'faUsers', 'faUserFriends', 'faUserCircle', 'faAddressBook', 'faIdCard'],
  weather: ['faSun', 'faCloud', 'faCloudRain', 'faSnowflake', 'faTemperatureHigh', 'faWind'],
  maps: ['faMap', 'faMapMarkerAlt', 'faCompass', 'faRoute', 'faStreetView', 'faGlobe'],
  accessibility: [
    'faWheelchair',
    'faUniversalAccess',
    'faAssistiveListeningSystems',
    'faSignLanguage',
  ],
}

// 计算属性
const currentIcon = computed(() => {
  if (!selectedIcon.value) return null

  // 解析图标名称，格式：library:iconName 或 iconName
  const [library, iconName] = selectedIcon.value.includes(':')
    ? selectedIcon.value.split(':')
    : ['elementplus', selectedIcon.value]

  switch (library) {
    case 'fontawesome':
      return markRaw(defineAsyncComponent(() => import('./FontAwesomeIcon.vue')))
    case 'elementplus':
      return elementPlusIcons[iconName]
    case 'lucide':
      return LucideIcons[iconName as keyof typeof LucideIcons]
    default:
      return null
  }
})

const filteredIcons = computed(() => {
  let icons = allIcons.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    const categoryMap = getCategoryMap(activeLibrary.value)
    const categoryIcons = categoryMap[activeCategory.value] || []
    icons = icons.filter((icon) => categoryIcons.includes(icon.name))
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter(
      (icon) =>
        icon.name.toLowerCase().includes(query) || icon.displayName.toLowerCase().includes(query),
    )
  }

  return icons
})

const displayIcons = computed(() => {
  const icons = filteredIcons.value

  // 如果显示最近使用，优先显示最近使用的图标
  if (showRecent.value && recentIcons.value.length > 0) {
    const recentIconObjects = recentIcons.value
      .map((name) => icons.find((icon) => icon.name === name))
      .filter((icon): icon is NonNullable<typeof icon> => icon !== undefined)

    const otherIcons = icons.filter((icon) => !recentIcons.value.includes(icon.name))

    return [...recentIconObjects, ...otherIcons]
  }

  return icons
})

// 获取当前图标的属性
const getCurrentIconProps = () => {
  if (!selectedIcon.value) return {}

  const [library, iconName] = selectedIcon.value.includes(':')
    ? selectedIcon.value.split(':')
    : ['elementplus', selectedIcon.value]

  if (library === 'fontawesome') {
    // 从 allIcons 中查找对应的图标
    const icon = allIcons.value.find((icon) => icon.name === selectedIcon.value)
    return icon?.props || {}
  }

  return {}
}

// 获取分类映射
const getCategoryMap = (library: string): Record<string, string[]> => {
  switch (library) {
    case 'fontawesome':
      return fontAwesomeCategoryMap
    case 'elementplus':
      return elementPlusCategoryMap
    case 'lucide':
      return {} // Lucide 图标需要动态分类
    default:
      return {}
  }
}

// 方法
const loadIcons = async () => {
  loading.value = true
  try {
    let icons: Array<{
      name: string
      displayName: string
      component: unknown
      props?: any
      category: string
      library: string
    }> = []

    switch (activeLibrary.value) {
      case 'fontawesome':
        icons = loadFontAwesomeIcons()
        break
      case 'elementplus':
        icons = loadElementPlusIcons()
        break
      case 'lucide':
        icons = loadLucideIcons()
        break
    }

    allIcons.value = icons
  } catch (error) {
    console.error('Failed to load icons:', error)
    ElMessage.error('加载图标失败')
  } finally {
    loading.value = false
  }
}

const loadFontAwesomeIcons = () => {
  const icons: Array<{
    name: string
    displayName: string
    component: unknown
    props?: Record<string, unknown>
    category: string
    library: string
  }> = []

  // Solid icons
  const solidIcons = [
    'faHome',
    'faUser',
    'faHeart',
    'faStar',
    'faCheck',
    'faTimes',
    'faPlus',
    'faMinus',
    'faSearch',
    'faMenu',
    'faCog',
    'faEdit',
    'faTrash',
    'faSave',
    'faDownload',
    'faUpload',
    'faPlay',
    'faPause',
    'faStop',
    'faVolumeUp',
    'faVolumeDown',
    'faVolumeMute',
    'faFile',
    'faFolder',
    'faFileAlt',
    'faFileCode',
    'faFileImage',
    'faFilePdf',
    'faEnvelope',
    'faPhone',
    'faComment',
    'faComments',
    'faShare',
    'faShareAlt',
    'faChartBar',
    'faChartLine',
    'faChartPie',
    'faDollarSign',
    'faShoppingCart',
    'faCreditCard',
    'faCode',
    'faTerminal',
    'faDatabase',
    'faServer',
    'faCloud',
    'faGit',
    'faSun',
    'faCloud',
    'faCloudRain',
    'faSnowflake',
    'faTemperatureHigh',
    'faWind',
    'faMap',
    'faMapMarkerAlt',
    'faCompass',
    'faRoute',
    'faStreetView',
    'faGlobe',
    'faWheelchair',
    'faUniversalAccess',
    'faAssistiveListeningSystems',
    'faSignLanguage',
    'faArrowUp',
    'faArrowDown',
    'faArrowLeft',
    'faArrowRight',
    'faArrowCircleUp',
    'faBars',
    'faEllipsisH',
    'faEllipsisV',
    'faExpand',
    'faCompress',
  ]

  solidIcons.forEach((iconName) => {
    icons.push({
      name: `fontawesome:${iconName}`,
      displayName: iconName.replace('fa', ''),
      component: markRaw(defineAsyncComponent(() => import('./FontAwesomeIcon.vue'))),
      props: { icon: iconName, type: 'fas' },
      category: 'solid',
      library: 'fontawesome',
    })
  })

  // Regular icons
  const regularIcons = [
    'farUser',
    'farHeart',
    'farStar',
    'farCheckCircle',
    'farTimesCircle',
    'farPlusSquare',
    'farFile',
    'farFolder',
    'farFileAlt',
    'farFileImage',
    'farFilePdf',
    'farEnvelope',
    'farComment',
    'farComments',
    'farShare',
    'farShareAlt',
    'farChartBar',
    'farChartLine',
    'farChartPie',
    'farSun',
    'farCloud',
    'farSnowflake',
    'farMap',
    'farMapMarkerAlt',
    'farCompass',
    'farGlobe',
    'farWheelchair',
    'farUniversalAccess',
    'farAssistiveListeningSystems',
    'farSignLanguage',
    'farArrowUp',
    'farArrowDown',
    'farArrowLeft',
    'farArrowRight',
  ]

  regularIcons.forEach((iconName) => {
    icons.push({
      name: `fontawesome:${iconName}`,
      displayName: iconName.replace('far', ''),
      component: markRaw(defineAsyncComponent(() => import('./FontAwesomeIcon.vue'))),
      props: { icon: iconName, type: 'far' },
      category: 'regular',
      library: 'fontawesome',
    })
  })

  // Brand icons
  const brandIcons = [
    'faGithub',
    'faTwitter',
    'faFacebook',
    'faLinkedin',
    'faInstagram',
    'faYoutube',
    'faChrome',
    'faFirefox',
    'faSafari',
    'faEdge',
    'faOpera',
    'faInternetExplorer',
    'faApple',
    'faMicrosoft',
    'faGoogle',
    'faAmazon',
    'faPaypal',
    'faStripe',
    'faBitcoin',
    'faEthereum',
    'faDiscord',
    'faSlack',
    'faTelegram',
    'faWhatsapp',
    'faVuejs',
    'faReact',
    'faAngular',
    'faNodeJs',
    'faNpm',
    'faYarn',
    'faLinux',
    'faWindows',
    'faAndroid',
    'faApple',
    'faDocker',
    'faKubernetes',
  ]

  brandIcons.forEach((iconName) => {
    icons.push({
      name: `fontawesome:${iconName}`,
      displayName: iconName.replace('fa', ''),
      component: markRaw(defineAsyncComponent(() => import('./FontAwesomeIcon.vue'))),
      props: { icon: iconName, type: 'fab' },
      category: 'brands',
      library: 'fontawesome',
    })
  })

  return icons
}

const loadElementPlusIcons = () => {
  return Object.entries(elementPlusIcons).map(([name, component]) => {
    // 确定图标分类
    let category = 'all'
    for (const [catName, iconList] of Object.entries(elementPlusCategoryMap)) {
      if (iconList.includes(name)) {
        category = catName
        break
      }
    }

    return {
      name: `elementplus:${name}`,
      displayName: name,
      component,
      category,
      library: 'elementplus',
    }
  })
}

const loadLucideIcons = () => {
  return Object.entries(LucideIcons).map(([name, component]) => {
    // 简单的分类逻辑
    let category = 'interface'
    if (name.includes('Arrow')) category = 'arrows'
    else if (name.includes('File') || name.includes('Folder')) category = 'files'
    else if (name.includes('Mail') || name.includes('Message') || name.includes('Phone'))
      category = 'communication'
    else if (name.includes('Chart') || name.includes('Trend')) category = 'business'
    else if (name.includes('Code') || name.includes('Terminal') || name.includes('Database'))
      category = 'development'
    else if (name.includes('User') || name.includes('Users') || name.includes('People'))
      category = 'social'
    else if (name.includes('Sun') || name.includes('Cloud') || name.includes('Rain'))
      category = 'weather'
    else if (name.includes('Map') || name.includes('Compass') || name.includes('Navigation'))
      category = 'maps'

    return {
      name: `lucide:${name}`,
      displayName: name,
      component: markRaw(component),
      category,
      library: 'lucide',
    }
  })
}

const handleLibraryChange = () => {
  activeCategory.value = 'all'
  searchQuery.value = ''
  loadIcons()
}

const filterIcons = () => {
  // 搜索和分类筛选会自动通过计算属性处理
}

const selectIcon = (icon: {
  name: string
  displayName: string
  component: unknown
  props?: any
  category: string
  library: string
}) => {
  selectedIcon.value = icon.name

  // 添加到最近使用
  addToRecent(icon.name)

  emit('update:modelValue', icon.name)
  emit('change', icon.name)
  showSelector.value = false
}

// 本地存储管理
const STORAGE_KEYS = {
  FAVORITES: 'icon-selector-favorites',
  RECENT: 'icon-selector-recent',
}

// 从本地存储加载数据
const loadFromStorage = () => {
  try {
    const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES)
    const recent = localStorage.getItem(STORAGE_KEYS.RECENT)

    if (favorites) {
      favoriteIcons.value = JSON.parse(favorites)
    }

    if (recent) {
      recentIcons.value = JSON.parse(recent)
    }
  } catch (error) {
    console.warn('Failed to load from storage:', error)
  }
}

// 保存到本地存储
const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteIcons.value))
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentIcons.value))
  } catch (error) {
    console.warn('Failed to save to storage:', error)
  }
}

// 添加到最近使用
const addToRecent = (iconName: string) => {
  const index = recentIcons.value.indexOf(iconName)
  if (index > -1) {
    recentIcons.value.splice(index, 1)
  }

  recentIcons.value.unshift(iconName)

  // 限制最近使用的数量
  if (recentIcons.value.length > 20) {
    recentIcons.value = recentIcons.value.slice(0, 20)
  }

  saveToStorage()
}

// 切换收藏状态
const toggleFavorite = (iconName: string) => {
  const index = favoriteIcons.value.indexOf(iconName)
  if (index > -1) {
    favoriteIcons.value.splice(index, 1)
    ElMessage.success('已取消收藏')
  } else {
    favoriteIcons.value.push(iconName)
    ElMessage.success('已添加收藏')
  }
  saveToStorage()
}

// 清除最近使用
const clearRecent = () => {
  recentIcons.value = []
  saveToStorage()
  ElMessage.success('已清除历史记录')
}

// 复制图标名称
const copyIconName = async (iconName: string) => {
  try {
    await navigator.clipboard.writeText(iconName)
    ElMessage.success('图标名称已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = iconName
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('图标名称已复制到剪贴板')
  }
}

// 显示图标预览
const showIconPreview = (icon: {
  name: string
  displayName: string
  component: unknown
  props?: any
  category: string
  library: string
}) => {
  // 这里可以实现预览功能，比如显示大图标预览
  console.log('Preview icon:', icon.name)
}

// 隐藏图标预览
const hideIconPreview = () => {
  // 隐藏预览
  console.log('Hide preview')
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
  loadFromStorage()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.icon-selector {
  width: 100%;
  min-width: 300px;
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
  z-index: 2000;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 600px;
  overflow: hidden;
  margin-top: 4px;
  width: 100%;
  min-width: 350px;
  max-width: 600px;
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.library-tabs,
.category-tabs {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.library-tabs :deep(.el-tabs__header),
.category-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.library-tabs :deep(.el-tabs__nav-wrap),
.category-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 12px;
}

.library-tabs :deep(.el-tabs__item),
.category-tabs :deep(.el-tabs__item) {
  padding: 0 16px;
  font-size: 12px;
}

.icon-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.icon-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.icon-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.icon-item:hover .icon-actions {
  opacity: 1;
}

.icon-actions .el-button {
  padding: 2px;
  min-height: 24px;
  width: 24px;
}

.icon-actions .el-button.is-favorite {
  color: var(--el-color-warning);
}

.recent-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--el-color-success);
  color: white;
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: bold;
}

/* 列表视图样式 */
.icon-grid.list-view {
  grid-template-columns: 1fr;
  gap: 4px;
}

.icon-grid.list-view .icon-item {
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
}

.icon-grid.list-view .icon-wrapper {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.icon-grid.list-view .icon-name {
  margin: 0;
  font-size: 12px;
  text-align: left;
  flex: 1;
}

.icon-grid.list-view .icon-actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  padding: 12px;
  max-height: 350px;
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
    max-height: 500px;
    min-width: 300px;
  }

  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 6px;
    padding: 8px;
    max-height: 300px;
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
