// Redis客户端 - 按照CSDN文章实现
import Redis from 'ioredis'

// 创建Redis客户端实例
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
})

// 连接事件监听
redis.on('connect', () => {
  console.log('Redis连接成功')
})

redis.on('error', (error) => {
  console.error('Redis连接错误:', error)
})

redis.on('close', () => {
  console.log('Redis连接关闭')
})

export default redis
