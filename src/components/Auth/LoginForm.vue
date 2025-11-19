<template>
  <div class="login-form">
    <div class="login-form__header">
      <glitch-text text="LOGIN" :color="isDark ? '#00ff41' : '#0066cc'" />
      <p class="login-form__subtitle">访问您的极客空间</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      class="login-form__form"
      @submit.prevent="handleSubmit"
    >
      <el-form-item prop="email">
        <el-input
          v-model="form.email"
          type="email"
          placeholder="邮箱地址"
          size="large"
          :prefix-icon="Message"
          :disabled="loading"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码"
          size="large"
          :prefix-icon="Lock"
          :disabled="loading"
          show-password
          @keyup.enter="handleSubmit"
        />
      </el-form-item>

      <div class="login-form__actions">
        <el-checkbox v-model="form.remember" :disabled="loading"> 记住我 </el-checkbox>
        <el-button type="text" :disabled="loading" @click="handleResetPassword">
          忘记密码？
        </el-button>
      </div>

      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="login-form__submit"
          @click="handleSubmit"
        >
          <span v-if="!loading">登录</span>
          <span v-else>连接中...</span>
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
      class="login-form__error"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElForm, type FormInstance, type FormRules } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import GlitchText from '@/components/GlitchText.vue'
import ChangePasswordDialog from '@/components/Auth/ChangePasswordDialog.vue'

interface Emits {
  (e: 'switch-mode', mode: 'register' | 'login'): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

const { signIn, loading, error, clearError } = useAuth()
const { isDark } = useTheme()

const formRef = ref<FormInstance>()
const showChangePasswordDialog = ref(false)
const form = reactive({
  email: '',
  password: '',
  remember: false,
})

// 表单验证规则
const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
}

// 处理登录
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    clearError()

    const result = await signIn(form.email, form.password)

    if (result.success) {
      ElMessage.success('登录成功！')

      // 记住登录状态
      if (form.remember) {
        localStorage.setItem('remember_email', form.email)
      } else {
        localStorage.removeItem('remember_email')
      }

      emit('success')
    } else {
      ElMessage.error(result.error || '登录失败')
    }
  } catch (err) {
    console.error('Form validation error:', err)
  }
}

// 处理重置密码
const handleResetPassword = async () => {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  try {
    const { resetPassword } = useAuth()
    const result = await resetPassword(form.email)

    if (result.success) {
      ElMessage.success('密码重置邮件已发送，请检查您的邮箱')
    } else {
      ElMessage.error(result.error || '发送重置邮件失败')
    }
  } catch (err) {
    console.error('Reset password error:', err)
  }
}

// 初始化时检查记住的邮箱
const initRememberedEmail = () => {
  const rememberedEmail = localStorage.getItem('remember_email')
  if (rememberedEmail) {
    form.email = rememberedEmail
    form.remember = true
  }
}

// 组件挂载时初始化
initRememberedEmail()
</script>

<style scoped>
.login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--shadow-color);
}

.login-form__header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-form__subtitle {
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.login-form__form {
  margin-bottom: 1.5rem;
}

.login-form__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.login-form__submit {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
  transition: all 0.3s ease;
}

.login-form__submit:hover {
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
  box-shadow: 0 0 16px var(--shadow-color);
  transform: translateY(-2px);
}

.login-form__footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-secondary);
}

.login-form__change-password {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.login-form__error {
  margin-top: 1rem;
}

/* 深色主题样式 */
[data-theme='dark'] .login-form {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  box-shadow: 0 8px 32px rgba(0, 255, 65, 0.2);
}

/* 浅色主题样式 */
[data-theme='light'] .login-form {
  background: var(--card-bg);
  border-color: var(--border-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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

:deep(.el-checkbox__label) {
  color: var(--text-secondary);
}

:deep(.el-button--text) {
  color: var(--accent-primary);
}

:deep(.el-button--text:hover) {
  color: var(--accent-secondary);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-form {
    padding: 1.5rem;
    margin: 0 1rem;
  }

  .login-form__actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .login-form {
    border-width: 2px;
  }

  .login-form__submit {
    border-width: 2px;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .login-form__submit {
    transition: none;
  }

  .login-form__submit:hover {
    transform: none;
  }
}
</style>
