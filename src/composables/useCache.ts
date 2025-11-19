import { ref, computed } from 'vue'
import redisService, { type ConnectionStatus } from '@/utils/redis'

// 缓存配置
interface CacheConfig {
  key: string
  ttl?: number // 缓存时间（毫秒）
  version?: string // 缓存版本
}

// 缓存项
interface CacheItem<T = any> {
  data: T
  timestamp: number
  version: string
}

// 全局缓存状态
const cacheVersion = ref('1.0.0')
const cacheEnabled = ref(true)
const redisConnected = ref(false)

// 本地缓存降级存储（当Redis不可用时使用）
const fallbackCache = new Map<string, CacheItem>()

// 路由缓存策略配置
const routeCacheStrategies: Record<string, { enabled: boolean }> = {
  // 前台页面 - 启用缓存
  '/': { enabled: true },
  '/projects': { enabled: true },
  '/project/:id': { enabled: true },

  // 管理页面 - 禁用缓存
  '/admin': { enabled: false },
  '/admin/projects': { enabled: false },
  '/admin/categories': { enabled: false },
  '/admin/tags': { enabled: false },
  '/admin/skills': { enabled: false },
  '/admin/social-links': { enabled: false },
  '/admin/site-settings': { enabled: false },
}

// 获取当前路由的缓存策略
const getCurrentRouteCacheStrategy = (route: string) => {
  // 精确匹配
  if (routeCacheStrategies[route]) {
    return routeCacheStrategies[route]
  }

  // 模糊匹配（动态路由）
  for (const [key, strategy] of Object.entries(routeCacheStrategies)) {
    if (key.includes(':')) {
      const [base] = key.split(':')
      if (route && base && route.startsWith(base)) {
        return strategy
      }
    }
  }

  // 默认策略：前台页面启用缓存，管理页面禁用
  const isAdminRoute = route?.startsWith('/admin') || false
  return {
    enabled: !isAdminRoute,
  }
}

// 生成缓存键
const generateCacheKey = (key: string, config?: CacheConfig) => {
  const version = config?.version || cacheVersion.value
  return `${key}:${version}`
}

// 检查Redis连接状态
const checkRedisConnection = async (): Promise<boolean> => {
  try {
    const status = redisService.getConnectionStatus()
    if (status === 'connected') {
      return true
    }

    if (status === 'disconnected' || status === 'error') {
      const connected = await redisService.connect()
      redisConnected.value = connected
      return connected
    }

    return false
  } catch (error) {
    console.error('Redis连接检查失败:', error)
    redisConnected.value = false
    return false
  }
}

// 设置缓存
const setCache = async <T>(key: string, data: T, config?: CacheConfig): Promise<void> => {
  if (!cacheEnabled.value) return

  const cacheKey = generateCacheKey(key, config)
  const ttl = config?.ttl || 5 * 60 * 1000 // 默认5分钟
  const version = config?.version || cacheVersion.value

  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    version,
  }

  // 尝试使用Redis
  const isRedisAvailable = await checkRedisConnection()

  if (isRedisAvailable) {
    try {
      const success = await redisService.set(cacheKey, cacheItem, Math.floor(ttl / 1000))
      if (success) {
        console.log(`Redis缓存设置成功: ${key}`)
        return
      }
    } catch (error) {
      console.warn('Redis设置缓存失败，降级到本地缓存:', error)
    }
  }

  // 降级到本地缓存
  fallbackCache.set(cacheKey, cacheItem)
  console.log(`本地缓存设置成功: ${key}`)
}

// 获取缓存
const getCache = async <T>(key: string, config?: CacheConfig): Promise<T | null> => {
  if (!cacheEnabled.value) return null

  const cacheKey = generateCacheKey(key, config)

  // 尝试从Redis获取
  const isRedisAvailable = await checkRedisConnection()

  if (isRedisAvailable) {
    try {
      const data = await redisService.get<T>(cacheKey)
      if (data !== null) {
        console.log(`Redis缓存命中: ${key}`)
        return data
      }
    } catch (error) {
      console.warn('Redis获取缓存失败，尝试本地缓存:', error)
    }
  }

  // 从本地缓存获取
  const localItem = fallbackCache.get(cacheKey)
  if (localItem) {
    // 检查是否过期
    const ttl = config?.ttl || 5 * 60 * 1000
    if (Date.now() - localItem.timestamp <= ttl) {
      console.log(`本地缓存命中: ${key}`)

      // 如果Redis可用，同步到Redis
      if (isRedisAvailable) {
        try {
          const remainingTtl = Math.floor((ttl - (Date.now() - localItem.timestamp)) / 1000)
          if (remainingTtl > 0) {
            await redisService.set(cacheKey, localItem, remainingTtl)
          }
        } catch (error) {
          console.warn('同步本地缓存到Redis失败:', error)
        }
      }

      return localItem.data
    } else {
      // 删除过期的本地缓存
      fallbackCache.delete(cacheKey)
    }
  }

  console.log(`缓存未命中: ${key}`)
  return null
}

// 删除缓存
const removeCache = async (key: string, config?: CacheConfig): Promise<void> => {
  const cacheKey = generateCacheKey(key, config)

  // 从Redis删除
  const isRedisAvailable = await checkRedisConnection()
  if (isRedisAvailable) {
    try {
      await redisService.del(cacheKey)
      console.log(`Redis缓存删除成功: ${key}`)
    } catch (error) {
      console.warn('Redis删除缓存失败:', error)
    }
  }

  // 从本地缓存删除
  fallbackCache.delete(cacheKey)
  console.log(`本地缓存删除成功: ${key}`)
}

