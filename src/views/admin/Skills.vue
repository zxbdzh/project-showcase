<template>
  <div class="admin-skills">
    <!-- 页面头部 -->
    <header class="admin-skills__header">
      <div class="admin-skills__header-content">
        <h1 class="admin-skills__title">
          <glitch-text text="SKILL MANAGEMENT" />
        </h1>
        <p class="admin-skills__subtitle">管理个人技能</p>
      </div>
      <div class="admin-skills__actions">
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建技能
        </el-button>
      </div>
    </header>

    <!-- 搜索和筛选 -->
    <section class="admin-skills__filters">
      <div class="admin-skills__filters-content">
        <div class="admin-skills__search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索技能名称..."
            size="large"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="admin-skills__filter-controls">
          <el-select
            v-model="categoryFilter"
            placeholder="技能分类"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option label="前端开发" value="frontend" />
            <el-option label="后端开发" value="backend" />
            <el-option label="数据库" value="database" />
            <el-option label="运维部署" value="devops" />
            <el-option label="设计工具" value="design" />
            <el-option label="其他" value="other" />
          </el-select>

          <el-select v-model="levelFilter" placeholder="技能水平" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="初级" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
            <el-option label="专家" value="expert" />
          </el-select>
        </div>
      </div>
    </section>

    <!-- 技能列表 -->
    <section class="admin-skills__list">
      <div class="admin-skills__list-content">
        <el-row :gutter="20">
          <el-col v-for="skill in filteredSkills" :key="skill.id" :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="skill-card" shadow="hover">
              <div class="skill-card__header">
                <div class="skill-card__icon" :style="{ backgroundColor: skill.color }">
                  <el-icon :size="24">
                    <component :is="getSkillIcon(skill.icon)" />
                  </el-icon>
                </div>
                <div class="skill-card__actions">
                  <el-dropdown @command="handleSkillAction">
                    <el-button text>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :command="{ action: 'edit', skill }">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'delete', skill }" divided>
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="skill-card__content">
                <h3 class="skill-card__title">{{ skill.name }}</h3>
                <div class="skill-card__category">
                  <el-tag size="small" type="info">
                    {{ getCategoryText(skill.category) }}
                  </el-tag>
                </div>

                <div class="skill-card__level">
                  <div class="level-label">技能水平</div>
                  <div class="level-bar">
                    <div
                      class="level-progress"
                      :style="{
                        width: `${getLevelPercentage(skill.level)}%`,
                        backgroundColor: skill.color,
                      }"
                    ></div>
                  </div>
                  <div class="level-text">{{ getLevelText(skill.level) }}</div>
                </div>

                <div class="skill-card__stats">
                  <div class="stat-item">
                    <span class="stat-label">经验年限</span>
                    <span class="stat-value">{{ skill.years_experience }}年</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">项目数量</span>
                    <span class="stat-value">{{ skill.projects_count || 0 }}</span>
                  </div>
                </div>

                <div class="skill-card__footer">
                  <el-input-number
                    v-model="skill.sort_order"
                    :min="0"
                    :max="999"
                    size="small"
                    @change="handleSortOrderChange(skill)"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 空状态 -->
        <el-empty v-if="filteredSkills.length === 0 && !loading" description="暂无技能数据">
          <el-button type="primary" @click="showCreateDialog = true"> 创建第一个技能 </el-button>
        </el-empty>
      </div>
    </section>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingSkill ? '编辑技能' : '新建技能'"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="技能名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入技能名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技能分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择分类">
                <el-option label="前端开发" value="frontend" />
                <el-option label="后端开发" value="backend" />
                <el-option label="数据库" value="database" />
                <el-option label="运维部署" value="devops" />
                <el-option label="设计工具" value="design" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="技能水平" prop="level">
              <el-select v-model="formData.level" placeholder="请选择水平">
                <el-option label="初级" value="beginner" />
                <el-option label="中级" value="intermediate" />
                <el-option label="高级" value="advanced" />
                <el-option label="专家" value="expert" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经验年限" prop="years_experience">
              <el-input-number
                v-model="formData.years_experience"
                :min="0"
                :max="50"
                placeholder="年"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="技能图标" prop="icon">
              <el-select v-model="formData.icon" placeholder="请选择图标">
                <el-option
                  v-for="icon in iconOptions"
                  :key="icon.value"
                  :label="icon.label"
                  :value="icon.value"
                >
                  <div style="display: flex; align-items: center; gap: 8px">
                    <el-icon><component :is="icon.component" /></el-icon>
                    <span>{{ icon.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技能颜色" prop="color">
              <el-color-picker v-model="formData.color" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="formData.sort_order" :min="0" :max="999" placeholder="排序值" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingSkill ? '更新' : '创建' }}
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
  Monitor,
  Setting,
  DataBoard,
  Tools,
  TrendCharts,
  Document,
  Phone,
  Star,
} from '@element-plus/icons-vue'
import GlitchText from '@/components/GlitchText.vue'

