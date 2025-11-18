import {
  supabase,
  type Profile,
  type Project,
  type Category,
  type Tag,
  type Skill,
  type SocialLink,
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
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
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
  protected async insert<T>(table: string, data: Partial<T>): Promise<T> {
    try {
      const { data, error } = await supabase.from(table).insert(data).select().single()

      if (error) throw error
      return data as T
    } catch (error) {
      this.handleError(error, `insert ${table}`)
      throw error
    }
  }

  // 通用更新方法
  protected async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    try {
      const { data, error } = await supabase.from(table).update(data).eq('id', id).select().single()

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
  protected async batchInsert<T>(table: string, data: Partial<T>[]): Promise<T[]> {
    try {
      const { data, error } = await supabase.from(table).insert(data).select()

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
      select: `
        *,
        categories (
          id,
          name,
          color,
          icon
        ),
        tags (
          id,
          name,
          color
        )
      `,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      orderBy: options?.orderBy || { column: 'sort_order', ascending: true },
      limit: options?.limit,
    })
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          *,
          categories (
            id,
            name,
            color,
            icon
          ),
          tags (
            id,
            name,
            color
          )
        `,
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      this.handleError(error, 'get project')
      throw error
    }
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    return this.insert<Project>('projects', data)
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.update<Project>('projects', id, data)
  }

  async deleteProject(id: string): Promise<void> {
    // 先删除关联的分类和标签
    await supabase.from('project_categories').delete().eq('project_id', id)
    await supabase.from('project_tags').delete().eq('project_id', id)

    // 再删除项目
    return this.delete('projects', id)
  }

  async updateProjectCategories(projectId: string, categoryIds: string[]): Promise<void> {
    try {
      // 删除现有关联
      await supabase.from('project_categories').delete().eq('project_id', projectId)

      // 添加新关联
      if (categoryIds.length > 0) {
        const relations = categoryIds.map((categoryId) => ({
          project_id: projectId,
          category_id: categoryId,
        }))

        const { error } = await supabase.from('project_categories').insert(relations)
        if (error) throw error
      }
    } catch (error) {
      this.handleError(error, 'update project categories')
      throw error
    }
  }

  async updateProjectTags(projectId: string, tagIds: string[]): Promise<void> {
    try {
      // 删除现有关联
      await supabase.from('project_tags').delete().eq('project_id', projectId)

      // 添加新关联
      if (tagIds.length > 0) {
        const relations = tagIds.map((tagId) => ({
          project_id: projectId,
          tag_id: tagId,
        }))

        const { error } = await supabase.from('project_tags').insert(relations)
        if (error) throw error
      }
    } catch (error) {
      this.handleError(error, 'update project tags')
      throw error
    }
  }
}

// 分类服务
export class CategoryService extends DatabaseService {
  async getCategories(): Promise<Category[]> {
    return this.fetch<Category>('categories', {
      orderBy: { column: 'sort_order', ascending: true },
    })
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.insert<Category>('categories', data)
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
    return this.fetch<Tag>('tags', {
      orderBy: { column: 'name', ascending: true },
    })
  }

  async createTag(data: Partial<Tag>): Promise<Tag> {
    return this.insert<Tag>('tags', data)
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
    return this.fetch<Skill>('skills', {
      orderBy: { column: 'level', ascending: false },
    })
  }

  async createSkill(data: Partial<Skill>): Promise<Skill> {
    return this.insert<Skill>('skills', data)
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
    return this.fetch<SocialLink>('social_links', {
      orderBy: { column: 'sort_order', ascending: true },
    })
  }

  async createSocialLink(data: Partial<SocialLink>): Promise<SocialLink> {
    return this.insert<SocialLink>('social_links', data)
  }

  async updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink> {
    return this.update<SocialLink>('social_links', id, data)
  }

  async deleteSocialLink(id: string): Promise<void> {
    return this.delete('social_links', id)
  }
}

// 导出类型和服务实例
export type { Profile, Project, Category, Tag, Skill, SocialLink } from '@/utils/supabase'
export const profileService = new ProfileService()
export const projectService = new ProjectService()
export const categoryService = new CategoryService()
export const tagService = new TagService()
export const skillService = new SkillService()
export const socialLinkService = new SocialLinkService()
