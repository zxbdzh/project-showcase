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
      :on-remove="onRemove"
      :file-list="fileList"
      :multiple="multiple"
      :accept="accept"
      :limit="limit"
      :drag="drag"
      :show-file-list="showFileList"
      :auto-upload="autoUpload"
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
  bucket: 'uploads',
  folder: '',
})

// Emits
interface Emits {
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
})

// 上传前检查
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

  // 模拟文件上传 - 临时解决方案
  try {
    // 创建上传进度
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

    // 模拟上传过程
    const simulateUpload = async () => {
      for (let progressValue = 0; progressValue <= 100; progressValue += 10) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        uploadFile.percentage = progressValue

        // 更新上传文件列表中的进度
        const index = uploadingFiles.value.findIndex((f) => f.uid === file.uid)
        if (index !== -1) {
          uploadingFiles.value[index] = { ...uploadFile }
        }
      }

      if (progressValue === 100) {
        uploadFile.status = 'success'
        uploadFile.percentage = 100

        // 生成模拟的文件URL
        const fileUrl = `https://placeholder.com/files/${file.name}`
        uploadFile.url = fileUrl

        // 添加到文件列表
        fileList.value.push({ ...uploadFile })

        emit('success', { url: fileUrl }, file)
        ElMessage.success('文件上传成功!')

        // 移除上传进度
        setTimeout(() => {
          const uploadIndex = uploadingFiles.value.findIndex((f) => f.uid === file.uid)
          if (uploadIndex !== -1) {
            uploadingFiles.value.splice(uploadIndex, 1)
          }
        }, 1000)
      }
    }

    simulateUpload()
  } catch (error) {
    console.error('Upload error:', error)
    const uploadFile: ExtendedUploadFile = {
      uid: file.uid || Date.now(),
      name: file.name,
      size: file.size,
      status: 'fail',
      errorMessage: '上传失败，请重试',
      raw: file.raw,
    }
    uploadingFiles.value.push(uploadFile)
    emit('error', new Error('上传失败'), file)
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
  console.log('Upload success:', response, file)
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

// 移除文件
const onRemove = async (file: UploadUserFile) => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 "${file.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 从文件列表中移除
    const index = fileList.value.findIndex((f) => f.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }

    emit('remove', file)
    ElMessage.success('文件删除成功')
  } catch {
    // 用户取消删除
  }
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
