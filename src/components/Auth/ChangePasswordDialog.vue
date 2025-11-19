<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="400px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          type="email"
          placeholder="请输入邮箱地址"
          :prefix-icon="Message"
          :disabled="loading"
        />
      </el-form-item>

      <el-form-item label="当前密码" prop="currentPassword">
        <el-input
          v-model="form.currentPassword"
          type="password"
          placeholder="请输入当前密码"
          :prefix-icon="Lock"
          :disabled="loading"
          show-password
        />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          :prefix-icon="Lock"
          :disabled="loading"
          show-password
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          :prefix-icon="Lock"
          :disabled="loading"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading"> 修改密码 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElForm, type FormInstance, type FormRules } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth'

interface Props {
  modelValue: boolean
  email?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  email: '',
})

const emit = defineEmits<Emits>()

const { updatePassword, loading, error, clearError } = useAuth()

const formRef = ref<FormInstance>()
const visible = ref(false)

const form = reactive({
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单验证规则
const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && value === form.currentPassword) {
          callback(new Error('新密码不能与当前密码相同'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 监听 visible 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 重置表单
      form.email = props.email || ''
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
      clearError()
    }
  },
)

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    clearError()

    const result = await updatePassword(form.currentPassword, form.newPassword)

    if (result.success) {
      ElMessage.success('密码修改成功！')
      handleClose()
      emit('success')
    } else {
      ElMessage.error(result.error || '修改密码失败')
    }
  } catch (err) {
    console.error('Form validation error:', err)
  }
}

// 处理关闭
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-input__wrapper) {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--accent-primary);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.2);
}

:deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 500;
}

/* 深色主题适配 */
[data-theme='dark'] .el-dialog {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
}

[data-theme='dark'] .el-dialog__header {
  border-bottom: 1px solid var(--border-secondary);
}

[data-theme='dark'] .el-dialog__title {
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 480px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5vh auto;
  }

  :deep(.el-form-item__label) {
    width: 70px !important;
  }
}
</style>
