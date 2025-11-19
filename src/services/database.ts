import {
  supabase,
  type Profile,
  type Project,
  type Category,
  type Tag,
  type Skill,
  type SocialLink,
  type SystemSetting,
} from '@/utils/supabase'

// 基础数据服务类
export class DatabaseService {
  // 通用错误处理
  protected handleError(error: any, operation: string) {
    console.error(`Database error in ${operation}:`, error)
    throw new Error(`Failed to ${operation}: ${error.message}`)
  }

  // 通用查询方法
  protected async fetch<T>(
    table: string,
    options?: {
      select?: string
      filter?: Record<string, any>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
    },
  ): Promise<T[]> {
    try {
      // 使用最简单的方法，直接构建查询
      let query: any = supabase.from(table)

      if (options?.select) {
        query = query.select(options.select)
      }

      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending,
        })
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as T[]
    } catch (error) {
      this.handleError(error, `fetch ${table}`)
      throw error
    }
  }

  // 通用插入方法
  protected async insert<T>(table: string, insertData: Partial<T>): Promise<T> {
    try {
      const { data, error } = await supabase.from(table).insert(insertData).select().single()

      if (error) throw error
      return data as T
    } catch (error) {
      this.handleError(error, `insert ${table}`)
      throw error
    }
  }

  // 通用更新方法
  protected async update<T>(table: string, id: string, updateData: Partial<T>): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as T
    } catch (error) {
      this.handleError(error, `update ${table}`)
      throw error
    }
  }

  // 通用删除方法
  protected async delete(table: string, id: string): Promise<void> {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      this.handleError(error, `delete ${table}`)
      throw error
    }
  }

  // 批量操作
  protected async batchInsert<T>(table: string, batchData: Partial<T>[]): Promise<T[]> {
    try {
      const { data, error } = await supabase.from(table).insert(batchData).select()

      if (error) throw error
      return data as T[]
    } catch (error) {
      this.handleError(error, `batch insert ${table}`)
      throw error
    }
  }
}

// 用户档案服务
export class ProfileService extends DatabaseService {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }
      return data
    } catch (error) {
      this.handleError(error, 'get profile')
      throw error
    }
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    return this.update<Profile>('profiles', userId, data)
  }

  async createProfile(data: Partial<Profile>): Promise<Profile> {
    return this.insert<Profile>('profiles', data)
  }
}

// 项目服务
export class ProjectService extends DatabaseService {
  async getProjectsWithRelations(options?: {
    featured?: boolean
    status?: 'draft' | 'published' | 'archived'
    limit?: number
    orderBy?: { column: string; ascending?: boolean }
  }): Promise<(Project & { categories: Category[]; tags: Tag[] })[]> {
    try {
      // 先获取项目列表
      let projectsQuery = supabase.from('projects').select('*')

      if (options?.featured !== undefined) {
        projectsQuery = projectsQuery.eq('featured', options.featured)
      }

      if (options?.status) {
        projectsQuery = projectsQuery.eq('status', options.status)
      }

      projectsQuery = projectsQuery.order(options?.orderBy?.column || 'sort_order', {
        ascending: options?.orderBy?.ascending ?? true,
      })

      if (options?.limit) {
        projectsQuery = projectsQuery.limit(options.limit)
      }

      const { data: projectsData, error: projectsError } = await projectsQuery

      if (projectsError) throw projectsError

      if (!projectsData || projectsData.length === 0) {
        return []
      }

      // 获取所有项目ID
      const projectIds = projectsData.map((p) => p.id)

      // 获取项目分类关联
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .in('id', projectsData.map((p) => p.category_id).filter(Boolean))

      // 获取项目标签关联
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .in(
          'id',
          projectsData.flatMap((p) => p.tech_stack || []).filter((id) => typeof id === 'string'),
        )

      // 组合数据
      return projectsData.map((project) => {
        const projectCategories =
          categoriesData?.filter((cat) => cat.id === project.category_id) || []
        const projectTags =
          tagsData?.filter(
            (tag) => Array.isArray(project.tech_stack) && project.tech_stack.includes(tag.id),
          ) || []

        return {
          ...project,
          categories: projectCategories,
          tags: projectTags,
        }
      })
    } catch (error) {
      this.handleError(error, 'get projects with relations')
      throw error
    }
  }

  async getProjects(options?: {
    featured?: boolean
    status?: 'draft' | 'published' | 'archived'
    limit?: number
    orderBy?: { column: string; ascending?: boolean }
  }): Promise<Project[]> {
    const filter: Record<string, any> = {}

    if (options?.featured !== undefined) {
      filter.featured = options.featured
    }

    if (options?.status) {
      filter.status = options.status
    }

    return this.fetch<Project>('projects', {
      select: '*',
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      orderBy: options?.orderBy || { column: 'sort_order', ascending: true },
      limit: options?.limit,
    })
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

      if (error) throw error
      return data
    } catch (error) {
      this.handleError(error, 'get project')
      throw error
    }
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    // 获取当前用户ID
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    const projectData = {
      ...data,
      user_id: user.id,
    }