// 响应式数据
const searchQuery = ref('')
const categoryFilter = ref('')
const levelFilter = ref('')
const loading = ref(false)
const showCreateDialog = ref(false)
const editingSkill = ref(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 模拟技能数据
const skills = ref([
  {
    id: 1,
    name: 'Vue.js',
    category: 'frontend',
    level: 'advanced',
    years_experience: 3,
    projects_count: 8,
    icon: 'Star',
    color: '#409EFF',
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Node.js',
    category: 'backend',
    level: 'intermediate',
    years_experience: 2,
    projects_count: 5,
    icon: 'Setting',
    color: '#67C23A',
    sort_order: 2,
  },
  {
    id: 3,
    name: 'MongoDB',
    category: 'database',
    level: 'intermediate',
    years_experience: 2,
    projects_count: 4,
    icon: 'DataBoard',
    color: '#E6A23C',
    sort_order: 3,
  },
  {
    id: 4,
    name: 'Docker',
    category: 'devops',
    level: 'advanced',
    years_experience: 3,
    projects_count: 6,
    icon: 'Tools',
    color: '#F56C6C',
    sort_order: 4,
  },
])

// 表单数据
const formData = reactive({
  name: '',
  category: '',
  level: '',
  years_experience: 0,
  icon: '',
  color: '#409EFF',
  sort_order: 0,
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入技能名称', trigger: 'blur' },
    { min: 2, max: 30, message: '名称长度在 2 到 30 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择技能分类', trigger: 'change' }],
  level: [{ required: true, message: '请选择技能水平', trigger: 'change' }],
  years_experience: [{ required: true, message: '请输入经验年限', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择技能图标', trigger: 'change' }],
  color: [{ required: true, message: '请选择技能颜色', trigger: 'change' }],
}

// 图标选项
const iconOptions = [
  { label: '星星', value: 'Star', component: markRaw(Star) },
  { label: '显示器', value: 'Monitor', component: markRaw(Monitor) },
  { label: '设置', value: 'Setting', component: markRaw(Setting) },
  { label: '数据板', value: 'DataBoard', component: markRaw(DataBoard) },
  { label: '工具', value: 'Tools', component: markRaw(Tools) },
  { label: '趋势图', value: 'TrendCharts', component: markRaw(TrendCharts) },
  { label: '文档', value: 'Document', component: markRaw(Document) },
  { label: '手机', value: 'Phone', component: markRaw(Phone) },
]

// 计算属性
const filteredSkills = computed(() => {
  let result = skills.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((skill) => skill.name.toLowerCase().includes(query))
  }

  // 分类过滤
  if (categoryFilter.value) {
    result = result.filter((skill) => skill.category === categoryFilter.value)
  }

  // 水平过滤
  if (levelFilter.value) {
    result = result.filter((skill) => skill.level === levelFilter.value)
  }

  return result
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const getSkillIcon = (iconName: string) => {
  const icon = iconOptions.find((option) => option.value === iconName)
  return icon ? icon.component : markRaw(Star)
}

const getCategoryText = (category: string) => {
  const categoryMap = {
    frontend: '前端开发',
    backend: '后端开发',
    database: '数据库',
    devops: '运维部署',
    design: '设计工具',
    other: '其他',
  }
  return categoryMap[category] || category
}

const getLevelText = (level: string) => {
  const levelMap = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    expert: '专家',
  }
  return levelMap[level] || level
}

const getLevelPercentage = (level: string) => {
  const levelMap = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  }
  return levelMap[level] || 0
}

const handleSkillAction = async ({ action, skill }) => {
  switch (action) {
    case 'edit':
      editSkill(skill)
      break
    case 'delete':
      await deleteSkill(skill)
      break
  }
}

const editSkill = (skill) => {
  editingSkill.value = skill
  Object.assign(formData, {
    name: skill.name,
    category: skill.category,
    level: skill.level,
    years_experience: skill.years_experience,
    icon: skill.icon,
    color: skill.color,
    sort_order: skill.sort_order,
  })
  showCreateDialog.value = true
}

const deleteSkill = async (skill) => {
  try {
    await ElMessageBox.confirm(`确定要删除技能 "${skill.name}" 吗？此操作不可恢复。`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 这里应该调用API删除技能
    const index = skills.value.findIndex((s) => s.id === skill.id)
    if (index > -1) {
      skills.value.splice(index, 1)
    }

    ElMessage.success('技能删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除技能失败')
    }
  }
}

const handleSortOrderChange = async (skill) => {
  try {
    // 这里应该调用API更新排序
    ElMessage.success('排序更新成功')
  } catch (error) {
    ElMessage.error('更新排序失败')
  }
}

const handleDialogClose = () => {
  showCreateDialog.value = false
  editingSkill.value = null
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    category: '',
    level: '',
    years_experience: 0,
    icon: '',
    color: '#409EFF',
    sort_order: 0,
  })
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingSkill.value) {
      // 更新技能
      const index = skills.value.findIndex((s) => s.id === editingSkill.value.id)
      if (index > -1) {
        skills.value[index] = {
          ...skills.value[index],
          ...formData,
        }
      }
      ElMessage.success('技能更新成功')
    } else {
      // 创建技能
      const newSkill = {
        id: Date.now(),
        ...formData,
        projects_count: 0,
      }
      skills.value.push(newSkill)
      ElMessage.success('技能创建成功')
    }

    handleDialogClose()
  } catch (error) {
    ElMessage.error(editingSkill.value ? '更新技能失败' : '创建技能失败')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  // 这里可以加载技能数据
})
</script>

