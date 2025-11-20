// Supabase缓存客户端 - 替代Redis
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 缓存配置接口
interface CacheConfig {
  key: string
  ttl?: number // 缓存时间（秒）
  version?: string // 缓存版本
}

// 缓存条目接口
interface CacheEntry {
  id: string
  cache_key: string
  cache_value: any
  expires_at: string | null
  created_at: string
  updated_at: string
}

class SupabaseCache {
  private supabase: SupabaseClient<any>
  private connected = false

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )
    this.connected = true
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.connected
  }

  // 生成缓存键
  private generateCacheKey(key: string, config?: CacheConfig): string {
    const version = config?.version || '1.0.0'
    return `${key}:${version}`
  }

  // 设置缓存
  async set<T>(key: string, data: T, config?: CacheConfig): Promise<boolean> {
    try {
      const cacheKey = this.generateCacheKey(key, config)
      const ttl = config?.ttl || 30 // 默认30秒，减少缓存时间提高性能感知

      // 计算过期时间
      const expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + ttl)

      const { error } = await this.supabase.from('cache').upsert(
        {
          cache_key: cacheKey,
          cache_value: data,
          expires_at: expiresAt.toISOString(),
        },
        {
          onConflict: 'cache_key',
        },
      )

      if (error) {
        console.error(`Supabase缓存设置失败: ${key}`, error)
        return false
      }

      console.log(`Supabase缓存设置成功: ${key} (TTL: ${ttl}s)`)
      return true
    } catch (error) {
      console.error(`Supabase缓存设置异常: ${key}`, error)
      return false
    }
  }

  // 获取缓存
  async get<T>(key: string, config?: CacheConfig): Promise<T | null> {
    try {
      const cacheKey = this.generateCacheKey(key, config)

      const { data, error } = await this.supabase
        .from('cache')
        .select('cache_value, expires_at')
        .eq('cache_key', cacheKey)
        .single()

      if (error) {
        console.error(`Supabase缓存获取失败: ${key}`, error)
        return null
      }

      if (!data) {
        console.log(`Supabase缓存未命中: ${key}`)
        return null
      }

      // 检查是否过期
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        console.log(`Supabase缓存已过期: ${key}`)
        // 删除过期缓存
        await this.remove(key, config)
        return null
      }

      console.log(`Supabase缓存命中: ${key}`)
      return data.cache_value as T
    } catch (error) {
      console.error(`Supabase缓存获取异常: ${key}`, error)
      return null
    }
  }

  // 删除缓存
  async remove(key: string, config?: CacheConfig): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(key, config)

      const { error } = await this.supabase.from('cache').delete().eq('cache_key', cacheKey)

      if (error) {
        console.error(`Supabase缓存删除失败: ${key}`, error)
      } else {
        console.log(`Supabase缓存删除成功: ${key}`)
      }
    } catch (error) {
      console.error(`Supabase缓存删除异常: ${key}`, error)
    }
  }

  // 清除所有缓存
  async clearAll(): Promise<void> {
    try {
      const { error } = await this.supabase.from('cache').delete().neq('cache_key', 'never') // 删除所有记录

      if (error) {
        console.error('Supabase清空缓存失败:', error)
      } else {
        console.log('Supabase缓存已清空')
      }
    } catch (error) {
      console.error('Supabase清空缓存异常:', error)
    }
  }

  // 清除特定前缀的缓存
  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const cacheKey = `${prefix}:*`

      const { error } = await this.supabase.from('cache').delete().like('cache_key', `${prefix}:%`)

      if (error) {
        console.error(`Supabase删除前缀缓存失败: ${prefix}`, error)
      } else {
        console.log(`Supabase删除前缀缓存: ${prefix}`)
      }
    } catch (error) {
      console.error(`Supabase删除前缀缓存异常: ${prefix}`, error)
    }
  }

  // 获取缓存统计
  async getStats(): Promise<{
    total: number
    connected: boolean
    info: string
  }> {
    try {
      const { count, error } = await this.supabase
        .from('cache')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.warn('获取Supabase统计失败:', error)
        return {
          total: 0,
          connected: this.connected,
          info: JSON.stringify(
            {
              type: 'supabase',
              status: this.connected ? 'connected' : 'disconnected',
              error: (error as any)?.message,
            },
            null,
            2,
          ),
        }
      }

      return {
        total: count || 0,
        connected: this.connected,
        info: JSON.stringify(
          {
            type: 'supabase',
            status: this.connected ? 'connected' : 'disconnected',
            total: count || 0,
          },
          null,
          2,
        ),
      }
    } catch (error) {
      console.warn('获取Supabase统计异常:', error)
      return {
        total: 0,
        connected: false,
        info: JSON.stringify(
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

  // 手动清理过期缓存
  async cleanupExpired(): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('cleanup_expired_cache')

      if (error) {
        console.error('清理过期缓存失败:', error)
      } else {
        console.log('过期缓存清理完成')
      }
    } catch (error) {
      console.error('清理过期缓存异常:', error)
    }
  }
}

// 创建单例实例
const supabaseCache = new SupabaseCache()

// 导出缓存客户端
export default supabaseCache
export type { CacheConfig, CacheEntry }
