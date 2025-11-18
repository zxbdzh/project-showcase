// 浏览器兼容的 MinIO 实现
// 注意：在浏览器环境中，我们应该使用预签名URL通过API上传文件
// 而不是直接使用 MinIO 客户端

// MinIO 配置
const minioConfig = {
  endPoint: import.meta.env.VITE_MINIO_ENDPOINT || 'localhost',
  port: parseInt(import.meta.env.VITE_MINIO_PORT || '9000'),
  useSSL: import.meta.env.VITE_MINIO_USE_SSL === 'true',
  accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY || '',
  secretKey: import.meta.env.VITE_MINIO_SECRET_KEY || '',
  region: import.meta.env.VITE_MINIO_REGION || 'us-east-1',
}

// 验证配置
if (!minioConfig.accessKey || !minioConfig.secretKey) {
  console.warn('MinIO credentials not found in environment variables')
}

// 浏览器兼容的 MinIO 客户端模拟
export const minioClient = {
  // 在浏览器环境中，这些方法将通过 API 调用实现
  bucketExists: async (bucketName: string) => {
    // 通过 API 检查存储桶是否存在
    const response = await fetch(`/api/minio/bucket-exists/${bucketName}`)
    return response.json()
  },
  makeBucket: async (bucketName: string, region: string) => {
    // 通过 API 创建存储桶
    const response = await fetch('/api/minio/make-bucket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName, region }),
    })
    return response.json()
  },
  setBucketPolicy: async (bucketName: string, policy: string) => {
    // 通过 API 设置存储桶策略
    const response = await fetch('/api/minio/set-bucket-policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName, policy }),
    })
    return response.json()
  },
  putObject: async (
    bucketName: string,
    objectName: string,
    buffer: ArrayBuffer,
    size: number,
    metaData: Record<string, string>,
  ) => {
    // 通过预签名URL上传文件
    const presignedUrl = await minioClient.presignedPutObject(bucketName, objectName, 3600)

    const formData = new FormData()
    const blob = new Blob([buffer], { type: metaData['Content-Type'] })
    formData.append('file', blob)

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': metaData['Content-Type'] || 'application/octet-stream',
        'Content-Length': size.toString(),
      },
    })

    return response.json()
  },
  removeObject: async (bucketName: string, objectName: string) => {
    // 通过预签名URL删除文件
    const presignedUrl = await minioClient.presignedGetObject(bucketName, objectName, 3600)
    const response = await fetch(presignedUrl, { method: 'DELETE' })
    return response.json()
  },
  presignedGetObject: async (bucketName: string, objectName: string, expiry = 3600) => {
    // 通过 API 获取预签名URL
    const response = await fetch(`/api/minio/presigned-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName, objectName, expiry }),
    })
    const data = await response.json()
    return data.url
  },
  presignedPutObject: async (bucketName: string, objectName: string, expiry = 3600) => {
    // 通过 API 获取预签名上传URL
    const response = await fetch(`/api/minio/presigned-put-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName, objectName, expiry }),
    })
    const data = await response.json()
    return data.url
  },
  statObject: async (bucketName: string, objectName: string) => {
    // 通过 API 获取文件信息
    const response = await fetch(`/api/minio/stat-object/${bucketName}/${objectName}`)
    return response.json()
  },
  listObjects: (bucketName: string, prefix: string, recursive: boolean) => {
    // 返回一个模拟的流对象
    return {
      on: (event: string, callback: (data: any) => void) => {
        if (event === 'data') {
          // 模拟数据事件
          setTimeout(() => {
            callback({ name: 'example.txt', size: 1024, lastModified: new Date() })
          }, 100)
        } else if (event === 'end') {
          // 模拟结束事件
          setTimeout(() => callback(null), 200)
        } else if (event === 'error') {
          // 模拟错误事件
          setTimeout(() => callback(new Error('Not implemented in browser')), 300)
        }
      },
    }
  },
}

// 存储桶配置
export const BUCKETS = {
  AVATARS: 'avatars',
  PROJECTS: 'projects',
  UPLOADS: 'uploads',
  TEMP: 'temp',
} as const

// 文件类型配置
export const FILE_TYPES = {
  IMAGE: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    maxSize: 5 * 1024 * 1024, // 5MB
    mimeType: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] as const,
  },
  DOCUMENT: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.md'],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeType: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ] as const,
  },
  VIDEO: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeType: [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
    ] as const,
  },
  ARCHIVE: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeType: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ] as const,
  },
} as const

// 文件上传接口
export interface UploadOptions {
  bucket: string
  objectName: string
  file: File
  metadata?: Record<string, string>
  onProgress?: (progress: number) => void
}

// 文件信息接口
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: Date
  etag?: string
  metadata?: Record<string, string>
}