<style scoped>
.admin-skills {
  min-height: 100vh;
  background: var(--bg-primary);
}

.admin-skills__header {
  padding: 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-skills__header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-skills__title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.admin-skills__subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.admin-skills__filters {
  padding: 2rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-skills__filters-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.admin-skills__search {
  flex: 1;
  min-width: 300px;
}

.admin-skills__filter-controls {
  display: flex;
  gap: 1rem;
}

.admin-skills__list {
  padding: 2rem;
  background: var(--bg-primary);
}

.admin-skills__list-content {
  max-width: 1200px;
  margin: 0 auto;
}

.skill-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.skill-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.skill-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.skill-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.skill-card__actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.skill-card:hover .skill-card__actions {
  opacity: 1;
}

.skill-card__content {
  flex: 1;
}

.skill-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.skill-card__category {
  margin-bottom: 1rem;
}

.skill-card__level {
  margin-bottom: 1rem;
}

.level-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.level-bar {
  width: 100%;
  height: 6px;
  background: var(--border-primary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.level-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.level-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.skill-card__stats {
  display: flex;
  justify-content: space-between;
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
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.skill-card__footer {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-skills__header {
    padding: 1.5rem 1rem;
  }

  .admin-skills__header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-skills__title {
    font-size: 1.5rem;
  }

  .admin-skills__filters {
    padding: 1.5rem 1rem;
  }

  .admin-skills__filters-content {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-skills__search {
    min-width: auto;
  }

  .admin-skills__filter-controls {
    flex-direction: column;
  }

  .admin-skills__list {
    padding: 1.5rem 1rem;
  }

  .skill-card__header {
    margin-bottom: 0.75rem;
  }

  .skill-card__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .skill-card__title {
    font-size: 1rem;
  }
}
</style>
