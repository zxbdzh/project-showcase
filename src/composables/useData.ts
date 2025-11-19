import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  projectService,
  categoryService,
  tagService,
  skillService,
  socialLinkService,
  profileService,
  systemSettingsService,
  type Project,
  type Category,
  type Tag,
  type Skill,
  type SocialLink,
  type Profile,
  type SystemSetting,
} from '@/services/database'

// 全局数据状态
const projects = ref<(Project & { categories: Category[]; tags: Tag[] })[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const skills = ref<Skill[]>([])
const socialLinks = ref<SocialLink[]>([])
const currentProfile = ref<Profile | null>(null)
const systemSettings = ref<SystemSetting[]>([])

// 加载状态
const loading = ref({
  projects: false,
  categories: false,
  tags: false,
  skills: false,
  socialLinks: false,
  profile: false,
  systemSettings: false,
})

// 错误状态
const error = ref<string | null>(null)

// 计算属性
const featuredProjects = computed(() => {
  console.log('featuredProjects computed - projects.value:', projects.value)

  // 如果有数据库中的项目数据，使用它们
  if (projects.value && projects.value.length > 0) {
    const filtered = projects.value.filter(
      (project) => project.featured && project.status === 'published',
    )
    console.log('featuredProjects computed - filtered:', filtered)
    return filtered
  }

  // 否则返回默认的项目数据
  // console.log('featuredProjects computed - using default data')
  // return [
  //   {
  //     id: '1',
  //     title: '项目展示系统',
  //     description: '基于 Vue 3 和 TypeScript 构建的现代化项目展示平台，支持响应式设计和主题切换。',
  //     content: '详细的项目介绍内容，包含技术栈、功能特性、实现思路等。',
  //     demo_url: 'https://demo.example.com',
  //     github_url: 'https://github.com',
  //     featured: true,
  //     status: 'published' as const,
  //     sort_order: 1,
  //     user_id: 'demo-user',
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //   },
  //   {
  //     id: '2',
  //     title: '企业管理系统',
  //     description: '全栈企业管理解决方案，包含用户管理、权限控制、数据可视化等功能模块。',
  //     content: '详细的项目介绍内容，包含技术栈、功能特性、实现思路等。',
  //     demo_url: 'https://demo.example.com',
  //     github_url: 'https://github.com',
  //     featured: true,
  //     status: 'published' as const,
  //     sort_order: 2,
  //     user_id: 'demo-user',
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //   },
  //   {
  //     id: '3',
  //     title: '数据可视化平台',
  //     description: '实时数据监控和可视化分析平台，支持多种图表类型和自定义仪表板。',
  //     content: '详细的项目介绍内容，包含技术栈、功能特性、实现思路等。',
  //     demo_url: 'https://demo.example.com',
  //     github_url: 'https://github.com',
  //     featured: true,
  //     status: 'published' as const,
  //     sort_order: 3,
  //     user_id: 'demo-user',
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //   },
  // ]
})

const publishedProjects = computed(() =>
  projects.value.filter((project) => project.status === 'published'),
)

const draftProjects = computed(() => projects.value.filter((project) => project.status === 'draft'))

const isLoading = computed(() => Object.values(loading.value).some((isLoading) => isLoading))

// 项目相关操作
export function useProjects() {
  const loadProjects = async (options?: {
    featured?: boolean
    status?: 'draft' | 'published' | 'archived'
    limit?: number
  }) => {
    loading.value.projects = true
    error.value = null

    try {
      const data = await projectService.getProjectsWithRelations(options)
      projects.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      ElMessage.error('加载项目失败')
      throw err
    } finally {
      loading.value.projects = false
    }
  }

  const createProject = async (data: Partial<Project>) => {
    try {
      const newProject = await projectService.createProject(data)
      // 重新加载项目数据以获取关联的分类和标签
      await loadProjects()
      ElMessage.success('项目创建成功')
      return newProject
    } catch (err: any) {
      ElMessage.error('创建项目失败')
      throw err
    }
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    try {
      const updatedProject = await projectService.updateProject(id, data)
      // 重新加载项目数据以获取关联的分类和标签
      await loadProjects()
      ElMessage.success('项目更新成功')
      return updatedProject
    } catch (err: any) {
      ElMessage.error('更新项目失败')
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id)
      projects.value = projects.value.filter((p) => p.id !== id)
      ElMessage.success('项目删除成功')
    } catch (err: any) {
      ElMessage.error('删除项目失败')
      throw err
    }
  }

  const getProject = async (id: string) => {
    try {
      return await projectService.getProject(id)
    } catch (err: any) {
      ElMessage.error('获取项目详情失败')
      throw err
    }
  }

  return {
    projects: computed(() => projects.value),
    featuredProjects,
    publishedProjects,
    draftProjects,
    loading: computed(() => loading.value.projects),
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  }
}

