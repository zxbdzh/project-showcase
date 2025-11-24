<template>
  <el-dialog v-model="visible" title="快捷添加标签" width="400px" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入标签名称" />
      </el-form-item>

      <el-form-item label="标签颜色" prop="color">
        <el-color-picker v-model="formData.color" />
      </el-form-item>

      <el-form-item label="标签描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入标签描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting"> 创建标签 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  color: '#6B7280',
  description: '',
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 20, message: '名称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  color: [{ required: true, message: '请选择标签颜色', trigger: 'change' }],
  description: [
    { required: true, message: '请输入标签描述', trigger: 'blur' },
    { min: 5, max: 100, message: '描述长度在 5 到 100 个字符', trigger: 'blur' },
  ],
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    color: '#6B7280',
    description: '',
  })
  formRef.value?.clearValidate()
}

// 处理关闭
const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 获取 useTags composable
    const { createTag } = (await import('@/composables/useData')).useTags()

    await createTag(formData)
    ElMessage.success('标签创建成功')

    emit('success')
    handleClose()
  } catch (error) {
    console.error('创建标签失败:', error)
    ElMessage.error('创建标签失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 组件样式继承 Element Plus 主题 */
</style>