    return this.insert<Project>('projects', projectData)
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.update<Project>('projects', id, data)
  }

  async deleteProject(id: string): Promise<void> {
    return this.delete('projects', id)
  }

  // 更新项目分类关联
  async updateProjectCategories(projectId: string, categoryIds: string[]): Promise<void> {
    // 先删除现有关联
    const { error: deleteError } = await supabase
      .from('project_categories')
      .delete()
      .eq('project_id', projectId)
    if (deleteError) throw deleteError

    // 添加新关联
    if (categoryIds.length > 0) {
      const relations = categoryIds.map((categoryId) => ({
        project_id: projectId,
        category_id: categoryId,
      }))
      const { error: insertError } = await supabase.from('project_categories').insert(relations)
      if (insertError) throw insertError
    }
  }

  // 更新项目标签关联
  async updateProjectTags(projectId: string, tagIds: string[]): Promise<void> {
    // 先删除现有关联
    const { error: deleteError } = await supabase
      .from('project_tags')
      .delete()
      .eq('project_id', projectId)
    if (deleteError) throw deleteError

    // 添加新关联
    if (tagIds.length > 0) {
      const relations = tagIds.map((tagId) => ({
        project_id: projectId,
        tag_id: tagId,
      }))
      const { error: insertError } = await supabase.from('project_tags').insert(relations)
      if (insertError) throw insertError
    }
  }
}

// 分类服务
export class CategoryService extends DatabaseService {
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data as Category[]
    } catch (error) {
      this.handleError(error, 'get categories')
      throw error
    }
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    // 获取当前用户ID
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    const categoryData = {
      ...data,
      user_id: user.id,
    }

    return this.insert<Category>('categories', categoryData)
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.update<Category>('categories', id, data)
  }

  async deleteCategory(id: string): Promise<void> {
    return this.delete('categories', id)
  }
}

// 标签服务
export class TagService extends DatabaseService {
  async getTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data as Tag[]
    } catch (error) {
      this.handleError(error, 'get tags')
      throw error
    }
  }

  async createTag(data: Partial<Tag>): Promise<Tag> {
    // 获取当前用户ID
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    const tagData = {
      ...data,
      user_id: user.id,
    }

    return this.insert<Tag>('tags', tagData)
  }

  async updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
    return this.update<Tag>('tags', id, data)
  }

  async deleteTag(id: string): Promise<void> {
    return this.delete('tags', id)
  }
}

// 技能服务
export class SkillService extends DatabaseService {
  async getSkills(): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('level', { ascending: false })

      if (error) throw error
      return data as Skill[]
    } catch (error) {
      this.handleError(error, 'get skills')
      throw error
    }
  }

  async createSkill(data: Partial<Skill>): Promise<Skill> {
    // 获取当前用户ID
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    const skillData = {
      ...data,
      user_id: user.id,
    }

    return this.insert<Skill>('skills', skillData)
  }

  async updateSkill(id: string, data: Partial<Skill>): Promise<Skill> {
    return this.update<Skill>('skills', id, data)
  }

  async deleteSkill(id: string): Promise<void> {
    return this.delete('skills', id)
  }
}

// 社交链接服务
export class SocialLinkService extends DatabaseService {
  async getSocialLinks(): Promise<SocialLink[]> {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data as SocialLink[]
    } catch (error) {
      this.handleError(error, 'get social links')
      throw error
    }
  }

  async createSocialLink(data: Partial<SocialLink>): Promise<SocialLink> {
    // 获取当前用户ID
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    const socialLinkData = {
      ...data,
      user_id: user.id,
    }

    return this.insert<SocialLink>('social_links', socialLinkData)
  }

  async updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink> {
    return this.update<SocialLink>('social_links', id, data)
  }

  async deleteSocialLink(id: string): Promise<void> {
    return this.delete('social_links', id)
  }
}

// 系统设置服务
export class SystemSettingsService extends DatabaseService {
  async getSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key', { ascending: true })

      if (error) throw error
      return data as SystemSetting[]
    } catch (error) {
      this.handleError(error, 'get system settings')
      throw error
    }
  }

  async getSetting(key: string): Promise<SystemSetting | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }
      return data
    } catch (error) {
      this.handleError(error, 'get system setting')
      throw error
    }
  }

  async updateSetting(key: string, value: string, description?: string): Promise<SystemSetting> {
    try {
      // 先尝试更新
      const { data: updateData, error: updateError } = await supabase
        .from('system_settings')
        .update({ value, description })
        .eq('key', key)
        .select()
        .single()

      if (!updateError && updateData) {
        return updateData as SystemSetting
      }

      // 如果更新失败（记录不存在），则创建新记录
      // 获取当前用户ID
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('用户未登录')
      }

      const { data: insertData, error: insertError } = await supabase
        .from('system_settings')
        .insert({
          key,
          value,
          description: description || key,
          type: 'string',
          user_id: user.id,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return insertData as SystemSetting
    } catch (error) {
      this.handleError(error, 'update system setting')
      throw error
    }
  }

  async batchUpdateSettings(
    settings: Record<string, { value: string; description?: string }>,
  ): Promise<SystemSetting[]> {
    try {
      const results: SystemSetting[] = []

      for (const [key, setting] of Object.entries(settings)) {
        const result = await this.updateSetting(key, setting.value, setting.description)
        results.push(result)
      }

      return results
    } catch (error) {
      this.handleError(error, 'batch update system settings')
      throw error
    }
  }

  async deleteSetting(key: string): Promise<void> {
    try {
      const { error } = await supabase.from('system_settings').delete().eq('key', key)

      if (error) throw error
    } catch (error) {
      this.handleError(error, 'delete system setting')
      throw error
    }
  }
}

// 导出类型和服务实例
export type {
  Profile,
  Project,
  Category,
  Tag,
  Skill,
  SocialLink,
  SystemSetting,
} from '@/utils/supabase'
export const profileService = new ProfileService()
export const projectService = new ProjectService()
export const categoryService = new CategoryService()
export const tagService = new TagService()
export const skillService = new SkillService()
export const socialLinkService = new SocialLinkService()
export const systemSettingsService = new SystemSettingsService()
