import { ref, computed } from 'vue'
import redisService, { type ConnectionStatus } from '@/utils/redis'

// 缓存配置
interface CacheConfig {
  key: string
  ttl?: number // 缓存时间（秒）
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
      redisConnected.value = true
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
  if (!cacheEnabled.value) {
    console.log(`缓存已禁用，跳过设置: ${key}`)
    return
  }

  const cacheKey = generateCacheKey(key, config)
  const ttl = config?.ttl || 5 * 60 // 默认5分钟（秒）
  const version = config?.version || cacheVersion.value

  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    version,
  }

  // 检查Redis连接
  const isRedisAvailable = await checkRedisConnection()

  if (!isRedisAvailable) {
    console.warn(`Redis不可用，缓存设置失败: ${key}`)
    return
  }

  try {
    const success = await redisService.set(cacheKey, cacheItem, ttl)
    if (success) {
      console.log(`Redis缓存设置成功: ${key}`)
    } else {
      console.warn(`Redis缓存设置失败: ${key}`)
    }
  } catch (error) {
    console.error(`Redis缓存设置异常: ${key}`, error)
  }
}

// 获取缓存
const getCache = async <T>(key: string, config?: CacheConfig): Promise<T | null> => {
  if (!cacheEnabled.value) {
    console.log(`缓存已禁用，跳过获取: ${key}`)
    return null
  }

  const cacheKey = generateCacheKey(key, config)

  // 检查Redis连接
  const isRedisAvailable = await checkRedisConnection()

  if (!isRedisAvailable) {
    console.warn(`Redis不可用，缓存获取失败: ${key}`)
    return null
  }

  try {
    const data = await redisService.get<T>(cacheKey)
    if (data !== null) {
      console.log(`Redis缓存命中: ${key}`)
      return data
    } else {
      console.log(`Redis缓存未命中: ${key}`)
      return null
    }
  } catch (error) {
    console.error(`Redis缓存获取异常: ${key}`, error)
    return null
  }
}

// 删除缓存
const removeCache = async (key: string, config?: CacheConfig): Promise<void> => {
  const cacheKey = generateCacheKey(key, config)

  // 检查Redis连接
  const isRedisAvailable = await checkRedisConnection()

  if (!isRedisAvailable) {
    console.warn(`Redis不可用，缓存删除失败: ${key}`)
    return
  }

  try {
    const success = await redisService.del(cacheKey)
    if (success) {
      console.log(`Redis缓存删除成功: ${key}`)
    } else {
      console.warn(`Redis缓存删除失败: ${key}`)
    }
  } catch (error) {
    console.error(`Redis缓存删除异常: ${key}`, error)
  }
}

// 清除所有缓存
const clearAllCache = async (): Promise<void> => {
  // 检查Redis连接
  const isRedisAvailable = await checkRedisConnection()

  if (!isRedisAvailable) {
    console.warn('Redis不可用，清空缓存失败')
    return
  }

  try {
    const success = await redisService.flushDb()
    if (success) {
      console.log('Redis缓存已清空')
    } else {
      console.warn('Redis清空缓存失败')
    }
  } catch (error) {
    console.error('Redis清空缓存异常:', error)
  }
}

// 清除特定前缀的缓存
const clearCacheByPrefix = async (prefix: string): Promise<void> => {
  // 检查Redis连接
  const isRedisAvailable = await checkRedisConnection()

  if (!isRedisAvailable) {
    console.warn(`Redis不可用，清除前缀缓存失败: ${prefix}`)
    return
  }

  try {
    const pattern = `${prefix}:*`
    const deletedCount = await redisService.delPattern(pattern)
    console.log(`Redis删除前缀缓存: ${prefix}, 删除数量: ${deletedCount}`)
  } catch (error) {
    console.error(`Redis删除前缀缓存异常: ${prefix}`, error)
  }
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
    local: 0, // 不再使用本地缓存
    redis: redisSize,
    total: redisSize,
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
      console.log('Redis连接恢复')
    } else if (wasConnected && !redisConnected.value) {
      console.warn('Redis连接断开')
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
