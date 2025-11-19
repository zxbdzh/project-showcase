import { ref, onUnmounted } from 'vue'
import { RealtimeChannel } from '@supabase/realtime-js'
import { supabase } from '@/utils/supabase'

// 实时连接状态
export interface RealtimeConnectionState {
  connected: boolean
  connecting: boolean
  error: string | null
}

// 数据变更事件类型
export interface RealtimeChangeEvent<T = any> {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  old_record?: T
  record?: T
  timestamp: string
}

// 实时订阅配置
export interface RealtimeSubscriptionConfig {
  table: string
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
}

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptions: Map<string, Set<(event: RealtimeChangeEvent) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    try {
      // 监听连接状态
      supabase.realtime.onOpen(() => {
        console.log('Realtime connection opened')
        this.handleConnect()
      })

      supabase.realtime.onClose(() => {
        console.log('Realtime connection closed')
        this.handleDisconnect()
      })

      supabase.realtime.onError((error: any) => {
        console.error('Realtime connection error:', error)
        this.handleError(error)
      })

      // 连接到实时服务
      supabase.realtime.connect()
    } catch (error) {
      console.error('Failed to initialize realtime client:', error)
    }
  }

  private handleConnect() {
    this.reconnectAttempts = 0
    // 通知所有订阅者连接状态变化
    this.notifyConnectionStateChange(true)
  }

  private handleDisconnect() {
    this.notifyConnectionStateChange(false)
    this.attemptReconnect()
  }

  private handleError(error: any) {
    console.error('Realtime error:', error)
    this.notifyConnectionStateChange(false, error.message)
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`,
      )

      setTimeout(() => {
        this.initializeClient()
        this.resubscribeAll()
      }, delay)
    } else {
      console.error('Max reconnect attempts reached')
    }
  }

  private notifyConnectionStateChange(connected: boolean, error: string | null = null) {
    // 这里可以添加全局状态管理或事件总线通知
    window.dispatchEvent(
      new CustomEvent('realtime-connection-change', {
        detail: { connected, error },
      }),
    )
  }

  private resubscribeAll() {
    // 重新订阅所有频道
    for (const [channelName, config] of this.channels) {
      this.subscribeToChannel(channelName, config)
    }
  }

  private subscribeToChannel(
    channelName: string,
    config: RealtimeSubscriptionConfig,
  ): RealtimeChannel {
    // 创建新频道
    const channel = supabase.channel(channelName)

    if (!channel) {
      console.error(`Failed to create channel: ${channelName}`)
      throw new Error(`Failed to create channel: ${channelName}`)
    }

    // 设置订阅
    channel
      .onPostgresChanges(
        config.event || '*',
        [config.table],
        config.filter ? { filter: config.filter } : undefined,
        (payload: any) => {
          const event: RealtimeChangeEvent = {
            type: payload.eventType,
            table: payload.table,
            schema: payload.schema,
            old_record: payload.old,
            record: payload.new,
            timestamp: new Date().toISOString(),
          }

          console.log('Realtime change event:', event)

          // 通知所有订阅者
          const callbacks = this.subscriptions.get(channelName)
          if (callbacks) {
            callbacks.forEach((cb) => cb(event))
          }
        },
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${channelName}`)
        } else if (status === 'TIMED_OUT') {
          console.warn(`Subscription to ${channelName} timed out`)
        } else if (status === 'CLOSED') {
          console.warn(`Subscription to ${channelName} closed`)
        }
      })

    return channel
  }

  public subscribe(
    config: RealtimeSubscriptionConfig,
    callback: (event: RealtimeChangeEvent) => void,
  ): string {
    const channelName = `public:${config.table}`

    // 如果频道已存在，添加新的回调
    if (this.channels.has(channelName)) {
      const callbacks = this.subscriptions.get(channelName) || new Set()
      callbacks.add(callback)
      this.subscriptions.set(channelName, callbacks)
      return channelName
    }

    // 创建新频道并订阅
    const channel = this.subscribeToChannel(channelName, config)

    // 保存频道和订阅
    this.channels.set(channelName, channel)
    const callbacks = this.subscriptions.get(channelName) || new Set()
    callbacks.add(callback)
    this.subscriptions.set(channelName, callbacks)

    return channelName
  }

  public unsubscribe(channelName: string, callback?: (event: RealtimeChangeEvent) => void) {
    const callbacks = this.subscriptions.get(channelName)
    if (!callbacks) return

    if (callback) {
      // 移除特定回调
      callbacks.delete(callback)
    } else {
      // 移除所有回调
      callbacks.clear()
    }

    // 如果没有回调了，取消订阅
    if (callbacks.size === 0) {
      const channel = this.channels.get(channelName)
      if (channel) {
        channel.unsubscribe()
        this.channels.delete(channelName)
      }
      this.subscriptions.delete(channelName)
    }
  }

  public disconnect() {
    // 取消所有订阅
    for (const [channelName] of this.channels) {
      this.unsubscribe(channelName)
    }

    // 断开连接
    supabase.realtime.disconnect()
  }

  public getConnectionState(): RealtimeConnectionState {
    return {
      connected: this.reconnectAttempts === 0,
      connecting: this.reconnectAttempts > 0 && this.reconnectAttempts < this.maxReconnectAttempts,
      error: null,
    }
  }
}

// 全局实时管理器实例
const realtimeManager = new RealtimeManager()

// Vue composable
export function useRealtime() {
  const connectionState = ref<RealtimeConnectionState>({
    connected: false,
    connecting: false,
    error: null,
  })

  // 监听连接状态变化
  const handleConnectionChange = (event: CustomEvent) => {
    connectionState.value = event.detail
  }

  // 添加事件监听器
  window.addEventListener('realtime-connection-change', handleConnectionChange as EventListener)

  // 组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener(
      'realtime-connection-change',
      handleConnectionChange as EventListener,
    )
  })

  // 订阅数据变更
  const subscribe = (
    config: RealtimeSubscriptionConfig,
    callback: (event: RealtimeChangeEvent) => void,
  ) => {
    return realtimeManager.subscribe(config, callback)
  }

  // 取消订阅
  const unsubscribe = (channelName: string, callback?: (event: RealtimeChangeEvent) => void) => {
    realtimeManager.unsubscribe(channelName, callback)
  }

  // 手动断开连接
  const disconnect = () => {
    realtimeManager.disconnect()
  }

  return {
    connectionState,
    subscribe,
    unsubscribe,
    disconnect,
  }
}

// 便捷的订阅函数
export function useRealtimeTable<T = any>(
  tableName: string,
  callback: (event: RealtimeChangeEvent<T>) => void,
  filter?: string,
) {
  const { subscribe, unsubscribe } = useRealtime()

  const channelName = subscribe({ table: tableName, filter }, callback)

  // 返回取消订阅函数
  return () => {
    unsubscribe(channelName, callback)
  }
}

// 批量订阅多个表
export function useRealtimeTables(
  tables: string[],
  callback: (event: RealtimeChangeEvent) => void,
) {
  const { subscribe, unsubscribe } = useRealtime()
  const subscriptions: string[] = []

  tables.forEach((table) => {
    const channelName = subscribe({ table: table }, callback)
    subscriptions.push(channelName)
  })

  // 返回取消所有订阅的函数
  return () => {
    subscriptions.forEach((channelName) => {
      unsubscribe(channelName, callback)
    })
  }
}

// 导出管理器实例，用于全局操作
export { realtimeManager }
