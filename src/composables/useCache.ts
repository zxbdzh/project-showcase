// 缓存管理 - 按照CSDN文章实现
import { ref, computed } from 'vue'
import redis from '@/utils/redisClient'

// 缓存配置
interface CacheConfig {
  key: string
  ttl?: number // 缓存时间（秒）
  version?: string // 缓存版本
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
  // 浏览器环境不支持Redis，直接返回false
  if (typeof window !== 'undefined') {
    redisConnected.value = false
    return false
  }

  try {
    // 尝试ping Redis
    await redis.ping()
    redisConnected.value = true
    return true
  } catch (error) {
    console.error('Redis连接检查失败:', error)
    redisConnected.value = false
    return false
  }
}

// 设置缓存
const setCache = async <T>(key: string, data: T, config?: CacheConfig): Promise<boolean> => {
  if (!cacheEnabled.value) {
    console.log(`缓存已禁用，跳过设置: ${key}`)
    return false
  }

  // 浏览器环境不支持Redis，直接返回false
  if (typeof window !== 'undefined') {
    console.log(`浏览器环境跳过缓存设置: ${key}`)
    return false
  }

  const cacheKey = generateCacheKey(key, config)
  const ttl = config?.ttl || 5 * 60 // 默认5分钟（秒）

  try {
    // 检查Redis连接
    const isConnected = await checkRedisConnection()
    if (!isConnected) {
      console.warn(`Redis不可用，缓存设置失败: ${key}`)
      return false
    }

    // 设置缓存，带过期时间
    await redis.set(cacheKey, JSON.stringify(data), 'EX', ttl)
    console.log(`Redis缓存设置成功: ${key}`)
    return true
  } catch (error) {
    console.error(`Redis缓存设置异常: ${key}`, error)
    return false
  }
}

// 获取缓存
const getCache = async <T>(key: string, config?: CacheConfig): Promise<T | null> => {
  if (!cacheEnabled.value) {
    console.log(`缓存已禁用，跳过获取: ${key}`)
    return null
  }

  // 浏览器环境不支持Redis，直接返回null
  if (typeof window !== 'undefined') {
    console.log(`浏览器环境跳过缓存获取: ${key}`)
    return null
  }

  const cacheKey = generateCacheKey(key, config)

  try {
    // 检查Redis连接
    const isConnected = await checkRedisConnection()
    if (!isConnected) {
      console.warn(`Redis不可用，缓存获取失败: ${key}`)
      return null
    }

    // 获取缓存
    const data = await redis.get(cacheKey)
    if (data !== null) {
      console.log(`Redis缓存命中: ${key}`)
      return JSON.parse(data)
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
  // 浏览器环境不支持Redis，直接返回
  if (typeof window !== 'undefined') {
    console.log(`浏览器环境跳过缓存删除: ${key}`)
    return
  }

  const cacheKey = generateCacheKey(key, config)

  try {
    // 检查Redis连接
    const isConnected = await checkRedisConnection()
    if (!isConnected) {
      console.warn(`Redis不可用，缓存删除失败: ${key}`)
      return
    }

    // 删除缓存
    await redis.del(cacheKey)
    console.log(`Redis缓存删除成功: ${key}`)
  } catch (error) {
    console.error(`Redis缓存删除异常: ${key}`, error)
  }
}

// 清除所有缓存
const clearAllCache = async (): Promise<void> => {
  // 浏览器环境不支持Redis，直接返回
  if (typeof window !== 'undefined') {
    console.log('浏览器环境跳过清空缓存')
    return
  }

  try {
    // 检查Redis连接
    const isConnected = await checkRedisConnection()
    if (!isConnected) {
      console.warn('Redis不可用，清空缓存失败')
      return
    }

    // 清空数据库
    await redis.flushdb()
    console.log('Redis缓存已清空')
  } catch (error) {
    console.error('Redis清空缓存异常:', error)
  }
}

// 清除特定前缀的缓存
const clearCacheByPrefix = async (prefix: string): Promise<void> => {
  // 浏览器环境不支持Redis，直接返回
  if (typeof window !== 'undefined') {
    console.log(`浏览器环境跳过清除前缀缓存: ${prefix}`)
    return
  }

  try {
    // 检查Redis连接
    const isConnected = await checkRedisConnection()
    if (!isConnected) {
      console.warn(`Redis不可用，清除前缀缓存失败: ${prefix}`)
      return
    }

    // 获取匹配的键
    const pattern = `${prefix}:*`
    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      // 删除匹配的键
      await redis.del(...keys)
      console.log(`Redis删除前缀缓存: ${prefix}, 删除数量: ${keys.length}`)
    } else {
      console.log(`Redis前缀缓存为空: ${prefix}`)
    }
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

  // 浏览器环境不支持Redis，返回默认值
  if (typeof window !== 'undefined') {
    return {
      local: 0, // 不再使用本地缓存
      redis: 0,
      total: 0,
      redisConnected: false,
      redisInfo: JSON.stringify(
        {
          type: 'browser',
          status: 'disconnected',
          message: '浏览器环境不支持Redis',
        },
        null,
        2,
      ),
    }
  }

  try {
    // 检查Redis连接
    const isConnected = await checkRedisConnection()
    if (isConnected) {
      // 获取Redis信息
      redisInfo = (await redis.info()) || ''

      // 获取键的数量
      const keys = await redis.keys('*')
      redisSize = keys.length
    }
  } catch (error) {
    console.warn('获取Redis统计失败:', error)
  }

  return {
    local: 0, // 不再使用本地缓存
    redis: redisSize,
    total: redisSize,
    redisConnected: redisConnected.value,
    redisInfo,
  }
}

// 监听Redis连接状态变化（仅在服务器端）
const monitorRedisConnection = () => {
  // 浏览器环境不进行监控
  if (typeof window !== 'undefined') {
    return
  }

  setInterval(async () => {
    const wasConnected = redisConnected.value
    const isConnected = await checkRedisConnection()

    if (!wasConnected && isConnected) {
      console.log('Redis连接恢复')
    } else if (wasConnected && !isConnected) {
      console.warn('Redis连接断开')
    }
  }, 5000) // 每5秒检查一次
}

// 启动连接监控（仅在服务器端）
if (typeof window === 'undefined') {
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
    getRedisStatus: () => (redisConnected.value ? 'connected' : 'disconnected'),
  }
}
