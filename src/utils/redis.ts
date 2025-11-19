// Redis配置接口
interface RedisConfig {
  host: string
  port: number
  password?: string
  database?: number
}

// 连接状态
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

// Redis服务类
class RedisService {
  private client: any = null
  private config: RedisConfig | null = null
  private connectionStatus: ConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // 1秒
  private healthCheckInterval: any = null

  // 初始化Redis客户端
  private initClient(): any {
    if (!this.config) {
      throw new Error('Redis配置未设置')
    }

    // 在浏览器环境中，不创建真实的Redis客户端
    if (typeof window !== 'undefined') {
      console.warn('浏览器环境不支持Redis客户端，缓存功能将不可用')
      return null
    }

    // 动态导入Redis客户端（仅在服务器端）
    try {
      // 使用Function构造器替代eval，更安全
      const requireRedis = new Function('return require')('redis')
      const { createClient } = requireRedis
      return createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
          reconnectStrategy: (retries: number) => {
            if (retries > this.maxReconnectAttempts) {
              console.error('Redis重连次数超过限制，停止重连')
              return false
            }
            return Math.min(retries * this.reconnectDelay, 5000)
          },
        },
        password: this.config.password,
        database: this.config.database || 0,
      })
    } catch (error: any) {
      console.error('Redis客户端初始化失败:', error)
      return null
    }
  }

  // 设置配置
  setConfig(config: RedisConfig): void {
    this.config = config
    this.client = this.initClient()
  }

  // 获取配置
  getConfig(): RedisConfig | null {
    return this.config
  }

  // 连接Redis
  async connect(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        console.warn('浏览器环境不支持Redis连接')
        this.connectionStatus = 'error'
        return false
      }

      if (!this.client) {
        throw new Error('Redis客户端未初始化')
      }

      this.connectionStatus = 'connecting'
      console.log('正在连接Redis...')

      // 设置事件监听器
      this.client.on('error', (error: any) => {
        console.error('Redis连接错误:', error)
        this.connectionStatus = 'error'
      })

      this.client.on('connect', () => {
        console.log('Redis连接成功')
        this.connectionStatus = 'connected'
        this.reconnectAttempts = 0
        this.startHealthCheck()
      })

      this.client.on('disconnect', () => {
        console.log('Redis连接断开')
        this.connectionStatus = 'disconnected'
        this.stopHealthCheck()
      })

      this.client.on('reconnecting', () => {
        console.log('Redis正在重连...')
        this.connectionStatus = 'connecting'
        this.reconnectAttempts++
      })

      await this.client.connect()

      // 测试连接
      await this.client.ping()
      console.log('Redis连接测试成功')

      return true
    } catch (error: any) {
      console.error('Redis连接失败:', error)
      this.connectionStatus = 'error'
      return false
    }
  }

  // 断开连接
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit()
        this.client = null
      }
      this.connectionStatus = 'disconnected'
      this.stopHealthCheck()
      console.log('Redis连接已断开')
    } catch (error: any) {
      console.error('Redis断开连接失败:', error)
    }
  }

  // 获取连接状态
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  // 检查连接是否可用
  async isHealthy(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        return false // 浏览器环境不支持Redis
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        return false
      }
      await this.client.ping()
      return true
    } catch (error: any) {
      console.error('Redis健康检查失败:', error)
      this.connectionStatus = 'error'
      return false
    }
  }

  // 开始健康检查
  private startHealthCheck(): void {
    this.stopHealthCheck()
    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.isHealthy()
      if (!isHealthy && this.connectionStatus === 'connected') {
        console.warn('Redis健康检查失败，尝试重连...')
        this.connectionStatus = 'error'
      }
    }, 30000) // 每30秒检查一次
  }

  // 停止健康检查
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        console.warn('浏览器环境不支持Redis缓存设置')
        return false
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        throw new Error('Redis未连接')
      }

      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
      })

      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue)
      } else {
        await this.client.set(key, serializedValue)
      }

      console.log(`Redis缓存设置成功: ${key}`)
      return true
    } catch (error: any) {
      console.error('Redis设置缓存失败:', error)
      return false
    }
  }

  // 获取缓存
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (typeof window !== 'undefined') {
        console.warn('浏览器环境不支持Redis缓存获取')
        return null
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        throw new Error('Redis未连接')
      }

      const value = await this.client.get(key)
      if (!value) {
        console.log(`Redis缓存未命中: ${key}`)
        return null
      }

      const parsed = JSON.parse(value)
      console.log(`Redis缓存命中: ${key}`)
      return parsed.data
    } catch (error: any) {
      console.error('Redis获取缓存失败:', error)
      return null
    }
  }

  // 删除缓存
  async del(key: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        console.warn('浏览器环境不支持Redis缓存删除')
        return false
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        throw new Error('Redis未连接')
      }

      const result = await this.client.del(key)
      console.log(`Redis缓存删除: ${key}, 结果: ${result}`)
      return result > 0
    } catch (error: any) {
      console.error('Redis删除缓存失败:', error)
      return false
    }
  }

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        return false
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        return false
      }

      const result = await this.client.exists(key)
      return result > 0
    } catch (error: any) {
      console.error('Redis检查键存在失败:', error)
      return false
    }
  }

  // 设置过期时间
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        console.warn('浏览器环境不支持Redis设置过期时间')
        return false
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        return false
      }

      const result = await this.client.expire(key, ttl)
      return result > 0
    } catch (error: any) {
      console.error('Redis设置过期时间失败:', error)
      return false
    }
  }

  // 获取剩余过期时间
  async ttl(key: string): Promise<number> {
    try {
      if (typeof window !== 'undefined') {
        return -1
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        return -1
      }

      return await this.client.ttl(key)
    } catch (error: any) {
      console.error('Redis获取TTL失败:', error)
      return -1
    }
  }

  // 批量删除（通过模式匹配）
  async delPattern(pattern: string): Promise<number> {
    try {
      if (typeof window !== 'undefined') {
        console.warn('浏览器环境不支持Redis批量删除')
        return 0
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        return 0
      }

      const keys = await this.client.keys(pattern)
      if (keys.length === 0) {
        return 0
      }

      const result = await this.client.del(keys)
      console.log(`Redis批量删除模式: ${pattern}, 删除数量: ${result}`)
      return result
    } catch (error: any) {
      console.error('Redis批量删除失败:', error)
      return 0
    }
  }

  // 获取所有匹配的键
  async keys(pattern: string): Promise<string[]> {
    try {
      if (typeof window !== 'undefined') {
        return []
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        return []
      }

      return await this.client.keys(pattern)
    } catch (error: any) {
      console.error('Redis获取键列表失败:', error)
      return []
    }
  }

  // 清空数据库
  async flushDb(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        console.warn('浏览器环境不支持Redis清空数据库')
        return false
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        return false
      }

      await this.client.flushDb()
      console.log('Redis数据库已清空')
      return true
    } catch (error: any) {
      console.error('Redis清空数据库失败:', error)
      return false
    }
  }

  // 获取连接信息
  async getInfo(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined') {
        return JSON.stringify(
          {
            type: 'browser',
            status: this.connectionStatus,
            message: '浏览器环境不支持Redis',
          },
          null,
          2,
        )
      }

      if (!this.client || this.connectionStatus !== 'connected') {
        return null
      }

      return await this.client.info()
    } catch (error: any) {
      console.error('Redis获取信息失败:', error)
      return null
    }
  }
}

// 创建单例实例
const redisService = new RedisService()

// 从环境变量初始化配置
const redisConfig: RedisConfig = {
  host: import.meta.env.VITE_REDIS_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_REDIS_PORT || '6379'),
  password: import.meta.env.VITE_REDIS_PASSWORD,
  database: parseInt(import.meta.env.VITE_REDIS_DB || '0'),
}

// 设置配置
redisService.setConfig(redisConfig)

// 尝试自动连接（仅在服务器端）
if (typeof window === 'undefined') {
  redisService.connect().catch((error: any) => {
    console.warn('Redis自动连接失败，将在需要时重试:', error)
  })
}

export default redisService

// 导出类型
export type { RedisConfig }
