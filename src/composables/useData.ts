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
  activityLogService,
  type Project,
  type Category,
  type Tag,
  type Skill,
  type SocialLink,
  type Profile,
  type SystemSetting,
  type ActivityLog,
} from '@/services/database'
import { useCache } from './useCache'
import { usePageLoading } from './usePageLoading'

// 获取缓存实例
const cache = useCache()

// 获取页面加载器实例
const { addTask, updateTask, updateMessage } = usePageLoading()

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

    // 添加加载任务
    const taskId = 'projects-load'
    addTask({
      id: taskId,
      name: '加载项目数据',
      priority: 1,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 使用缓存装饰器
      const cacheKey = `projects:${JSON.stringify(options)}`
      const cachedProjects = cache.withCache(
        cacheKey,
        () => projectService.getProjectsWithRelations(options),
        { key: cacheKey, dataType: 'projects' },
      )()

      const data = await cachedProjects
      projects.value = data

      // 更新任务状态
      updateTask(taskId, { status: 'completed', progress: 100 })
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载项目失败'
      error.value = errorMessage
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value.projects = false
    }
  }

  const createProject = async (data: Partial<Project>) => {
    // 添加创建任务
    const taskId = 'project-create'
    addTask({
      id: taskId,
      name: '创建项目',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      const newProject = await projectService.createProject(data)

      // 记录活动
      await activityLogService.createActivity(
        'create',
        'project',
        newProject.id,
        `创建了项目: ${newProject.title}`,
        { title: newProject.title }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('projects')

      // 重新加载项目数据以获取关联的分类和标签
      await loadProjects()

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('项目创建成功')
      return newProject
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '创建项目失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    // 添加更新任务
    const taskId = 'project-update'
    addTask({
      id: taskId,
      name: '更新项目',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取旧的项目数据用于比较
      const oldProject = projects.value.find((p) => p.id === id)

      const updatedProject = await projectService.updateProject(id, data)

      // 记录更新活动
      await activityLogService.createActivity(
        'update',
        'project',
        id,
        `更新了项目: ${data.title || oldProject?.title || ''}`,
        {
          oldData: oldProject ? {
            title: oldProject.title,
            status: oldProject.status,
            featured: oldProject.featured
          } : null,
          newData: {
            title: data.title,
            status: data.status,
            featured: data.featured
          }
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('projects')

      // 重新加载项目数据以获取关联的分类和标签
      await loadProjects()

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('项目更新成功')
      return updatedProject
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '更新项目失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    // 添加删除任务
    const taskId = 'project-delete'
    addTask({
      id: taskId,
      name: '删除项目',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取要删除的项目数据
      const projectToDelete = projects.value.find((p) => p.id === id)

      await projectService.deleteProject(id)

      // 记录删除活动
      await activityLogService.createActivity(
        'delete',
        'project',
        id,
        `删除了项目: ${projectToDelete?.title || ''}`,
        {
          deletedData: projectToDelete ? {
            title: projectToDelete.title,
            status: projectToDelete.status,
            featured: projectToDelete.featured,
            cover_image: projectToDelete.cover_image
          } : null
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('projects')

      projects.value = projects.value.filter((p) => p.id !== id)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('项目删除成功')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除项目失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const getProject = async (id: string) => {
    try {
      // 使用缓存装饰器
      const cacheKey = `project:${id}`
      const cachedProject = cache.withCache(cacheKey, () => projectService.getProject(id), {
        key: cacheKey, dataType: 'projects',
      })()

      return await cachedProject
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取项目详情失败'
      ElMessage.error(errorMessage)
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

    // 添加加载任务
    const taskId = 'categories-load'
    addTask({
      id: taskId,
      name: '加载分类数据',
      priority: 3,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 使用缓存装饰器
      const cacheKey = 'categories'
      const cachedCategories = cache.withCache(cacheKey, () => categoryService.getCategories(), {
        key: cacheKey, dataType: 'categories',
      })()

      const data = await cachedCategories
      categories.value = data

      updateTask(taskId, { status: 'completed', progress: 100 })
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载分类失败'
      error.value = errorMessage
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value.categories = false
    }
  }

  const createCategory = async (data: Partial<Category>) => {
    // 添加创建任务
    const taskId = 'category-create'
    addTask({
      id: taskId,
      name: '创建分类',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      const newCategory = await categoryService.createCategory(data)

      // 记录创建活动
      await activityLogService.createActivity(
        'create',
        'category',
        newCategory.id,
        `创建了分类: ${newCategory.name}`,
        { name: newCategory.name }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('categories')

      categories.value.push(newCategory)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('分类创建成功')
      return newCategory
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '创建分类失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    // 添加更新任务
    const taskId = 'category-update'
    addTask({
      id: taskId,
      name: '更新分类',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取旧分类数据用于比较
      const oldCategory = categories.value.find((c) => c.id === id)

      const updatedCategory = await categoryService.updateCategory(id, data)

      // 记录更新活动
      await activityLogService.createActivity(
        'update',
        'category',
        id,
        `更新了分类: ${data.name || oldCategory?.name || ''}`,
        {
          oldData: oldCategory ? {
            name: oldCategory.name,
            description: oldCategory.description
          } : null,
          newData: {
            name: data.name,
            description: data.description
          }
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('categories')

      const index = categories.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('分类更新成功')
      return updatedCategory
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '更新分类失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    // 添加删除任务
    const taskId = 'category-delete'
    addTask({
      id: taskId,
      name: '删除分类',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取要删除的分类数据
      const categoryToDelete = categories.value.find((c) => c.id === id)

      await categoryService.deleteCategory(id)

      // 记录删除活动
      await activityLogService.createActivity(
        'delete',
        'category',
        id,
        `删除了分类: ${categoryToDelete?.name || ''}`,
        {
          deletedData: categoryToDelete ? {
            name: categoryToDelete.name,
            description: categoryToDelete.description
          } : null
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('categories')

      categories.value = categories.value.filter((c) => c.id !== id)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('分类删除成功')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除分类失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
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

    // 添加加载任务
    const taskId = 'tags-load'
    addTask({
      id: taskId,
      name: '加载标签数据',
      priority: 4,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 使用缓存装饰器
      const cacheKey = 'tags'
      const cachedTags = cache.withCache(cacheKey, () => tagService.getTags(), {
        key: cacheKey, dataType: 'tags',
      })()

      const data = await cachedTags
      tags.value = data

      updateTask(taskId, { status: 'completed', progress: 100 })
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载标签失败'
      error.value = errorMessage
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value.tags = false
    }
  }

  const createTag = async (data: Partial<Tag>) => {
    // 添加创建任务
    const taskId = 'tag-create'
    addTask({
      id: taskId,
      name: '创建标签',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      const newTag = await tagService.createTag(data)

      // 记录创建活动
      await activityLogService.createActivity(
        'create',
        'tag',
        newTag.id,
        `创建了标签: ${newTag.name}`,
        { name: newTag.name, color: newTag.color }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('tags')

      tags.value.push(newTag)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('标签创建成功')
      return newTag
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '创建标签失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const updateTag = async (id: string, data: Partial<Tag>) => {
    // 添加更新任务
    const taskId = 'tag-update'
    addTask({
      id: taskId,
      name: '更新标签',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取旧标签数据用于比较
      const oldTag = tags.value.find((t) => t.id === id)

      const updatedTag = await tagService.updateTag(id, data)

      // 记录更新活动
      await activityLogService.createActivity(
        'update',
        'tag',
        id,
        `更新了标签: ${data.name || oldTag?.name || ''}`,
        {
          oldData: oldTag ? {
            name: oldTag.name,
            color: oldTag.color
          } : null,
          newData: {
            name: data.name,
            color: data.color
          }
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('tags')

      const index = tags.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tags.value[index] = updatedTag
      }

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('标签更新成功')
      return updatedTag
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '更新标签失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const deleteTag = async (id: string) => {
    // 添加删除任务
    const taskId = 'tag-delete'
    addTask({
      id: taskId,
      name: '删除标签',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取要删除的标签数据
      const tagToDelete = tags.value.find((t) => t.id === id)

      await tagService.deleteTag(id)

      // 记录删除活动
      await activityLogService.createActivity(
        'delete',
        'tag',
        id,
        `删除了标签: ${tagToDelete?.name || ''}`,
        {
          deletedData: tagToDelete ? {
            name: tagToDelete.name,
            color: tagToDelete.color
          } : null
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('tags')

      tags.value = tags.value.filter((t) => t.id !== id)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('标签删除成功')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除标签失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
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

    // 添加加载任务
    const taskId = 'skills-load'
    addTask({
      id: taskId,
      name: '加载技能数据',
      priority:5,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 使用缓存装饰器
      const cacheKey = 'skills'
      const cachedSkills = cache.withCache(cacheKey, () => skillService.getSkills(), {
        key: cacheKey, dataType: 'skills',
      })()

      const data = await cachedSkills
      skills.value = data

      updateTask(taskId, { status: 'completed', progress: 100 })
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载技能失败'
      error.value = errorMessage
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value.skills = false
    }
  }

  const createSkill = async (data: Partial<Skill>) => {
    // 添加创建任务
    const taskId = 'skill-create'
    addTask({
      id: taskId,
      name: '创建技能',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      const newSkill = await skillService.createSkill(data)

      // 记录创建活动
      await activityLogService.createActivity(
        'create',
        'skill',
        newSkill.id,
        `创建了技能: ${newSkill.name}`,
        { name: newSkill.name, level: newSkill.level, category: newSkill.category }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('skills')

      skills.value.push(newSkill)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('技能创建成功')
      return newSkill
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '创建技能失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const updateSkill = async (id: string, data: Partial<Skill>) => {
    // 添加更新任务
    const taskId = 'skill-update'
    addTask({
      id: taskId,
      name: '更新技能',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取旧技能数据用于比较
      const oldSkill = skills.value.find((s) => s.id === id)

      const updatedSkill = await skillService.updateSkill(id, data)

      // 记录更新活动
      await activityLogService.createActivity(
        'update',
        'skill',
        id,
        `更新了技能: ${data.name || oldSkill?.name || ''}`,
        {
          oldData: oldSkill ? {
            name: oldSkill.name,
            level: oldSkill.level,
            category: oldSkill.category
          } : null,
          newData: {
            name: data.name,
            level: data.level,
            category: data.category
          }
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('skills')

      const index = skills.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        skills.value[index] = updatedSkill
      }

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('技能更新成功')
      return updatedSkill
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '更新技能失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const deleteSkill = async (id: string) => {
    // 添加删除任务
    const taskId = 'skill-delete'
    addTask({
      id: taskId,
      name: '删除技能',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取要删除的技能数据
      const skillToDelete = skills.value.find((s) => s.id === id)

      await skillService.deleteSkill(id)

      // 记录删除活动
      await activityLogService.createActivity(
        'delete',
        'skill',
        id,
        `删除了技能: ${skillToDelete?.name || ''}`,
        {
          deletedData: skillToDelete ? {
            name: skillToDelete.name,
            level: skillToDelete.level,
            category: skillToDelete.category
          } : null
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('skills')

      skills.value = skills.value.filter((s) => s.id !== id)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('技能删除成功')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除技能失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
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

    // 添加加载任务
    const taskId = 'social-links-load'
    addTask({
      id: taskId,
      name: '加载社交链接',
      priority: 6,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 使用缓存装饰器
      const cacheKey = 'social-links'
      const cachedSocialLinks = cache.withCache(
        cacheKey,
        () => socialLinkService.getSocialLinks(),
        { key: cacheKey, dataType: 'social_links' },
      )()

      const data = await cachedSocialLinks
      socialLinks.value = data

      updateTask(taskId, { status: 'completed', progress: 100 })
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载社交链接失败'
      error.value = errorMessage
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value.socialLinks = false
    }
  }

  const createSocialLink = async (data: Partial<SocialLink>) => {
    // 添加创建任务
    const taskId = 'social-link-create'
    addTask({
      id: taskId,
      name: '创建社交链接',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      const newLink = await socialLinkService.createSocialLink(data)

      // 记录创建活动
      await activityLogService.createActivity(
        'create',
        'social_link',
        newLink.id,
        `创建了社交链接: ${newLink.platform}`,
        { platform: newLink.platform, url: newLink.url, icon: newLink.icon }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('social_links')

      socialLinks.value.push(newLink)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('社交链接创建成功')
      return newLink
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '创建社交链接失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const updateSocialLink = async (id: string, data: Partial<SocialLink>) => {
    // 添加更新任务
    const taskId = 'social-link-update'
    addTask({
      id: taskId,
      name: '更新社交链接',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取旧社交链接数据用于比较
      const oldLink = socialLinks.value.find((l) => l.id === id)

      const updatedLink = await socialLinkService.updateSocialLink(id, data)

      // 记录更新活动
      await activityLogService.createActivity(
        'update',
        'social_link',
        id,
        `更新了社交链接: ${data.platform || oldLink?.platform || ''}`,
        {
          oldData: oldLink ? {
            platform: oldLink.platform,
            url: oldLink.url,
            icon: oldLink.icon
          } : null,
          newData: {
            platform: data.platform,
            url: data.url,
            icon: data.icon
          }
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('social_links')

      const index = socialLinks.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        socialLinks.value[index] = updatedLink
      }

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('社交链接更新成功')
      return updatedLink
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '更新社交链接失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const deleteSocialLink = async (id: string) => {
    // 添加删除任务
    const taskId = 'social-link-delete'
    addTask({
      id: taskId,
      name: '删除社交链接',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取要删除的社交链接数据
      const linkToDelete = socialLinks.value.find((l) => l.id === id)

      await socialLinkService.deleteSocialLink(id)

      // 记录删除活动
      await activityLogService.createActivity(
        'delete',
        'social_link',
        id,
        `删除了社交链接: ${linkToDelete?.platform || ''}`,
        {
          deletedData: linkToDelete ? {
            platform: linkToDelete.platform,
            url: linkToDelete.url,
            icon: linkToDelete.icon
          } : null
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('social_links')

      socialLinks.value = socialLinks.value.filter((l) => l.id !== id)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('社交链接删除成功')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除社交链接失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
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

    // 添加加载任务
    const taskId = 'profile-load'
    addTask({
      id: taskId,
      name: '加载用户档案',
      priority: 7,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 使用缓存装饰器
      const cacheKey = `profile:${userId}`
      const cachedProfile = cache.withCache(cacheKey, () => profileService.getProfile(userId), {
        key: cacheKey, dataType: 'profile',
      })()

      const data = await cachedProfile
      currentProfile.value = data

      updateTask(taskId, { status: 'completed', progress: 100 })
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载用户档案失败'
      error.value = errorMessage
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value.profile = false
    }
  }

  const updateProfile = async (userId: string, data: Partial<Profile>) => {
    // 添加更新任务
    const taskId = 'profile-update'
    addTask({
      id: taskId,
      name: '更新用户档案',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      const updatedProfile = await profileService.updateProfile(userId, data)

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('profile')

      currentProfile.value = updatedProfile

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('档案更新成功')
      return updatedProfile
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '更新档案失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const createProfile = async (data: Partial<Profile>) => {
    // 添加创建任务
    const taskId = 'profile-create'
    addTask({
      id: taskId,
      name: '创建用户档案',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      const newProfile = await profileService.createProfile(data)

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('profile')

      currentProfile.value = newProfile

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('档案创建成功')
      return newProfile
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '创建档案失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '数据加载失败'
      ElMessage.error(errorMessage)
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

    // 添加加载任务
    const taskId = 'system-settings-load'
    addTask({
      id: taskId,
      name: '加载系统设置',
      priority: 10,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 使用缓存装饰器
      const cacheKey = 'system-settings'
      const cachedSettings = cache.withCache(cacheKey, () => systemSettingsService.getSettings(), {
        key: cacheKey, dataType: 'system_settings',
      })()

      const data = await cachedSettings
      systemSettings.value = data

      updateTask(taskId, { status: 'completed', progress: 100 })
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载系统设置失败'
      error.value = errorMessage
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value.systemSettings = false
    }
  }

  const getSystemSetting = async (key: string) => {
    try {
      // 使用缓存装饰器
      const cacheKey = `system-setting:${key}`
      const cachedSetting = cache.withCache(cacheKey, () => systemSettingsService.getSetting(key), {
        key: cacheKey, dataType: 'system_settings',
      })()

      return await cachedSetting
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取系统设置失败'
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const updateSystemSetting = async (key: string, value: string, description?: string) => {
    // 添加更新任务
    const taskId = `system-setting-update-${key}`
    addTask({
      id: taskId,
      name: `更新设置: ${key}`,
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取旧设置数据用于比较
      const oldSetting = systemSettings.value.find((s) => s.key === key)

      const updatedSetting = await systemSettingsService.updateSetting(key, value, description)

      // 记录更新活动
      await activityLogService.createActivity(
        'update',
        'system_setting',
        updatedSetting.id,
        `更新了系统设置: ${key}`,
        {
          oldData: oldSetting ? {
            key: oldSetting.key,
            value: oldSetting.value,
            description: oldSetting.description
          } : null,
          newData: {
            key: key,
            value: value,
            description: description
          }
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('system_settings')

      const index = systemSettings.value.findIndex((s) => s.key === key)
      if (index !== -1) {
        systemSettings.value[index] = updatedSetting
      } else {
        systemSettings.value.push(updatedSetting)
      }

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('设置更新成功')
      return updatedSetting
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '更新设置失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const batchUpdateSystemSettings = async (
    settings: Record<string, { value: string; description?: string }>,
  ) => {
    loading.value.systemSettings = true
    error.value = null

    // 添加批量更新任务
    const taskId = 'system-settings-batch-update'
    addTask({
      id: taskId,
      name: '批量更新系统设置',
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取旧设置数据用于比较
      const oldSettings = systemSettings.value.filter((s) =>
        Object.keys(settings).includes(s.key)
      )

      const results = await systemSettingsService.batchUpdateSettings(settings)

      // 记录批量更新活动
      await activityLogService.createActivity(
        'update',
        'system_setting',
        '',
        `批量更新了系统设置: ${Object.keys(settings).join(', ')}`,
        {
          oldData: oldSettings,
          newData: results
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('system_settings')

      // 更新本地状态
      for (const setting of results) {
        const index = systemSettings.value.findIndex((s) => s.key === setting.key)
        if (index !== -1) {
          systemSettings.value[index] = setting
        } else {
          systemSettings.value.push(setting)
        }
      }

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('批量更新设置成功')
      return results
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '批量更新设置失败'
      error.value = errorMessage
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value.systemSettings = false
    }
  }

  const deleteSystemSetting = async (key: string) => {
    // 添加删除任务
    const taskId = `system-setting-delete-${key}`
    addTask({
      id: taskId,
      name: `删除设置: ${key}`,
      priority: 2,
    })
    updateTask(taskId, { status: 'loading' })

    try {
      // 先获取要删除的设置数据
      const settingToDelete = systemSettings.value.find((s) => s.key === key)

      await systemSettingsService.deleteSetting(key)

      // 记录删除活动
      await activityLogService.createActivity(
        'delete',
        'system_setting',
        settingToDelete?.id || '',
        `删除了系统设置: ${key}`,
        {
          deletedData: settingToDelete ? {
            key: settingToDelete.key,
            value: settingToDelete.value,
            description: settingToDelete.description
          } : null
        }
      )

      // 更新版本号，自动清除相关缓存
      await cache.updateDataVersion('system_settings')

      systemSettings.value = systemSettings.value.filter((s) => s.key !== key)

      updateTask(taskId, { status: 'completed', progress: 100 })
      ElMessage.success('设置删除成功')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除设置失败'
      updateTask(taskId, { status: 'error' })
      ElMessage.error(errorMessage)
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

// 活动日志相关操作
export function useActivityLog() {
  const activities = ref<ActivityLog[]>([])
  const loading = ref(false)

  const loadActivities = async (options?: {
    limit?: number
    entityType?: string
    actionType?: string
  }) => {
    loading.value = true
    try {
      const data = await activityLogService.getActivities(options)
      activities.value = data
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载活动日志失败'
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadRecentActivities = async (limit: number = 10) => {
    loading.value = true
    try {
      const data = await activityLogService.getRecentActivities(limit)
      activities.value = data
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载最近活动失败'
      ElMessage.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createActivity = async (
    actionType: string,
    entityType: string,
    entityId?: string,
    description?: string,
    metadata?: Record<string, unknown>,
  ) => {
    try {
      const activity = await activityLogService.createActivity(
        actionType,
        entityType,
        entityId,
        description,
        metadata,
      )

      // 添加到活动列表开头
      activities.value.unshift(activity)

      // 限制活动列表长度
      if (activities.value.length > 50) {
        activities.value = activities.value.slice(0, 50)
      }

      return activity
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '创建活动记录失败'
      ElMessage.error(errorMessage)
      throw err
    }
  }

  const getActivitiesByEntity = async (entityType: string, entityId: string) => {
    try {
      return await activityLogService.getActivitiesByEntity(entityType, entityId)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取实体活动失败'
      ElMessage.error(errorMessage)
      throw err
    }
  }

  return {
    activities: computed(() => activities.value),
    loading: computed(() => loading.value),
    loadActivities,
    loadRecentActivities,
    createActivity,
    getActivitiesByEntity,
  }
}

// 初始化数据
export function initializeData() {
  onMounted(async () => {
    // 更新全局消息
    updateMessage('正在初始化系统组件...')

    try {
      // 添加系统初始化任务
      addTask({
        id: 'system-init',
        name: '系统初始化',
        priority: 0,
      })

      // 只加载公开数据，用户档案需要登录后加载
      await Promise.all([
        useProjects().loadProjects({ status: 'published', featured: true }),
        useCategories().loadCategories(),
        useTags().loadTags(),
        useSkills().loadSkills(),
        useSocialLinks().loadSocialLinks(),
        useSystemSettings().loadSystemSettings(),
      ])

      // 更新消息为应用设置
      updateMessage('正在应用系统设置...')

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

      // 完成初始化
      updateMessage('系统初始化完成')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '系统初始化失败'
      console.error('Failed to initialize data:', error)
      updateMessage(errorMessage)
    }
  })
}
