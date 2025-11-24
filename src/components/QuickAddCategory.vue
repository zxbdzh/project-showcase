<template>
  <el-dialog v-model="visible" title="快捷添加分类" width="500px" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" />
      </el-form-item>

      <el-form-item label="分类描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入分类描述"
        />
      </el-form-item>

      <el-form-item label="分类图标" prop="icon">
        <IconSelector v-model="formData.icon" label="分类图标" />
      </el-form-item>

      <el-form-item label="分类颜色" prop="color">
        <el-color-picker v-model="formData.color" />
      </el-form-item>

      <el-form-item label="排序" prop="sort_order">
        <el-input-number v-model="formData.sort_order" :min="0" :max="999" placeholder="排序值" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting"> 创建分类 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import IconSelector from '@/components/IconSelector.vue'

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
  description: '',
  icon: '',
  color: '#409EFF',
  sort_order: 0,
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '名称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入分类描述', trigger: 'blur' },
    { min: 5, max: 100, message: '描述长度在 5 到 100 个字符', trigger: 'blur' },
  ],
  icon: [{ required: true, message: '请选择分类图标', trigger: 'change' }],
  color: [{ required: true, message: '请选择分类颜色', trigger: 'change' }],
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
    description: '',
    icon: '',
    color: '#409EFF',
    sort_order: 0,
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

    // 获取 useCategories composable
    const { createCategory } = (await import('@/composables/useData')).useCategories()

    await createCategory(formData)
    ElMessage.success('分类创建成功')

    emit('success')
    handleClose()
  } catch (error) {
    console.error('创建分类失败:', error)
    ElMessage.error('创建分类失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 组件样式继承 Element Plus 主题 */
</style>