// 分类相关操作
export function useCategories() {
  const loadCategories = async () => {
    loading.value.categories = true
    error.value = null

    try {
      const data = await categoryService.getCategories()
      categories.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      ElMessage.error('加载分类失败')
      throw err
    } finally {
      loading.value.categories = false
    }
  }

  const createCategory = async (data: Partial<Category>) => {
    try {
      const newCategory = await categoryService.createCategory(data)
      categories.value.push(newCategory)
      ElMessage.success('分类创建成功')
      return newCategory
    } catch (err: any) {
      ElMessage.error('创建分类失败')
      throw err
    }
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      const updatedCategory = await categoryService.updateCategory(id, data)
      const index = categories.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      ElMessage.success('分类更新成功')
      return updatedCategory
    } catch (err: any) {
      ElMessage.error('更新分类失败')
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id)
      categories.value = categories.value.filter((c) => c.id !== id)
      ElMessage.success('分类删除成功')
    } catch (err: any) {
      ElMessage.error('删除分类失败')
      throw err
    }
  }

  return {
    categories: computed(() => categories.value),
    loading: computed(() => loading.value.categories),
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}

// 标签相关操作
export function useTags() {
  const loadTags = async () => {
    loading.value.tags = true
    error.value = null

    try {
      const data = await tagService.getTags()
      tags.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      ElMessage.error('加载标签失败')
      throw err
    } finally {
      loading.value.tags = false
    }
  }

  const createTag = async (data: Partial<Tag>) => {
    try {
      const newTag = await tagService.createTag(data)
      tags.value.push(newTag)
      ElMessage.success('标签创建成功')
      return newTag
    } catch (err: any) {
      ElMessage.error('创建标签失败')
      throw err
    }
  }

  const updateTag = async (id: string, data: Partial<Tag>) => {
    try {
      const updatedTag = await tagService.updateTag(id, data)
      const index = tags.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tags.value[index] = updatedTag
      }
      ElMessage.success('标签更新成功')
      return updatedTag
    } catch (err: any) {
      ElMessage.error('更新标签失败')
      throw err
    }
  }

  const deleteTag = async (id: string) => {
    try {
      await tagService.deleteTag(id)
      tags.value = tags.value.filter((t) => t.id !== id)
      ElMessage.success('标签删除成功')
    } catch (err: any) {
      ElMessage.error('删除标签失败')
      throw err
    }
  }

  return {
    tags: computed(() => tags.value),
    loading: computed(() => loading.value.tags),
    loadTags,
    createTag,
    updateTag,
    deleteTag,
  }
}

