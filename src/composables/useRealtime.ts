import { ref, onUnmounted } from 'vue'
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

// 广播消息类型
export interface BroadcastMessage {
  event: string
  payload: any
  timestamp: string
}

// 在线状态类型
export interface PresenceState {
  user_id: string
  online_at: string
  status?: 'online' | 'away' | 'busy'
}

class RealtimeManager {
  private channels: Map<string, any> = new Map()
  private subscriptions: Map<string, Set<(event: RealtimeChangeEvent) => void>> = new Map()
  private broadcastCallbacks: Map<string, Set<(event: BroadcastMessage) => void>> = new Map()
  private presenceCallbacks: Map<string, Set<(event: any) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    try {
      // 连接到实时服务
      supabase.realtime.connect()
    } catch (error) {
      console.error('Failed to initialize realtime client:', error)
    }
  }

  public subscribeToPostgresChanges(
    channelName: string,
    config: RealtimeSubscriptionConfig,
    callback: (event: RealtimeChangeEvent) => void,
  ): string {
    // 创建新频道
    const channel = supabase.channel(channelName)

    if (!channel) {
      console.error(`Failed to create channel: ${channelName}`)
      throw new Error(`Failed to create channel: ${channelName}`)
    }

    // 设置Postgres变更订阅
    channel.on(
      'postgres_changes',
      {
        event: config.event || '*',
        schema: 'public',
        table: config.table,
        filter: config.filter ? { filter: config.filter } : undefined,
      },
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

    channel.subscribe((status: any) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${channelName}`)
      } else if (status === 'TIMED_OUT') {
        console.warn(`Subscription to ${channelName} timed out`)
      } else if (status === 'CLOSED') {
        console.warn(`Subscription to ${channelName} closed`)
      }
    })

    return channelName
  }

  public subscribeBroadcast(
    channelName: string,
    callback: (event: BroadcastMessage) => void,
  ): string {
    // 创建新频道
    const channel = supabase.channel(channelName)

    if (!channel) {
      console.error(`Failed to create channel: ${channelName}`)
      throw new Error(`Failed to create channel: ${channelName}`)
    }

    // 设置广播订阅
    channel.on('broadcast', { event: '*' }, (payload: any) => {
      const event: BroadcastMessage = {
        event: payload.event,
        payload: payload.payload,
        timestamp: new Date().toISOString(),
      }

      console.log('Broadcast message:', event)

      // 通知所有订阅者
      const callbacks = this.broadcastCallbacks.get(channelName)
      if (callbacks) {
        callbacks.forEach((cb) => cb(event))
      }
    })

    channel.subscribe((status: any) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to broadcast channel: ${channelName}`)
      } else if (status === 'TIMED_OUT') {
        console.warn(`Broadcast subscription to ${channelName} timed out`)
      } else if (status === 'CLOSED') {
        console.warn(`Broadcast subscription to ${channelName} closed`)
      }
    })

    return channelName
  }

  public subscribePresence(channelName: string, callback: (event: any) => void): string {
    // 创建新频道
    const channel = supabase.channel(channelName)

    if (!channel) {
      console.error(`Failed to create channel: ${channelName}`)
      throw new Error(`Failed to create channel: ${channelName}`)
    }

    // 设置在线状态订阅
    channel.on('presence', { event: '*' }, (payload: any) => {
      console.log('Presence event:', payload)

      // 通知所有订阅者
      const callbacks = this.presenceCallbacks.get(channelName)
      if (callbacks) {
        callbacks.forEach((cb) => cb(payload))
      }
    })

    channel.subscribe((status: any) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to presence channel: ${channelName}`)
      } else if (status === 'TIMED_OUT') {
        console.warn(`Presence subscription to ${channelName} timed out`)
      } else if (status === 'CLOSED') {
        console.warn(`Presence subscription to ${channelName} closed`)
      }
    })

    return channelName
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
    const channelNameToUse = this.subscribeToPostgresChanges(channelName, config, callback)

    // 保存频道和订阅
    this.channels.set(channelNameToUse, channelNameToUse)
    const callbacks = this.subscriptions.get(channelNameToUse) || new Set()
    callbacks.add(callback)
    this.subscriptions.set(channelNameToUse, callbacks)

    return channelNameToUse
  }

  public subscribeBroadcast(
    channelName: string,
    callback: (event: BroadcastMessage) => void,
  ): string {
    const channelNameToUse = `broadcast:${channelName}`

    // 如果频道已存在，添加新的回调
    if (this.channels.has(channelNameToUse)) {
      const callbacks = this.broadcastCallbacks.get(channelNameToUse) || new Set()
      callbacks.add(callback)
      this.broadcastCallbacks.set(channelNameToUse, callbacks)
      return channelNameToUse
    }

    // 创建新频道并订阅
    const channelNameToUse = this.subscribeBroadcast(channelName, callback)

    // 保存频道和订阅
    this.channels.set(channelNameToUse, channelNameToUse)
    const callbacks = this.broadcastCallbacks.get(channelNameToUse) || new Set()
    callbacks.add(callback)
    this.broadcastCallbacks.set(channelNameToUse, callbacks)

    return channelNameToUse
  }

  public subscribePresence(channelName: string, callback: (event: any) => void): string {
    const channelNameToUse = `presence:${channelName}`

    // 如果频道已存在，添加新的回调
    if (this.channels.has(channelNameToUse)) {
      const callbacks = this.presenceCallbacks.get(channelNameToUse) || new Set()
      callbacks.add(callback)
      this.presenceCallbacks.set(channelNameToUse, callbacks)
      return channelNameToUse
    }

    // 创建新频道并订阅
    const channelNameToUse = this.subscribePresence(channelName, callback)

    // 保存频道和订阅
    this.channels.set(channelNameToUse, channelNameToUse)
    const callbacks = this.presenceCallbacks.get(channelNameToUse) || new Set()
    callbacks.add(callback)
    this.presenceCallbacks.set(channelNameToUse, callbacks)

    return channelNameToUse
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

  public unsubscribeBroadcast(channelName: string, callback?: (event: BroadcastMessage) => void) {
    const channelNameToUse = `broadcast:${channelName}`
    const callbacks = this.broadcastCallbacks.get(channelNameToUse)
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
      const channel = this.channels.get(channelNameToUse)
      if (channel) {
        channel.unsubscribe()
        this.channels.delete(channelNameToUse)
      }
      this.broadcastCallbacks.delete(channelNameToUse)
    }
  }

  public unsubscribePresence(channelName: string, callback?: (event: any) => void) {
    const channelNameToUse = `presence:${channelName}`
    const callbacks = this.presenceCallbacks.get(channelNameToUse)
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
      const channel = this.channels.get(channelNameToUse)
      if (channel) {
        channel.unsubscribe()
        this.channels.delete(channelNameToUse)
      }
      this.presenceCallbacks.delete(channelNameToUse)
    }
  }

  public sendBroadcast(channelName: string, event: string, payload: any) {
    const channelNameToUse = `broadcast:${channelName}`
    const channel = this.channels.get(channelNameToUse)
    if (!channel) {
      console.error(`Channel ${channelNameToUse} not found`)
      return
    }

    channel.send({
      type: 'broadcast',
      event: event,
      payload: payload,
    })
  }

  public trackPresence(channelName: string, state: PresenceState) {
    const channelNameToUse = `presence:${channelName}`
    const channel = this.channels.get(channelNameToUse)
    if (!channel) {
      console.error(`Channel ${channelNameToUse} not found`)
      return
    }

    channel.track(state)
  }

  public untrackPresence(channelName: string) {
    const channelNameToUse = `presence:${channelName}`
    const channel = this.channels.get(channelNameToUse)
    if (!channel) {
      console.error(`Channel ${channelNameToUse} not found`)
      return
    }

    channel.untrack()
  }

  public disconnect() {
    // 取消所有订阅
    for (const [channelName] of this.channels) {
      this.unsubscribe(channelName)
      this.unsubscribeBroadcast(channelName)
      this.unsubscribePresence(channelName)
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

  // 订阅广播消息
  const subscribeBroadcast = (channelName: string, callback: (event: BroadcastMessage) => void) => {
    return realtimeManager.subscribeBroadcast(channelName, callback)
  }

  // 订阅在线状态
  const subscribePresence = (channelName: string, callback: (event: any) => void) => {
    return realtimeManager.subscribePresence(channelName, callback)
  }

  // 取消订阅
  const unsubscribe = (channelName: string, callback?: (event: RealtimeChangeEvent) => void) => {
    realtimeManager.unsubscribe(channelName, callback)
  }

  // 发送广播消息
  const sendBroadcast = (channelName: string, event: string, payload: any) => {
    realtimeManager.sendBroadcast(channelName, event, payload)
  }

  // 跟踪在线状态
  const trackPresence = (channelName: string, state: PresenceState) => {
    realtimeManager.trackPresence(channelName, state)
  }

  // 取消跟踪在线状态
  const untrackPresence = (channelName: string) => {
    realtimeManager.untrackPresence(channelName)
  }

  // 手动断开连接
  const disconnect = () => {
    realtimeManager.disconnect()
  }

  return {
    connectionState,
    subscribe,
    subscribeBroadcast,
    subscribePresence,
    unsubscribe,
    sendBroadcast,
    trackPresence,
    untrackPresence,
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
