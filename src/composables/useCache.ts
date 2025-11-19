import { ref, computed, watch } from 'vue'

// 缓存项接口
export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number // 生存时间（毫秒）
  key: string
}

// 缓存配置接口
export interface CacheConfig {
  ttl: number // 默认TTL（毫秒）
  maxSize: number // 最大缓存项数
  cleanupInterval: number // 清理间隔（毫秒）
}

// 缓存统计接口
export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
}

class CacheManager {
  private cache = new Map<string, CacheItem>()
  private stats = {
    hits: 0,
    misses: 0,
  }
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 默认5分钟
      maxSize: 100, // 默认最大100项
      cleanupInterval: 60 * 1000, // 默认每分钟清理一次
      ...config,
    }

    this.startCleanup()
  }

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      key,
    }

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, item)
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return item.data as T
  }

  // 删除缓存
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 清空缓存
  clear(): void {
    this.cache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
  }

  // 检查是否存在且未过期
  has(key: string): boolean {
    const item = this.cache.get(key)
    return item !== undefined && !this.isExpired(item)
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size
  }

  // 获取缓存统计
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    }
  }

  // 获取所有键
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // 获取所有未过期的键
  validKeys(): string[] {
    return this.keys().filter((key) => {
      const item = this.cache.get(key)
      return item && !this.isExpired(item)
    })
  }

  // 删除过期项
  cleanup(): number {
    let deletedCount = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key)
        deletedCount++
      }
    }

    return deletedCount
  }

  // 删除最旧的项
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // 检查是否过期
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  // 启动定期清理
  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  // 停止清理
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  // 销毁缓存管理器
  destroy(): void {
    this.stopCleanup()
    this.clear()
  }
}

// 全局缓存实例
const globalCache = new CacheManager()

// Vue composable
export function useCache(config?: Partial<CacheConfig>) {
  const cache = config ? new CacheManager(config) : globalCache
  const cacheKey = ref('')

  // 设置缓存
  const setCache = <T>(key: string, data: T, ttl?: number) => {
    cache.set(key, data, ttl)
  }

  // 获取缓存
  const getCache = <T>(key: string): T | null => {
    return cache.get<T>(key)
  }

  // 删除缓存
  const deleteCache = (key: string) => {
    cache.delete(key)
  }

  // 清空缓存
  const clearCache = () => {
    cache.clear()
  }

  // 检查缓存是否存在
  const hasCache = (key: string): boolean => {
    return cache.has(key)
  }

  // 获取缓存统计
  const getCacheStats = () => {
    return cache.getStats()
  }

  // 响应式缓存值
  const cachedValue = computed(() => {
    return cacheKey.value ? getCache(cacheKey.value) : null
  })

  // 监听缓存键变化，自动更新缓存值
  watch(cacheKey, (newKey) => {
    if (newKey) {
      // 可以在这里添加缓存预热逻辑
    }
  })

  // 组件卸载时清理
  const { onUnmounted } = require('vue')
  onUnmounted(() => {
    if (cache !== globalCache) {
      cache.destroy()
    }
  })

  return {
    cacheKey,
    cachedValue,
    setCache,
    getCache,
    deleteCache,
    clearCache,
    hasCache,
    getCacheStats,
  }
}

// 便捷的缓存装饰器函数
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number,
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator(...args)

    // 尝试从缓存获取
    const cached = globalCache.get<ReturnType<T>>(key)
    if (cached !== null) {
      return cached
    }

    // 执行原函数
    const result = await fn(...args)

    // 缓存结果
    globalCache.set(key, result, ttl)

    return result
  }
}

// 缓存键生成器
export const cacheKeys = {
  projects: (page = 1, limit = 20, filters = '') => `projects:${page}:${limit}:${filters}`,
  project: (id: string) => `project:${id}`,
  categories: () => 'categories',
  tags: () => 'tags',
  skills: () => 'skills',
  socialLinks: () => 'social_links',
  siteSettings: () => 'site_settings',
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user_profile:${id}`,
}

// 导出全局缓存实例
export { globalCache }

// 导出类型
export type { CacheItem, CacheConfig, CacheStats }
