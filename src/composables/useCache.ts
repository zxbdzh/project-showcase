// 缓存管理 - 使用Supabase替代Redis
import { ref, computed } from 'vue'
import supabaseCache from '@/utils/supabaseCache'

// 缓存配置
interface CacheConfig {
  key: string
  ttl?: number // 缓存时间（秒）
  version?: string // 缓存版本
}

// 全局缓存状态
const cacheVersion = ref('1.0.0')
const cacheEnabled = ref(true)
const supabaseConnected = ref(false)

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

// 检查Supabase连接状态
const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const isConnected = supabaseCache.isConnected()
    supabaseConnected.value = isConnected
    return isConnected
  } catch (error) {
    console.error('Supabase连接检查失败:', error)
    supabaseConnected.value = false
    return false
  }
}

// 设置缓存
const setCache = async <T>(key: string, data: T, config?: CacheConfig): Promise<boolean> => {
  if (!cacheEnabled.value) {
    console.log(`缓存已禁用，跳过设置: ${key}`)
    return false
  }

  try {
    const cacheKey = generateCacheKey(key, config)
    const ttl = config?.ttl || 5 * 60 // 默认5分钟

    // 检查Supabase连接
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      console.warn(`Supabase不可用，缓存设置失败: ${key}`)
      return false
    }

    // 设置缓存
    const success = await supabaseCache.set(key, data, config)
    if (success) {
      console.log(`Supabase缓存设置成功: ${key}`)
    }
    return success
  } catch (error) {
    console.error(`Supabase缓存设置异常: ${key}`, error)
    return false
  }
}

// 获取缓存
const getCache = async <T>(key: string, config?: CacheConfig): Promise<T | null> => {
  if (!cacheEnabled.value) {
    console.log(`缓存已禁用，跳过获取: ${key}`)
    return null
  }

  try {
    const cacheKey = generateCacheKey(key, config)

    // 检查Supabase连接
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      console.warn(`Supabase不可用，缓存获取失败: ${key}`)
      return null
    }

    // 获取缓存
    const data = await supabaseCache.get<T>(key, config)
    return data
  } catch (error) {
    console.error(`Supabase缓存获取异常: ${key}`, error)
    return null
  }
}

// 删除缓存
const removeCache = async (key: string, config?: CacheConfig): Promise<void> => {
  try {
    const cacheKey = generateCacheKey(key, config)

    // 检查Supabase连接
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      console.warn(`Supabase不可用，缓存删除失败: ${key}`)
      return
    }

    // 删除缓存
    await supabaseCache.remove(key, config)
    console.log(`Supabase缓存删除成功: ${key}`)
  } catch (error) {
    console.error(`Supabase缓存删除异常: ${key}`, error)
  }
}

// 清除所有缓存
const clearAllCache = async (): Promise<void> => {
  try {
    // 检查Supabase连接
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      console.warn('Supabase不可用，清空缓存失败')
      return
    }

    // 清空缓存
    await supabaseCache.clearAll()
    console.log('Supabase缓存已清空')
  } catch (error) {
    console.error('Supabase清空缓存异常:', error)
  }
}

// 清除特定前缀的缓存
const clearCacheByPrefix = async (prefix: string): Promise<void> => {
  try {
    // 检查Supabase连接
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      console.warn(`Supabase不可用，清除前缀缓存失败: ${prefix}`)
      return
    }

    // 清除前缀缓存
    await supabaseCache.clearByPrefix(prefix)
    console.log(`Supabase删除前缀缓存: ${prefix}`)
  } catch (error) {
    console.error(`Supabase删除前缀缓存异常: ${prefix}`, error)
  }
}

// 缓存装饰器函数
const withCache = <T>(key: string, fetchFn: () => Promise<T>, config?: CacheConfig) => {
  return async (): Promise<T> => {
    // 检查是否启用缓存
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
    const routeStrategy = getCurrentRouteCacheStrategy(pathname)
    if (!routeStrategy.enabled) {
      console.log(`缓存禁用路由: ${pathname}`)
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
  try {
    // 检查Supabase连接
    const isConnected = await checkSupabaseConnection()

    // 获取统计信息
    const stats = await supabaseCache.getStats()

    return {
      local: 0, // 不再使用本地缓存
      redis: stats.total,
      total: stats.total,
      redisConnected: supabaseConnected.value,
      redisInfo: stats.info,
    }
  } catch (error) {
    console.warn('获取Supabase统计失败:', error)
    return {
      local: 0,
      redis: 0,
      total: 0,
      redisConnected: false,
      redisInfo: JSON.stringify(
        {
          type: 'supabase',
          status: 'error',
          error: (error as any)?.message,
        },
        null,
        2,
      ),
    }
  }
}

// 监听Supabase连接状态变化
const monitorSupabaseConnection = () => {
  setInterval(async () => {
    const wasConnected = supabaseConnected.value
    const isConnected = await checkSupabaseConnection()

    if (!wasConnected && isConnected) {
      console.log('Supabase连接恢复')
    } else if (wasConnected && !isConnected) {
      console.warn('Supabase连接断开')
    }
  }, 5000) // 每5秒检查一次
}

// 启动连接监控
monitorSupabaseConnection()

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
    redisConnected: computed(() => supabaseConnected.value),

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

    // Supabase相关
    checkSupabaseConnection,
    getRedisStatus: () => (supabaseConnected.value ? 'connected' : 'disconnected'),
  }
}
