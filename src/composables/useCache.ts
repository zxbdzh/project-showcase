// 缓存管理 - 使用localStorage + 版本控制
import { ref, computed } from 'vue'
import localCache from '@/utils/localCache'

// 缓存配置
interface CacheConfig {
  key: string
  ttl?: number // 缓存时间（毫秒）
  dataType: string // 数据类型，用于版本控制
}

// 全局缓存状态
const cacheVersion = ref('1.0.0')
const cacheEnabled = ref(true)

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

// 设置缓存
const setCache = async <T>(key: string, data: T, config: CacheConfig): Promise<boolean> => {
  if (!cacheEnabled.value) {
    console.log(`缓存已禁用，跳过设置: ${key}`)
    return false
  }

  try {
    const ttl = config?.ttl || 30 * 60 * 1000 // 默认30分钟
    const success = await localCache.set(key, data, config.dataType, ttl)
    return success
  } catch (error) {
    console.error(`本地缓存设置异常: ${key}`, error)
    return false
  }
}

// 获取缓存
const getCache = async <T>(key: string, config: CacheConfig): Promise<T | null> => {
  if (!cacheEnabled.value) {
    console.log(`缓存已禁用，跳过获取: ${key}`)
    return null
  }

  try {
    const data = await localCache.get<T>(key, config.dataType)
    return data
  } catch (error) {
    console.error(`本地缓存获取异常: ${key}`, error)
    return null
  }
}

// 删除缓存
const removeCache = (key: string): void => {
  try {
    localCache.remove(key)
  } catch (error) {
    console.error(`本地缓存删除异常: ${key}`, error)
  }
}

// 清除所有缓存
const clearAllCache = (): void => {
  try {
    localCache.clearAll()
  } catch (error) {
    console.error('清空本地缓存异常:', error)
  }
}

// 清除特定前缀的缓存
const clearCacheByPrefix = (prefix: string): void => {
  try {
    localCache.clearByPrefix(prefix)
  } catch (error) {
    console.error(`删除前缀缓存异常: ${prefix}`, error)
  }
}

// 缓存装饰器函数
const withCache = <T>(key: string, fetchFn: () => Promise<T>, config: CacheConfig) => {
  return async (): Promise<T> => {
    // 检查是否启用缓存
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
    const routeStrategy = getCurrentRouteCacheStrategy(pathname)
    if (!routeStrategy.enabled) {
      console.log(`缓存禁用路由: ${pathname}`)
      return await fetchFn()
    }

    const startTime = performance.now()

    try {
      // 先检查缓存
      const cached = await getCache<T>(key, config)
      if (cached !== null) {
        const cacheTime = performance.now() - startTime
        console.log(`本地缓存命中: ${key} (${cacheTime.toFixed(2)}ms)`)
        return cached
      }

      // 缓存未命中，获取数据
      const data = await fetchFn()

      // 异步存储到缓存（不阻塞返回）
      setCache(key, data, config).catch((error) => {
        console.warn(`缓存存储失败 ${key}:`, error)
      })

      const fetchTime = performance.now() - startTime
      console.log(`数据获取: ${key} (${fetchTime.toFixed(2)}ms)`)
      return data
    } catch (error) {
      const fetchTime = performance.now() - startTime
      console.error(`数据获取失败 ${key} (${fetchTime.toFixed(2)}ms):`, error)
      throw error
    }
  }
}

// 缓存统计
const getCacheStats = () => {
  try {
    const stats = localCache.getStats()
    return {
      local: stats.total,
      redis: 0, // 不再使用Redis
      total: stats.total,
      redisConnected: false,
      redisInfo: JSON.stringify(
        {
          type: 'localStorage',
          status: 'active',
          ...stats,
        },
        null,
        2,
      ),
    }
  } catch (error) {
    console.warn('获取本地缓存统计失败:', error)
    return {
      local: 0,
      redis: 0,
      total: 0,
      redisConnected: false,
      redisInfo: JSON.stringify(
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

// 更新版本号（后台操作时调用）
const updateDataVersion = async (dataType: string): Promise<boolean> => {
  try {
    const success = await localCache.updateVersion(dataType)
    return success
  } catch (error) {
    console.error(`更新版本号异常: ${dataType}`, error)
    return false
  }
}

// 定期清理过期缓存
const setupCleanupInterval = () => {
  // 每10分钟清理一次过期缓存
  setInterval(
    () => {
      localCache.cleanupExpired()
    },
    10 * 60 * 1000,
  )
}

// 启动清理任务
if (typeof window !== 'undefined') {
  setupCleanupInterval()
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
    redisConnected: computed(() => false), // 不再使用Redis

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

    // 版本控制
    updateDataVersion,
    getLocalStorageStatus: () => 'active',
  }
}
