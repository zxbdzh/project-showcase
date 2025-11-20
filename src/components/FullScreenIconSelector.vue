<template>
  <teleport to="body">
    <div v-if="visible" class="fullscreen-icon-selector" @click.self="close">
      <div class="fullscreen-icon-selector__content">
        <div class="fullscreen-icon-selector__header">
          <h2>选择图标</h2>
          <div class="fullscreen-icon-selector__search">
            <el-input
              v-model="searchQuery"
              placeholder="搜索图标..."
              size="large"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-button size="large" @click="close">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
        </div>

        <div class="fullscreen-icon-selector__body">
          <div class="fullscreen-icon-selector__categories">
            <el-button
              v-for="category in categories"
              :key="category.key"
              :type="activeCategory === category.key ? 'primary' : 'default'"
              @click="activeCategory = category.key"
            >
              {{ category.name }}
            </el-button>
          </div>

          <div class="fullscreen-icon-selector__icons">
            <div
              v-for="icon in filteredIcons"
              :key="icon.name"
              class="icon-item"
              :class="{ active: selectedIcon === icon.name }"
              @click="selectIcon(icon.name)"
            >
              <font-awesome-icon :icon="icon" size="2x" />
              <span class="icon-name">{{ icon.name }}</span>
            </div>
          </div>

          <div v-if="filteredIcons.length === 0" class="no-results">
            <el-empty description="没有找到匹配的图标" />
          </div>
        </div>

        <div class="fullscreen-icon-selector__footer">
          <div class="selected-preview">
            <span>已选择：</span>
            <font-awesome-icon v-if="selectedIcon" :icon="getSelectedIcon()" size="2x" />
            <span v-if="selectedIcon" class="selected-name">{{ selectedIcon }}</span>
          </div>
          <div class="actions">
            <el-button @click="clearSelection">清除选择</el-button>
            <el-button type="primary" @click="confirmSelection" :disabled="!selectedIcon">
              确认选择
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Close } from '@element-plus/icons-vue'
import { fas, far, fab } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface Props {
  visible: boolean
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const searchQuery = ref('')
const activeCategory = ref('fas')
const selectedIcon = ref(props.modelValue || '')

// 图标分类
const categories = [
  { key: 'fas', name: '实心图标' },
  { key: 'far', name: '空心图标' },
  { key: 'fab', name: '品牌图标' },
]

// 获取当前分类的图标
const currentIcons = computed(() => {
  const iconMap = {
    fas,
    far,
    fab,
  }
  return iconMap[activeCategory.value as keyof typeof iconMap] || fas
})

// 过滤后的图标
const filteredIcons = computed(() => {
  const icons = Object.values(currentIcons.value) as IconDefinition[]

  if (!searchQuery.value) {
    return icons
  }

  const query = searchQuery.value.toLowerCase()
  return icons.filter((icon) => icon.iconName && icon.iconName.toLowerCase().includes(query))
})

// 方法
const close = () => {
  emit('update:visible', false)
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const selectIcon = (iconName: string) => {
  selectedIcon.value = iconName
}

const clearSelection = () => {
  selectedIcon.value = ''
}

const confirmSelection = () => {
  if (selectedIcon.value) {
    emit('update:modelValue', selectedIcon.value)
    ElMessage.success('图标选择成功')
    close()
  }
}

const getSelectedIcon = (): IconDefinition => {
  const iconMap = {
    fas,
    far,
    fab,
  }

  // 尝试从所有图标库中查找选中的图标
  for (const library of Object.values(iconMap)) {
    const icon = library[selectedIcon.value as keyof typeof library]
    if (icon) {
      return icon as IconDefinition
    }
  }

  // 如果找不到，返回默认图标
  return fas.question as IconDefinition
}

// 监听 modelValue 变化
const { modelValue } = toRefs(props)
watch(modelValue, (newValue) => {
  if (newValue !== selectedIcon.value) {
    selectedIcon.value = newValue || ''
  }
})

// 生命周期
onMounted(() => {
  // 预加载图标数据
  console.log('Available icons count:', {
    fas: Object.keys(fas).length,
    far: Object.keys(far).length,
    fab: Object.keys(fab).length,
  })
})
</script>

<style scoped>
.fullscreen-icon-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.fullscreen-icon-selector__content {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.fullscreen-icon-selector__header {
  padding: 2rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 2rem;
  background: var(--bg-secondary);
}

.fullscreen-icon-selector__header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.fullscreen-icon-selector__search {
  flex: 1;
  max-width: 400px;
}

.fullscreen-icon-selector__body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fullscreen-icon-selector__categories {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.fullscreen-icon-selector__icons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.icon-item:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
}

.icon-item.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.icon-name {
  font-size: 0.75rem;
  text-align: center;
  word-break: break-all;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.fullscreen-icon-selector__footer {
  padding: 2rem;
  border-top: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
}

.selected-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selected-name {
  font-weight: 600;
  color: var(--color-primary);
}

.actions {
  display: flex;
  gap: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fullscreen-icon-selector__content {
    width: 95vw;
    height: 95vh;
  }

  .fullscreen-icon-selector__header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }

  .fullscreen-icon-selector__header h2 {
    font-size: 1.25rem;
  }

  .fullscreen-icon-selector__search {
    max-width: none;
    width: 100%;
  }

  .fullscreen-icon-selector__body {
    padding: 1.5rem;
  }

  .fullscreen-icon-selector__icons {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .icon-item {
    padding: 0.75rem;
  }

  .fullscreen-icon-selector__footer {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }

  .selected-preview {
    width: 100%;
    justify-content: center;
  }

  .actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
