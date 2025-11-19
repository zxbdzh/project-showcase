import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'

// S3配置接口
interface S3Config {
  endPoint: string
  accessKey: string
  secretKey: string
  bucketName: string
  region: string
}

// 文件上传结果接口
export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

// 文件信息接口
export interface FileInfo {
  key: string
  size: number
  lastModified: Date
  contentType: string
  etag: string
}

// MinIO服务类
class MinIOService {
  private client: S3Client | null = null
  private config: S3Config | null = null

  // 初始化S3客户端
  private initClient(): S3Client {
    if (!this.config) {
      throw new Error('MinIO配置未设置')
    }

    return new S3Client({
      region: this.config.region,
      endpoint: this.config.endPoint,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: true, // 重要：MinIO需要这个设置
    })
  }

  // 设置配置
  setConfig(config: S3Config): void {
    this.config = config
    this.client = this.initClient()
  }

  // 获取配置
  getConfig(): S3Config | null {
    return this.config
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('S3客户端未初始化')
      }

      const testKey = `test-${Date.now()}.txt`

      // 上传测试文件
      const putCommand = new PutObjectCommand({
        Bucket: this.config!.bucketName,
        Key: testKey,
        Body: 'test',
        ContentType: 'text/plain',
      })

      const putResponse = await this.client.send(putCommand)

      if (putResponse.$metadata.httpStatusCode !== 200) {
        return false
      }

      // 删除测试文件
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.config!.bucketName,
        Key: testKey,
      })

      await this.client.send(deleteCommand)

      return true
    } catch (error) {
      console.error('MinIO连接测试失败:', error)
      return false
    }
  }

  // 上传文件
  async uploadFile(
    file: File,
    bucket: string = this.config?.bucketName || '',
    folder: string = '',
    onProgress?: (progress: number) => void,
  ): Promise<UploadResult> {
    try {
      if (!this.client) {
        throw new Error('S3客户端未初始化')
      }

      // 生成文件名
      const fileExtension = file.name.split('.').pop() || ''
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const fileName = `${timestamp}-${randomString}.${fileExtension}`

      // 构建对象键
      const objectKey = folder ? `${folder}/${fileName}` : fileName

      // 将File转换为Uint8Array以避免浏览器兼容性问题
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // 创建上传命令
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: uint8Array,
        ContentType: file.type || 'application/octet-stream',
        Metadata: {
          originalName: file.name,
          uploadTime: new Date().toISOString(),
        },
      })

      // 执行上传
      const response = await this.client.send(command)

      if (response.$metadata.httpStatusCode === 200) {
        // 构建文件URL
        const url = this.getFileUrl(objectKey)

        return {
          success: true,
          url,
          key: objectKey,
        }
      } else {
        throw new Error(`上传失败，状态码: ${response.$metadata.httpStatusCode}`)
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      }
    }
  }

  // 删除文件
  async deleteFile(key: string, bucket: string = this.config?.bucketName || ''): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('S3客户端未初始化')
      }

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      const response = await this.client.send(command)
      return response.$metadata.httpStatusCode === 200
    } catch (error) {
      console.error('文件删除失败:', error)
      return false
    }
  }

  // 获取文件信息
  async getFileInfo(
    key: string,
    bucket: string = this.config?.bucketName || '',
  ): Promise<FileInfo | null> {
    try {
      if (!this.client) {
        throw new Error('S3客户端未初始化')
      }

      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      const response = await this.client.send(command)

      if (response.$metadata.httpStatusCode === 200) {
        return {
          key,
          size: response.ContentLength || 0,
          lastModified: response.LastModified || new Date(),
          contentType: response.ContentType || 'application/octet-stream',
          etag: response.ETag || '',
        }
      }

      return null
    } catch (error) {
      console.error('获取文件信息失败:', error)
      return null
    }
  }

  // 获取文件URL
  getFileUrl(key: string, bucket: string = this.config?.bucketName || ''): string {
    if (!this.config) {
      throw new Error('MinIO配置未设置')
    }

    // 使用path style格式: http://endpoint/bucket/key
    const baseUrl = this.config.endPoint.replace(/\/$/, '')
    return `${baseUrl}/${bucket}/${key}`
  }

  // 检查文件是否存在
  async fileExists(key: string, bucket: string = this.config?.bucketName || ''): Promise<boolean> {
    const fileInfo = await this.getFileInfo(key, bucket)
    return fileInfo !== null
  }

  // 批量删除文件
  async deleteFiles(
    keys: string[],
    bucket: string = this.config?.bucketName || '',
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [], failed: [] } as { success: string[]; failed: string[] }

    for (const key of keys) {
      try {
        const success = await this.deleteFile(key, bucket)
        if (success) {
          results.success.push(key)
        } else {
          results.failed.push(key)
        }
      } catch (error) {
        results.failed.push(key)
      }
    }

    return results
  }
}

// 创建单例实例
const minioService = new MinIOService()

// 从环境变量初始化配置
const s3Config: S3Config = {
  endPoint: import.meta.env.VITE_S3_ENDPOINT || '',
  accessKey: import.meta.env.VITE_S3_ACCESS_KEY || '',
  secretKey: import.meta.env.VITE_S3_SECRET_KEY || '',
  bucketName: import.meta.env.VITE_S3_BUCKET_NAME || '',
  region: import.meta.env.VITE_S3_REGION || 'us-east-1',
}

// 如果配置完整，初始化客户端
if (s3Config.endPoint && s3Config.accessKey && s3Config.secretKey && s3Config.bucketName) {
  minioService.setConfig(s3Config)
}

export default minioService

// 导出类型
export type { S3Config }
