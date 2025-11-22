<template>
  <div class="file-upload">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :data="uploadData"
      :before-upload="beforeUpload"
      :on-progress="onProgress"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="handleRemove"
      :file-list="fileList"
      :multiple="multiple"
      :accept="accept"
      :limit="limit"
      :drag="drag"
      :show-file-list="showFileList"
      :auto-upload="autoUpload"
      :on-preview="handlePreview"
      class="upload-container"
    >
      <div v-if="drag" class="upload-dragger">
        <el-icon class="upload-icon"><upload-filled /></el-icon>
        <div class="upload-text">
          <p>将文件拖拽到此处，或<em>点击上传</em></p>
          <p class="upload-hint">{{ uploadHint }}</p>
        </div>
      </div>

      <el-button v-else type="primary" :loading="uploading">
        <el-icon><upload /></el-icon>
        {{ uploading ? '上传中...' : '选择文件' }}
      </el-button>

      <template #tip>
        <div class="upload-tip">
          <el-icon><info-filled /></el-icon>
          <span>{{ tip }}</span>
        </div>
      </template>
    </el-upload>

    <!-- 上传进度对话框 -->
    <el-dialog
      v-model="progressVisible"
      title="文件上传进度"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <div v-for="file in uploadingFiles" :key="file.uid" class="progress-item">
          <div class="progress-info">
            <el-icon><document /></el-icon>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size || 0) }}</span>
          </div>
          <el-progress
            :percentage="Number(file.percentage) || 0"
            :status="
              file.status === 'success' ? 'success' : file.status === 'fail' ? 'exception' : ''
            "
          />
          <div v-if="file.status === 'fail'" class="error-message">
            {{ file.errorMessage }}
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="progressVisible = false" :disabled="hasUploading">
          {{ hasUploading ? '上传中...' : '关闭' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <div class="preview-content">
        <img :src="previewUrl" :alt="previewFileData?.name" class="preview-image" />
        <div class="preview-info">
          <p><strong>文件名:</strong> {{ previewFileData?.name }}</p>
          <p><strong>文件大小:</strong> {{ formatFileSize(previewFileData?.size || 0) }}</p>
          <p><strong>文件类型:</strong> {{ previewFileData?.type }}</p>
          <p><strong>上传时间:</strong> {{ formatDate(previewFileData?.uploadTime) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Upload, InfoFilled, Document } from '@element-plus/icons-vue'
import type { UploadUserFile } from 'element-plus'
import MinIOService from '@/utils/minio'

// 扩展UploadUserFile接口
interface ExtendedUploadFile {
  uid: number
  name: string
  size?: number
  status?: 'uploading' | 'success' | 'fail'
  percentage?: number
  errorMessage?: string
  uploadTime?: string
  type?: string
  key?: string
  url?: string
  response?: unknown
  raw?: File
}

// Props
interface Props {
  modelValue?: string | string[] // 支持v-model绑定
  multiple?: boolean
  accept?: string
  limit?: number
  drag?: boolean
  showFileList?: boolean
  autoUpload?: boolean
  maxSize?: number // 最大文件大小 (MB)
  tip?: string
  bucket?: string // MinIO 存储桶名称
  folder?: string // 存储文件夹路径
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  accept: '*/*',
  limit: 10,
  drag: true,
  showFileList: true,
  autoUpload: true,
  maxSize: 10, // 默认10MB
  tip: '支持jpg、png、gif、pdf、doc、docx等格式，单个文件不超过10MB',
  bucket: 'project-showcase',
  folder: '',
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: string | string[]): void
  (e: 'update:fileList', files: UploadUserFile[]): void
  (e: 'success', response: unknown, file: UploadUserFile): void
  (e: 'error', error: Error, file: UploadUserFile): void
  (e: 'remove', file: UploadUserFile): void
}

const emit = defineEmits<Emits>()

// 组件状态
const uploadRef = ref()
const fileList = ref<ExtendedUploadFile[]>([])
const uploading = ref(false)
const uploadingFiles = ref<ExtendedUploadFile[]>([])
const progressVisible = ref(false)
const previewVisible = ref(false)
const previewUrl = ref('')
const previewFileData = ref<ExtendedUploadFile | null>(null)

// 计算属性
const uploadUrl = computed(() => {
  // 暂时返回占位URL，实际上传会在前端处理
  return '#'
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${localStorage.getItem('supabase_token') || ''}`,
  }
})

const uploadData = computed(() => {
  return {
    bucket: props.bucket,
    folder: props.folder,
  }
})

const uploadHint = computed(() => {
  const size = props.maxSize
  const types = props.accept === '*/*' ? '所有文件' : props.accept
  return `支持 ${types} 格式，单个文件不超过 ${size}MB`
})

const hasUploading = computed(() => {
  return uploadingFiles.value.some((file) => file.status === 'uploading')
})

// 监听文件列表变化
watch(fileList, (newFiles) => {
  emit('update:fileList', newFiles as UploadUserFile[])

  // 更新v-model值
  if (props.multiple) {
    const urls = newFiles.filter((f) => f.url).map((f) => f.url!)
    emit('update:modelValue', urls)
  } else {
    // 单文件模式：只取最后一个成功上传的文件
    const successFiles = newFiles.filter((f) => f.status === 'success' && f.url)
    const lastFile = successFiles[successFiles.length - 1]
    emit('update:modelValue', lastFile?.url || '')
  }
})

// 监听v-model变化，初始化文件列表
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      if (props.multiple && Array.isArray(newValue)) {
        // 多文件模式
        fileList.value = newValue.map((url, index) => ({
          uid: Date.now() + index,
          name: url.split('/').pop() || `file-${index}`,
          url,
          status: 'success' as const,
          percentage: 100,
        }))
      } else if (!props.multiple && typeof newValue === 'string') {
        // 单文件模式
        fileList.value = [
          {
            uid: Date.now(),
            name: newValue.split('/').pop() || 'file',
            url: newValue,
            status: 'success' as const,
            percentage: 100,
          },
        ]
      }
    } else {
      fileList.value = []
    }
  },
  { immediate: true },
)

// 上传前检查和实际上传
const beforeUpload = async (file: UploadUserFile) => {
  // 文件大小检查
  const isLtMaxSize = (file.size || 0) / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  // 文件类型检查
  if (props.accept !== '*/*') {
    const acceptTypes = props.accept.split(',').map((type) => type.trim())
    const fileType = file.raw?.type || ''
    const isValidType = acceptTypes.some((type) => {
      if (type.startsWith('.')) {
        return file.name?.toLowerCase().endsWith(type.toLowerCase())
      }
      return fileType.includes(type.replace('*', ''))
    })

    if (!isValidType) {
      ElMessage.error(`不支持的文件类型: ${fileType}`)
      return false
    }
  }

  // 使用MinIO进行实际上传
  try {
    // Element Plus的UploadUserFile中，文件可能在raw属性中，也可能直接是file对象
    const fileObj = file.raw || file
    if (!fileObj || !(fileObj instanceof File)) {
      throw new Error('文件对象无效')
    }

    // 创建上传进度跟踪
    const uploadFile: ExtendedUploadFile = {
      uid: file.uid || Date.now(),
      name: file.name,
      size: file.size,
      status: 'uploading',
      percentage: 0,
      uploadTime: new Date().toISOString(),
      raw: file.raw,
    }

    uploadingFiles.value.push(uploadFile)
    progressVisible.value = true

    // 使用MinIO上传文件
    const result = await MinIOService.uploadFile(
      fileObj,
      props.bucket,
      props.folder,
      (progress: number) => {
        // 更新上传进度
        uploadFile.percentage = Math.round(progress)
        const index = uploadingFiles.value.findIndex((f) => f.uid === file.uid)
        if (index !== -1) {
          uploadingFiles.value[index] = { ...uploadFile }
        }
      },
    )

    if (result.success && result.url) {
      // 上传成功
      uploadFile.status = 'success'
      uploadFile.percentage = 100
      uploadFile.url = result.url
      uploadFile.key = result.key

      // 添加到文件列表，确保格式符合Element Plus要求
      const fileToAdd: ExtendedUploadFile = {
        ...uploadFile,
        name: file.name,
        size: file.size,
        type: (file as any).raw?.type || (file as any).type,
        raw: (file as any).raw,
      }

      // 单文件模式：替换现有文件
      if (!props.multiple) {
        // 移除所有现有文件，只保留新上传的文件
        fileList.value = [fileToAdd]
      } else {
        // 多文件模式：添加到列表
        fileList.value.push(fileToAdd)
      }

      emit('success', { url: result.url, fileName: result.key }, file)
      ElMessage.success('文件上传成功!')

      // 移除上传进度
      setTimeout(() => {
        const uploadIndex = uploadingFiles.value.findIndex((f) => f.uid === file.uid)
        if (uploadIndex !== -1) {
          uploadingFiles.value.splice(uploadIndex, 1)
        }
      }, 1000)
    } else {
      // 上传失败
      uploadFile.status = 'fail'
      uploadFile.errorMessage = result.error || '上传失败'
      emit('error', new Error(result.error || '上传失败'), file)
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Upload error:', error)
    }

    // 创建失败记录
    const uploadFile: ExtendedUploadFile = {
      uid: file.uid || Date.now(),
      name: file.name,
      size: file.size,
      status: 'fail',
      errorMessage: error instanceof Error ? error.message : '上传失败，请重试',
      raw: file.raw,
    }
    uploadingFiles.value.push(uploadFile)
    emit('error', error instanceof Error ? error : new Error('上传失败'), file)
  }

  // 阻止Element Plus的默认上传行为
  return false
}

// 上传进度
const onProgress = (event: { percent: number }, file: UploadUserFile) => {
  const index = uploadingFiles.value.findIndex((f) => f.uid === file.uid)
  if (index !== -1 && uploadingFiles.value[index]) {
    uploadingFiles.value[index].percentage = Math.round(event.percent)
  }
}

// 上传成功
const onSuccess = (response: unknown, file: UploadUserFile) => {
  // 由于我们在beforeUpload中处理了上传逻辑，这里主要是为了兼容Element Plus
  // console.log('Upload success:', response, file)
}

// 上传失败
const onError = (error: Error, file: UploadUserFile) => {
  const index = uploadingFiles.value.findIndex((f) => f.uid === file.uid)
  if (index !== -1 && uploadingFiles.value[index]) {
    uploadingFiles.value[index].status = 'fail'
    uploadingFiles.value[index].errorMessage = error.message
  }

  emit('error', error, file)
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(size) / Math.log(1024))
  const formattedSize = size / Math.pow(1024, index)

  return `${formattedSize.toFixed(2)} ${units[index]}`
}

// 格式化日期
const formatDate = (date?: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 处理文件预览
const handlePreview = (file: UploadUserFile) => {
  const extendedFile = file as ExtendedUploadFile

  if (extendedFile.url) {
    // 如果是图片文件，显示预览
    if (extendedFile.type?.startsWith('image/')) {
      previewUrl.value = extendedFile.url
      previewFileData.value = extendedFile
      previewVisible.value = true
    } else {
      // 非图片文件，下载或在新窗口打开
      window.open(extendedFile.url, '_blank')
    }
  }
}

// 处理文件删除
const handleRemove = (file: UploadUserFile) => {
  const extendedFile = file as ExtendedUploadFile

  // 从fileList中移除文件
  const index = fileList.value.findIndex((f) => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }

  // 通知父组件文件被删除
  emit('remove', file)

  // 更新v-model值
  if (props.multiple) {
    const urls = fileList.value.filter((f) => f.url).map((f) => f.url!)
    emit('update:modelValue', urls)
  } else {
    // 单文件模式：清空值
    emit('update:modelValue', '')
  }
}

// 清空上传列表
const clearFiles = () => {
  fileList.value = []
  uploadingFiles.value = []
}

// 暴露方法
defineExpose({
  clearFiles,
  uploadRef,
})
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-container {
  width: 100%;
}

.upload-dragger {
  width: 100%;
  padding: 40px 20px;
  border: 2px dashed var(--border-primary);
  border-radius: 8px;
  background: var(--bg-secondary);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-dragger:hover {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.upload-icon {
  font-size: 48px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.upload-text {
  color: var(--text-primary);
}

.upload-text p {
  margin: 8px 0;
  line-height: 1.5;
}

.upload-text em {
  color: var(--accent-primary);
  font-style: normal;
  font-weight: bold;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.upload-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.progress-content {
  max-height: 400px;
  overflow-y: auto;
}

.progress-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--card-bg);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.file-name {
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: var(--text-secondary);
}

.error-message {
  margin-top: 8px;
  padding: 8px;
  background: var(--error);
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.preview-content {
  display: flex;
  gap: 20px;
}

.preview-image {
  max-width: 400px;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.preview-info {
  flex: 1;
}

.preview-info p {
  margin: 8px 0;
  line-height: 1.6;
}

/* 深色主题适配 */
[data-theme='dark'] .upload-dragger {
  border-color: var(--border-secondary);
}

[data-theme='dark'] .upload-dragger:hover {
  border-color: var(--accent-primary);
  background: var(--bg-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-dragger {
    padding: 30px 15px;
  }

  .upload-icon {
    font-size: 36px;
  }

  .preview-content {
    flex-direction: column;
  }

  .preview-image {
    max-width: 100%;
    max-height: 300px;
  }
}
</style>