// 上传结果接口
export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  fileName?: string
}

// MinIO 工具类
export class MinIOService {
  /**
   * 初始化存储桶
   */
  static async initBuckets(): Promise<void> {
    try {
      for (const bucketName of Object.values(BUCKETS)) {
        const exists = await minioClient.bucketExists(bucketName)
        if (!exists) {
          await minioClient.makeBucket(bucketName, minioConfig.region)
          console.log(`Bucket ${bucketName} created successfully`)

          // 设置存储桶策略为公共读取
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucketName}/*`],
              },
            ],
          }
          await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy))
        }
      }
    } catch (error) {
      console.error('Error initializing buckets:', error)
      throw error
    }
  }

  /**
   * 上传文件
   */
  static async uploadFile(options: UploadOptions): Promise<UploadResult> {
    try {
      const { bucket, objectName, file, metadata, onProgress } = options

      // 验证文件类型和大小
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // 准备元数据
      const metaData = {
        'Content-Type': file.type,
        'X-Amz-Meta-Original-Name': file.name,
        'X-Amz-Meta-Upload-Time': new Date().toISOString(),
        ...metadata,
      }

      // 将File转换为ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // 上传文件
      const result = await minioClient.putObject(
        bucket,
        objectName,
        arrayBuffer,
        file.size,
        metaData,
      )

      // 生成文件URL
      const url = await this.getFileUrl(bucket, objectName)

      return {
        success: true,
        url,
        fileName: objectName,
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(bucket: string, objectName: string): Promise<boolean> {
    try {
      await minioClient.removeObject(bucket, objectName)
      return true
    } catch (error) {
      console.error('Delete error:', error)
      return false
    }
  }

  /**
   * 获取文件URL
   */
  static async getFileUrl(
    bucket: string,
    objectName: string,
    expiry = 24 * 60 * 60,
  ): Promise<string> {
    try {
      return await minioClient.presignedGetObject(bucket, objectName, expiry)
    } catch (error) {
      console.error('Get URL error:', error)
      throw error
    }
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(bucket: string, objectName: string): Promise<FileInfo | null> {
    try {
      const stat = await minioClient.statObject(bucket, objectName)
      return {
        name: objectName,
        size: stat.size,
        type: stat.metaData?.['content-type'] || 'application/octet-stream',
        lastModified: stat.lastModified,
        etag: stat.etag,
        metadata: stat.metaData,
      }
    } catch (error) {
      console.error('Get file info error:', error)
      return null
    }
  }

  /**
   * 列出存储桶中的文件
   */
  static async listFiles(bucket: string, prefix = ''): Promise<FileInfo[]> {
    try {
      const files: FileInfo[] = []
      const stream = minioClient.listObjects(bucket, prefix, true)

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          files.push({
            name: obj.name || '',
            size: obj.size || 0,
            type: 'application/octet-stream',
            lastModified: obj.lastModified || new Date(),
            etag: obj.etag,
          })
        })

        stream.on('error', (error) => {
          reject(error)
        })

        stream.on('end', () => {
          resolve(files)
        })
      })
    } catch (error) {
      console.error('List files error:', error)
      return []
    }
  }

  /**
   * 验证文件
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大小
    const maxSize = 50 * 1024 * 1024 // 默认50MB
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` }
    }

    // 检查文件类型
    const isImage = FILE_TYPES.IMAGE.mimeType.includes(file.type as any)
    const isDocument = FILE_TYPES.DOCUMENT.mimeType.includes(file.type as any)
    const isVideo = FILE_TYPES.VIDEO.mimeType.includes(file.type as any)
    const isArchive = FILE_TYPES.ARCHIVE.mimeType.includes(file.type as any)

    if (!isImage && !isDocument && !isVideo && !isArchive) {
      return { valid: false, error: 'Unsupported file type' }
    }

    return { valid: true }
  }

  /**
   * 生成唯一文件名
   */
  static generateFileName(originalName: string, prefix = ''): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    const baseName = originalName.split('.').slice(0, -1).join('.')

    return prefix
      ? `${prefix}/${timestamp}_${random}_${baseName}.${extension}`
      : `${timestamp}_${random}_${baseName}.${extension}`
  }

  /**
   * 获取文件类型
   */
  static getFileType(file: File): 'image' | 'document' | 'video' | 'archive' | 'unknown' {
    if (FILE_TYPES.IMAGE.mimeType.includes(file.type as any)) return 'image'
    if (FILE_TYPES.DOCUMENT.mimeType.includes(file.type as any)) return 'document'
    if (FILE_TYPES.VIDEO.mimeType.includes(file.type as any)) return 'video'
    if (FILE_TYPES.ARCHIVE.mimeType.includes(file.type as any)) return 'archive'
    return 'unknown'
  }
}

// 导出默认实例
export default MinIOService