// 技能相关操作
export function useSkills() {
  const loadSkills = async () => {
    loading.value.skills = true
    error.value = null

    try {
      const data = await skillService.getSkills()
      skills.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      ElMessage.error('加载技能失败')
      throw err
    } finally {
      loading.value.skills = false
    }
  }

  const createSkill = async (data: Partial<Skill>) => {
    try {
      const newSkill = await skillService.createSkill(data)
      skills.value.push(newSkill)
      ElMessage.success('技能创建成功')
      return newSkill
    } catch (err: any) {
      ElMessage.error('创建技能失败')
      throw err
    }
  }

  const updateSkill = async (id: string, data: Partial<Skill>) => {
    try {
      const updatedSkill = await skillService.updateSkill(id, data)
      const index = skills.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        skills.value[index] = updatedSkill
      }
      ElMessage.success('技能更新成功')
      return updatedSkill
    } catch (err: any) {
      ElMessage.error('更新技能失败')
      throw err
    }
  }

  const deleteSkill = async (id: string) => {
    try {
      await skillService.deleteSkill(id)
      skills.value = skills.value.filter((s) => s.id !== id)
      ElMessage.success('技能删除成功')
    } catch (err: any) {
      ElMessage.error('删除技能失败')
      throw err
    }
  }

  return {
    skills: computed(() => skills.value),
    loading: computed(() => loading.value.skills),
    loadSkills,
    createSkill,
    updateSkill,
    deleteSkill,
  }
}

// 社交链接相关操作
export function useSocialLinks() {
  const loadSocialLinks = async () => {
    loading.value.socialLinks = true
    error.value = null

    try {
      const data = await socialLinkService.getSocialLinks()
      socialLinks.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      ElMessage.error('加载社交链接失败')
      throw err
    } finally {
      loading.value.socialLinks = false
    }
  }

  const createSocialLink = async (data: Partial<SocialLink>) => {
    try {
      const newLink = await socialLinkService.createSocialLink(data)
      socialLinks.value.push(newLink)
      ElMessage.success('社交链接创建成功')
      return newLink
    } catch (err: any) {
      ElMessage.error('创建社交链接失败')
      throw err
    }
  }

  const updateSocialLink = async (id: string, data: Partial<SocialLink>) => {
    try {
      const updatedLink = await socialLinkService.updateSocialLink(id, data)
      const index = socialLinks.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        socialLinks.value[index] = updatedLink
      }
      ElMessage.success('社交链接更新成功')
      return updatedLink
    } catch (err: any) {
      ElMessage.error('更新社交链接失败')
      throw err
    }
  }

  const deleteSocialLink = async (id: string) => {
    try {
      await socialLinkService.deleteSocialLink(id)
      socialLinks.value = socialLinks.value.filter((l) => l.id !== id)
      ElMessage.success('社交链接删除成功')
    } catch (err: any) {
      ElMessage.error('删除社交链接失败')
      throw err
    }
  }

  return {
    socialLinks: computed(() => socialLinks.value),
    loading: computed(() => loading.value.socialLinks),
    loadSocialLinks,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
  }
}

// 用户档案相关操作
export function useProfile() {
  const loadProfile = async (userId: string) => {
    loading.value.profile = true
    error.value = null

    try {
      const data = await profileService.getProfile(userId)
      currentProfile.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      ElMessage.error('加载用户档案失败')
      throw err
    } finally {
      loading.value.profile = false
    }
  }

  const updateProfile = async (userId: string, data: Partial<Profile>) => {
    try {
      const updatedProfile = await profileService.updateProfile(userId, data)
      currentProfile.value = updatedProfile
      ElMessage.success('档案更新成功')
      return updatedProfile
    } catch (err: any) {
      ElMessage.error('更新档案失败')
      throw err
    }
  }

  const createProfile = async (data: Partial<Profile>) => {
    try {
      const newProfile = await profileService.createProfile(data)
      currentProfile.value = newProfile
      ElMessage.success('档案创建成功')
      return newProfile
    } catch (err: any) {
      ElMessage.error('创建档案失败')
      throw err
    }
  }

  return {
    profile: computed(() => currentProfile.value),
    loading: computed(() => loading.value.profile),
    loadProfile,
    updateProfile,
    createProfile,
  }
}