// 清除所有缓存
const clearAllCache = async (): Promise<void> => {
  // 清除Redis缓存
  const isRedisAvailable = await checkRedisConnection()
  if (isRedisAvailable) {
    try {
      await redisService.flushDb()
      console.log('Redis缓存已清空')
    } catch (error) {
      console.warn('Redis清空缓存失败:', error)
    }
  }

  // 清除本地缓存
  fallbackCache.clear()
  console.log('本地缓存已清空')
}

// 清除过期缓存
const clearExpiredCache = async (): Promise<void> => {
  // 清除本地过期缓存
  const now = Date.now()
  for (const [key, item] of fallbackCache.entries()) {
    const ttl = 5 * 60 * 1000 // 默认5分钟
    if (now - item.timestamp > ttl) {
      fallbackCache.delete(key)
    }
  }

  // Redis会自动处理过期键，但可以手动清理特定模式的键
  const isRedisAvailable = await checkRedisConnection()
  if (isRedisAvailable) {
    try {
      // 可以添加特定的清理逻辑，比如清理特定前缀的过期键
      console.log('Redis过期缓存清理完成')
    } catch (error) {
      console.warn('Redis清理过期缓存失败:', error)
    }
  }

  console.log('过期缓存清理完成')
}

// 清除特定前缀的缓存
const clearCacheByPrefix = async (prefix: string): Promise<void> => {
  // 清除Redis中的匹配键
  const isRedisAvailable = await checkRedisConnection()
  if (isRedisAvailable) {
    try {
      const pattern = `${prefix}:*`
      const deletedCount = await redisService.delPattern(pattern)
      console.log(`Redis删除前缀缓存: ${prefix}, 删除数量: ${deletedCount}`)
    } catch (error) {
      console.warn('Redis删除前缀缓存失败:', error)
    }
  }

  // 清除本地缓存中的匹配键
  for (const key of fallbackCache.keys()) {
    if (key && key.startsWith(prefix)) {
      fallbackCache.delete(key)
    }
  }

  console.log(`本地缓存前缀清理完成: ${prefix}`)
}

// 缓存装饰器函数
const withCache = <T>(key: string, fetchFn: () => Promise<T>, config?: CacheConfig) => {
  return async (): Promise<T> => {
    // 检查是否启用缓存
    const routeStrategy = getCurrentRouteCacheStrategy(window.location.pathname)
    if (!routeStrategy.enabled) {
      console.log(`缓存禁用路由: ${window.location.pathname}`)
      return await fetchFn()
    }

    // 尝试从缓存获取
    const cached = await getCache<T>(key, config)
    if (cached !== null) {
      return cached
    }

    // 缓存未命中，执行数据获取
    try {
      const data = await fetchFn()

      // 存储到缓存
      await setCache(key, data, config)

      return data
    } catch (error) {
      console.error(`数据获取失败 ${key}:`, error)
      throw error
    }
  }
}

// 缓存统计
const getCacheStats = async () => {
  const localSize = fallbackCache.size
  let redisSize = 0
  let redisInfo = ''

  const isRedisAvailable = await checkRedisConnection()
  if (isRedisAvailable) {
    try {
      // 获取Redis信息
      redisInfo = (await redisService.getInfo()) || ''

      // 尝试获取键的数量（通过模式匹配）
      const keys = await redisService.keys('*')
      redisSize = keys.length
    } catch (error) {
      console.warn('获取Redis统计失败:', error)
    }
  }

  return {
    local: localSize,
    redis: redisSize,
    total: localSize + redisSize,
    redisConnected: redisConnected.value,
    redisInfo,
  }
}

// 监听Redis连接状态变化
const monitorRedisConnection = () => {
  setInterval(async () => {
    const status = redisService.getConnectionStatus()
    const wasConnected = redisConnected.value
    redisConnected.value = status === 'connected'

    if (!wasConnected && redisConnected.value) {
      console.log('Redis连接恢复，开始同步本地缓存')
      // 可以在这里添加本地缓存同步到Redis的逻辑
    }
  }, 5000) // 每5秒检查一次
}

// 启动连接监控
if (typeof window !== 'undefined') {
  monitorRedisConnection()
}

// 导出缓存管理功能
export function useCache() {
  return {
    // 基础操作
    set: setCache,
    get: getCache,
    remove: removeCache,

    // 批量操作
    clearAll: clearAllCache,
    clearExpired: clearExpiredCache,
    clearByPrefix: clearCacheByPrefix,

    // 装饰器
    withCache,

    // 配置
    enabled: computed(() => cacheEnabled.value),
    version: computed(() => cacheVersion.value),
    redisConnected: computed(() => redisConnected.value),

    // 策略
    getRouteStrategy: getCurrentRouteCacheStrategy,

    // 统计
    stats: getCacheStats,

    // 控制方法
    enable: () => {
      cacheEnabled.value = true
    },
    disable: () => {
      cacheEnabled.value = false
    },
    updateVersion: (newVersion: string) => {
      cacheVersion.value = newVersion
      clearAllCache() // 版本更新时清除所有缓存
    },

    // Redis相关
    checkRedisConnection,
    getRedisStatus: () => redisService.getConnectionStatus(),
  }
}

// 自动清理过期缓存（每5分钟）
if (typeof window !== 'undefined') {
  setInterval(clearExpiredCache, 5 * 60 * 1000)
}
