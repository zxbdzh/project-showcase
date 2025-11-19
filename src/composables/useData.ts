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
import { useCache } from './useCache'

// 获取缓存实例
const cache = useCache()

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

  return []
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
      // 使用缓存装饰器
      const cacheKey = `projects:${JSON.stringify(options)}`
      const cachedProjects = cache.withCache(cacheKey, () =>
        projectService.getProjectsWithRelations(options),
      )()

      const data = await cachedProjects
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

      // 清除相关缓存
      cache.clearByPrefix('projects')

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

      // 清除相关缓存
      cache.clearByPrefix('projects')

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

      // 清除相关缓存
      cache.clearByPrefix('projects')

      projects.value = projects.value.filter((p) => p.id !== id)
      ElMessage.success('项目删除成功')
    } catch (err: any) {
      ElMessage.error('删除项目失败')
      throw err
    }
  }

  const getProject = async (id: string) => {
    try {
      // 使用缓存装饰器
      const cacheKey = `project:${id}`
      const cachedProject = cache.withCache(cacheKey, () => projectService.getProject(id))()

      return await cachedProject
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
      // 使用缓存装饰器
      const cacheKey = 'categories'
      const cachedCategories = cache.withCache(cacheKey, () => categoryService.getCategories())()

      const data = await cachedCategories
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

      // 清除相关缓存
      cache.clearByPrefix('categories')

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

      // 清除相关缓存
      cache.clearByPrefix('categories')

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

      // 清除相关缓存
      cache.clearByPrefix('categories')

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
      // 使用缓存装饰器
      const cacheKey = 'tags'
      const cachedTags = cache.withCache(cacheKey, () => tagService.getTags())()

      const data = await cachedTags
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

      // 清除相关缓存
      cache.clearByPrefix('tags')

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

      // 清除相关缓存
      cache.clearByPrefix('tags')

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

      // 清除相关缓存
      cache.clearByPrefix('tags')

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
      // 使用缓存装饰器
      const cacheKey = 'skills'
      const cachedSkills = cache.withCache(cacheKey, () => skillService.getSkills())()

      const data = await cachedSkills
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

      // 清除相关缓存
      cache.clearByPrefix('skills')

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

      // 清除相关缓存
      cache.clearByPrefix('skills')

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

      // 清除相关缓存
      cache.clearByPrefix('skills')

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
      // 使用缓存装饰器
      const cacheKey = 'social-links'
      const cachedSocialLinks = cache.withCache(cacheKey, () =>
        socialLinkService.getSocialLinks(),
      )()

      const data = await cachedSocialLinks
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

      // 清除相关缓存
      cache.clearByPrefix('social-links')

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

      // 清除相关缓存
      cache.clearByPrefix('social-links')

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

      // 清除相关缓存
      cache.clearByPrefix('social-links')

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
      // 使用缓存装饰器
      const cacheKey = `profile:${userId}`
      const cachedProfile = cache.withCache(cacheKey, () => profileService.getProfile(userId))()

      const data = await cachedProfile
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

      // 清除相关缓存
      cache.clearByPrefix(`profile:${userId}`)

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

      // 清除相关缓存
      cache.clearByPrefix('profile:')

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
    // 清除所有数据缓存
    cache.clearAll()
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
      // 使用缓存装饰器
      const cacheKey = 'system-settings'
      const cachedSettings = cache.withCache(cacheKey, () => systemSettingsService.getSettings())()

      const data = await cachedSettings
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
      // 使用缓存装饰器
      const cacheKey = `system-setting:${key}`
      const cachedSetting = cache.withCache(cacheKey, () => systemSettingsService.getSetting(key))()

      return await cachedSetting
    } catch (err: any) {
      ElMessage.error('获取系统设置失败')
      throw err
    }
  }

  const updateSystemSetting = async (key: string, value: string, description?: string) => {
    try {
      const updatedSetting = await systemSettingsService.updateSetting(key, value, description)

      // 清除相关缓存
      cache.clearByPrefix('system-settings')
      cache.clearByPrefix(`system-setting:${key}`)

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

      // 清除相关缓存
      cache.clearByPrefix('system-settings')

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

      // 清除相关缓存
      cache.clearByPrefix('system-settings')
      cache.clearByPrefix(`system-setting:${key}`)

      systemSettings.value = systemSettings.value.filter((s) => s.key !== key)
      ElMessage.success('设置删除成功')
    } catch (err: any) {
      ElMessage.error('删除设置失败')
      throw err
    }
  }

  // 获取设置值的便捷方法
  const getSettingValue = (key: string, defaultValue: string = ''): string => {
    // 确保systemSettings.value是数组
    if (!Array.isArray(systemSettings.value)) {
      console.warn('systemSettings.value is not an array:', systemSettings.value)
      return defaultValue
    }

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

      // 系统设置加载完成后，应用设置到页面
      const { getSettingValue } = useSystemSettings()

      // 应用favicon（使用博客园推荐的方法）
      const favicon = getSettingValue('site_favicon', '')

      if (favicon) {
        // 使用博客园推荐的方法：直接查找并更新现有的favicon
        let $favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement

        if ($favicon !== null) {
          // 如果存在现有的favicon，直接更新href
          $favicon.href = favicon
          console.log('Initial existing favicon updated:', favicon)
        } else {
          // 如果不存在，创建新的favicon元素
          $favicon = document.createElement('link')
          $favicon.rel = 'icon'
          $favicon.type = 'image/x-icon'
          $favicon.href = favicon
          document.head.appendChild($favicon)
          console.log('Initial new favicon created:', favicon)
        }

        // 同时处理shortcut icon
        let $shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement
        if ($shortcutIcon !== null) {
          $shortcutIcon.href = favicon
          console.log('Initial existing shortcut icon updated:', favicon)
        } else {
          $shortcutIcon = document.createElement('link')
          $shortcutIcon.rel = 'shortcut icon'
          $shortcutIcon.type = 'image/x-icon'
          $shortcutIcon.href = favicon
          document.head.appendChild($shortcutIcon)
          console.log('Initial new shortcut icon created:', favicon)
        }

        // 额外的强制刷新技术
        setTimeout(() => {
          // 方法1: 使用Image对象预加载强制浏览器重新下载
          const img = new Image()
          img.onload = () => {
            console.log('Initial favicon preloaded successfully')
          }
          img.onerror = () => {
            console.log('Initial favicon preload failed')
          }
          img.src = favicon

          // 方法2: iframe隐藏加载技术强制刷新缓存
          const iframe = document.createElement('iframe')
          iframe.style.display = 'none'
          iframe.src = favicon
          document.body.appendChild(iframe)

          // 短暂延迟后移除iframe
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe)
            }
          }, 100)
        }, 50)

        // 方法3: 尝试强制刷新浏览器缓存
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => {
              registration.update()
            })
          })
        }

        console.log('Initial favicon update completed using blog garden method:', favicon)
      }

      // 应用页面标题
      const siteTitle = getSettingValue('site_title', '项目展示系统')
      if (siteTitle) {
        document.title = siteTitle
        console.log('Initial title applied:', siteTitle)
      }

      // 应用自定义CSS
      const customCSS = getSettingValue('custom_css', '')
      if (customCSS) {
        const style = document.createElement('style')
        style.id = 'custom-css'
        style.textContent = customCSS
        document.head.appendChild(style)
        console.log('Initial custom CSS applied')
      }

      // 应用meta标签
      const description = getSettingValue('site_description', '')
      if (description) {
        let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement
        if (!meta) {
          meta = document.createElement('meta')
          meta.name = 'description'
          document.head.appendChild(meta)
        }
        meta.content = description
      }

      const keywords = getSettingValue('seo_keywords', '')
      if (keywords) {
        let meta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement
        if (!meta) {
          meta = document.createElement('meta')
          meta.name = 'keywords'
          document.head.appendChild(meta)
        }
        meta.content = keywords
      }

      const author = getSettingValue('seo_author', '')
      if (author) {
        let meta = document.querySelector('meta[name="author"]') as HTMLMetaElement
        if (!meta) {
          meta = document.createElement('meta')
          meta.name = 'author'
          document.head.appendChild(meta)
        }
        meta.content = author
      }
    } catch (error) {
      console.error('Failed to initialize data:', error)
    }
  })
}