// 全局数据加载
export function useData() {
  const loadAllData = async () => {
    try {
      await Promise.all([
        useProjects().loadProjects(),
        useCategories().loadCategories(),
        useTags().loadTags(),
        useSkills().loadSkills(),
        useSocialLinks().loadSocialLinks(),
      ])
      ElMessage.success('数据加载完成')
    } catch (err: any) {
      ElMessage.error('数据加载失败')
      throw err
    }
  }

  const refreshData = async () => {
    await loadAllData()
  }

  return {
    projects: computed(() => projects.value),
    categories: computed(() => categories.value),
    tags: computed(() => tags.value),
    skills: computed(() => skills.value),
    socialLinks: computed(() => socialLinks.value),
    profile: computed(() => currentProfile.value),
    loading: isLoading,
    error: computed(() => error.value),
    loadAllData,
    refreshData,
  }
}

// 系统设置相关操作
export function useSystemSettings() {
  const loadSystemSettings = async () => {
    loading.value.systemSettings = true
    error.value = null

    try {
      const data = await systemSettingsService.getSettings()
      systemSettings.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      ElMessage.error('加载系统设置失败')
      throw err
    } finally {
      loading.value.systemSettings = false
    }
  }

  const getSystemSetting = async (key: string) => {
    try {
      return await systemSettingsService.getSetting(key)
    } catch (err: any) {
      ElMessage.error('获取系统设置失败')
      throw err
    }
  }

  const updateSystemSetting = async (key: string, value: string, description?: string) => {
    try {
      const updatedSetting = await systemSettingsService.updateSetting(key, value, description)
      const index = systemSettings.value.findIndex((s) => s.key === key)
      if (index !== -1) {
        systemSettings.value[index] = updatedSetting
      } else {
        systemSettings.value.push(updatedSetting)
      }
      ElMessage.success('设置更新成功')
      return updatedSetting
    } catch (err: any) {
      ElMessage.error('更新设置失败')
      throw err
    }
  }

  const batchUpdateSystemSettings = async (
    settings: Record<string, { value: string; description?: string }>,
  ) => {
    loading.value.systemSettings = true
    error.value = null

    try {
      const results = await systemSettingsService.batchUpdateSettings(settings)

      // 更新本地状态
      for (const setting of results) {
        const index = systemSettings.value.findIndex((s) => s.key === setting.key)
        if (index !== -1) {
          systemSettings.value[index] = setting
        } else {
          systemSettings.value.push(setting)
        }
      }

      ElMessage.success('批量更新设置成功')
      return results
    } catch (err: any) {
      error.value = err.message
      ElMessage.error('批量更新设置失败')
      throw err
    } finally {
      loading.value.systemSettings = false
    }
  }

  const deleteSystemSetting = async (key: string) => {
    try {
      await systemSettingsService.deleteSetting(key)
      systemSettings.value = systemSettings.value.filter((s) => s.key !== key)
      ElMessage.success('设置删除成功')
    } catch (err: any) {
      ElMessage.error('删除设置失败')
      throw err
    }
  }

  // 获取设置值的便捷方法
  const getSettingValue = (key: string, defaultValue: string = ''): string => {
    const setting = systemSettings.value.find((s) => s.key === key)
    return setting?.value || defaultValue
  }

  return {
    systemSettings: computed(() => systemSettings.value),
    loading: computed(() => loading.value.systemSettings),
    loadSystemSettings,
    getSystemSetting,
    updateSystemSetting,
    batchUpdateSystemSettings,
    deleteSystemSetting,
    getSettingValue,
  }
}

// 初始化数据
export function initializeData() {
  onMounted(async () => {
    try {
      // 只加载公开数据，用户档案需要登录后加载
      await Promise.all([
        useProjects().loadProjects({ status: 'published', featured: true }),
        useCategories().loadCategories(),
        useTags().loadTags(),
        useSkills().loadSkills(),
        useSocialLinks().loadSocialLinks(),
        useSystemSettings().loadSystemSettings(),
      ])
    } catch (error) {
      console.error('Failed to initialize data:', error)
    }
  })
}
