// 本地缓存管理 - 使用localStorage + 版本控制
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 缓存条目接口
interface LocalCacheEntry {
  data: any
  timestamp: number
  ttl: number
  version: number
}

// 版本信息接口
interface VersionInfo {
  data_type: string
  version: number
  updated_at: string
}

class LocalCache {
  private supabase: SupabaseClient<any>
  private versionCache: Map<string, number> = new Map()
  private lastVersionCheck: Map<string, number> = new Map()
  private readonly VERSION_CHECK_INTERVAL = 30000 // 30秒检查一次版本
  private isWarmingUp = false

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )
  }

  // 生成缓存键
  private generateCacheKey(key: string): string {
    return `cache_${key}`
  }

  // 检查缓存是否过期
  private isExpired(entry: LocalCacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  // 获取远程版本号
  private async getRemoteVersion(dataType: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('cache_versions')
        .select('version')
        .eq('data_type', dataType)
        .single()

      if (error) {
        console.warn(`获取版本号失败: ${dataType}`, error)
        return 0
      }

      return data?.version || 0
    } catch (error) {
      console.error(`获取版本号异常: ${dataType}`, error)
      return 0
    }
  }

  // 检查是否需要更新版本
  private shouldCheckVersion(dataType: string): boolean {
    const lastCheck = this.lastVersionCheck.get(dataType) || 0
    return Date.now() - lastCheck > this.VERSION_CHECK_INTERVAL
  }

  // 更新本地版本缓存
  private async updateLocalVersion(dataType: string): Promise<void> {
    const remoteVersion = await this.getRemoteVersion(dataType)
    this.versionCache.set(dataType, remoteVersion)
    this.lastVersionCheck.set(dataType, Date.now())
  }

  // 检查版本是否变化
  private async hasVersionChanged(dataType: string, currentVersion: number): Promise<boolean> {
    // 如果超过检查间隔，更新本地版本
    if (this.shouldCheckVersion(dataType)) {
      await this.updateLocalVersion(dataType)
    }

    const latestVersion = this.versionCache.get(dataType) || 0
    return latestVersion > currentVersion
  }

  // 设置缓存
  async set<T>(
    key: string,
    data: T,
    dataType: string,
    ttl: number = 30 * 60 * 1000,
  ): Promise<boolean> {
    try {
      // 获取当前版本号
      const currentVersion =
        this.versionCache.get(dataType) || (await this.getRemoteVersion(dataType))

      const entry: LocalCacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
        version: currentVersion,
      }

      const cacheKey = this.generateCacheKey(key)
      localStorage.setItem(cacheKey, JSON.stringify(entry))

      console.log(`本地缓存设置成功: ${key} (版本: ${currentVersion})`)
      return true
    } catch (error) {
      console.error(`本地缓存设置失败: ${key}`, error)
      return false
    }
  }

  // 获取缓存
  async get<T>(key: string, dataType: string): Promise<T | null> {
    try {
      const cacheKey = this.generateCacheKey(key)
      const item = localStorage.getItem(cacheKey)

      if (!item) {
        console.log(`本地缓存未命中: ${key}`)
        return null
      }

      const entry: LocalCacheEntry = JSON.parse(item)

      // 检查是否过期
      if (this.isExpired(entry)) {
        console.log(`本地缓存已过期: ${key}`)
        localStorage.removeItem(cacheKey)
        return null
      }

      // 检查版本是否变化
      if (await this.hasVersionChanged(dataType, entry.version)) {
        console.log(`本地缓存版本过期: ${key}`)
        localStorage.removeItem(cacheKey)
        return null
      }

      console.log(`本地缓存命中: ${key}`)
      return entry.data as T
    } catch (error) {
      console.error(`本地缓存获取异常: ${key}`, error)
      return null
    }
  }

  // 删除缓存
  remove(key: string): void {
    try {
      const cacheKey = this.generateCacheKey(key)
      localStorage.removeItem(cacheKey)
      console.log(`本地缓存删除成功: ${key}`)
    } catch (error) {
      console.error(`本地缓存删除异常: ${key}`, error)
    }
  }

  // 清除所有缓存
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith('cache_'))
      keys.forEach((key) => localStorage.removeItem(key))
      console.log('本地缓存已清空')
    } catch (error) {
      console.error('清空本地缓存异常:', error)
    }
  }

  // 清除特定前缀的缓存
  clearByPrefix(prefix: string): void {
    try {
      const keys = Object.keys(localStorage).filter(
        (key) => key.startsWith('cache_') && key.includes(prefix),
      )
      keys.forEach((key) => localStorage.removeItem(key))
      console.log(`本地缓存删除前缀: ${prefix}`)
    } catch (error) {
      console.error(`删除前缀缓存异常: ${prefix}`, error)
    }
  }

  // 更新版本号（后台操作时调用）
  async updateVersion(dataType: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('increment_cache_version', {
        p_data_type: dataType,
      })

      if (error) {
        console.error(`更新版本号失败: ${dataType}`, error)
        return false
      }

      // 立即更新本地版本缓存
      await this.updateLocalVersion(dataType)

      // 清除相关缓存
      this.clearByPrefix(dataType)

      console.log(`版本号更新成功: ${dataType}`)
      return true
    } catch (error) {
      console.error(`更新版本号异常: ${dataType}`, error)
      return false
    }
  }

  // 获取缓存统计
  getStats(): {
    total: number
    connected: boolean
    info: string
  } {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith('cache_'))
      const total = keys.length

      return {
        total,
        connected: true,
        info: JSON.stringify(
          {
            type: 'localStorage',
            status: 'active',
            total,
            versionCacheSize: this.versionCache.size,
          },
          null,
          2,
        ),
      }
    } catch (error) {
      return {
        total: 0,
        connected: false,
        info: JSON.stringify(
          {
            type: 'localStorage',
            status: 'error',
            error: (error as any)?.message,
          },
          null,
          2,
        ),
      }
    }
  }

  // 手动清理过期缓存
  cleanupExpired(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith('cache_'))
      let cleaned = 0

      keys.forEach((key) => {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const entry: LocalCacheEntry = JSON.parse(item)
            if (this.isExpired(entry)) {
              localStorage.removeItem(key)
              cleaned++
            }
          }
        } catch (error) {
          // 清理损坏的缓存项
          localStorage.removeItem(key)
          cleaned++
        }
      })

      console.log(`清理过期缓存完成: ${cleaned} 项`)
    } catch (error) {
      console.error('清理过期缓存异常:', error)
    }
  }

  // 预热版本缓存 - 防止重复请求
  async warmupVersionCache(): Promise<void> {
    // 防止重复预热
    if (this.isWarmingUp) {
      console.log('版本缓存预热中，跳过重复请求')
      return
    }

    this.isWarmingUp = true

    const dataTypes = [
      'projects',
      'categories',
      'tags',
      'skills',
      'social_links',
      'system_settings',
      'profile',
    ]

    try {
      console.log('开始预热版本缓存...')
      const { data, error } = await this.supabase
        .from('cache_versions')
        .select('data_type, version')
        .in('data_type', dataTypes)

      if (error) {
        console.warn('预热版本缓存失败:', error)
        return
      }

      if (data) {
        data.forEach((item) => {
          this.versionCache.set(item.data_type, item.version)
          this.lastVersionCheck.set(item.data_type, Date.now())
        })
        console.log(`版本缓存预热完成: ${data.length} 个数据类型`)
      }
    } catch (error) {
      console.error('预热版本缓存异常:', error)
    } finally {
      this.isWarmingUp = false
    }
  }
}

// 创建单例实例
const localCache = new LocalCache()

// 立即初始化版本缓存 - 确保在应用启动时就加载
let versionCachePromise: Promise<void> | null = null

const initializeVersionCache = () => {
  if (!versionCachePromise) {
    versionCachePromise = localCache.warmupVersionCache()
  }
  return versionCachePromise
}

// 在浏览器环境中立即初始化
if (typeof window !== 'undefined') {
  initializeVersionCache()
}

// 导出缓存客户端
export default localCache
export type { LocalCacheEntry, VersionInfo }

// 导出初始化函数，供其他模块调用
export { initializeVersionCache }
