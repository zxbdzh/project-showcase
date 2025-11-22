<template>
  <div class="footer-settings">
    <!-- 基础设置 -->
    <el-card class="settings-section">
      <template #header>
        <div class="section-header">
          <el-icon><Setting /></el-icon>
          <span>基础设置</span>
        </div>
      </template>

      <el-form :model="settings" label-width="120px" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用页脚">
              <el-switch v-model="settings.enabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="页脚样式">
              <el-select v-model="settings.style" placeholder="选择页脚样式">
                <el-option label="简洁样式" value="simple" />
                <el-option label="详细样式" value="detailed" />
                <el-option label="极简样式" value="minimal" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文字颜色">
              <el-color-picker v-model="settings.textColor" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="背景颜色">
              <el-color-picker v-model="settings.bgColor" :predefine="predefineColors" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="上边框">
              <el-input v-model="settings.borderTop" placeholder="如: 1px solid #e5e7eb" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="版权信息">
              <el-input
                v-model="settings.copyright"
                type="textarea"
                :rows="2"
                placeholder="版权信息，支持HTML"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 链接设置 -->
    <el-card v-if="settings.enabled" class="settings-section">
      <template #header>
        <div class="section-header">
          <el-icon><Link /></el-icon>
          <span>链接设置</span>
        </div>
      </template>

      <el-form label-width="120px" label-position="top">
        <el-form-item>
          <div class="links-header">
            <el-switch v-model="settings.linksEnabled" label="显示链接" />
            <el-button type="primary" size="small" @click="addLink">
              <el-icon><Plus /></el-icon>
              添加链接
            </el-button>
          </div>
        </el-form-item>

        <div v-if="settings.linksEnabled" class="links-list">
          <div
            v-for="(link, index) in footerLinks"
            :key="index"
            class="link-item"
          >
            <el-card class="link-card">
              <template #header>
                <div class="link-header">
                  <span>链接 {{ index + 1 }}</span>
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click="removeLink(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>

              <el-form :model="link" label-width="80px" size="small">
                <el-row :gutter="10">
                  <el-col :span="8">
                    <el-form-item label="标题">
                      <el-input v-model="link.title" placeholder="链接标题" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="类型">
                      <el-select v-model="link.type" placeholder="选择类型">
                        <el-option label="内部链接" value="internal" />
                        <el-option label="外部链接" value="external" />
                        <el-option label="法律页面" value="legal" />
                        <el-option label="社交媒体" value="social" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="排序">
                      <el-input-number v-model="link.order" :min="1" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="2">
                    <el-form-item label=" ">
                      <el-button
                        size="small"
                        circle
                        @click="moveLink(index, -1)"
                        :disabled="index === 0"
                      >
                        <el-icon><ArrowUp /></el-icon>
                      </el-button>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="URL">
                      <el-input v-model="link.url" placeholder="链接地址" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-card>
          </div>

          <el-empty v-if="footerLinks.length === 0" description="暂无链接，点击添加链接按钮创建" />
        </div>
      </el-form>
    </el-card>

    <!-- 社交链接设置 -->
    <el-card v-if="settings.enabled" class="settings-section">
      <template #header>
        <div class="section-header">
          <el-icon><Share /></el-icon>
          <span>社交链接</span>
        </div>
      </template>

      <el-form label-width="120px" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="显示社交链接">
              <el-switch v-model="settings.socialEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="社交链接样式">
              <el-select v-model="settings.socialStyle" placeholder="选择样式">
                <el-option label="水平排列" value="horizontal" />
                <el-option label="垂直排列" value="vertical" />
                <el-option label="图标样式" value="icons" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 响应式设置 -->
    <el-card v-if="settings.enabled && settings.style === 'detailed'" class="settings-section">
      <template #header>
        <div class="section-header">
          <el-icon><Monitor /></el-icon>
          <span>响应式设置</span>
        </div>
      </template>

      <el-form label-width="120px" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="桌面端列数">
              <el-input-number v-model="settings.columns" :min="1" :max="4" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="移动端折叠">
              <el-switch v-model="settings.mobileCollapsed" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 预览 -->
    <el-card v-if="settings.enabled" class="settings-section">
      <template #header>
        <div class="section-header">
          <el-icon><View /></el-icon>
          <span>实时预览</span>
        </div>
      </template>

      <div class="preview-container">
        <Footer />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Link, Share, Monitor, View, Plus, Delete, ArrowUp } from '@element-plus/icons-vue'
import Footer from './Footer.vue'
import { useSystemSettings } from '@/composables/useData'

interface FooterLink {
  title: string
  url: string
  type: 'internal' | 'external' | 'legal' | 'social'
  order: number
}

const { getSettingValue, updateSystemSetting } = useSystemSettings()

// 预定义颜色
const predefineColors = [
  '#ffffff',
  '#f5f5f5',
  '#e5e7eb',
  '#d1d5db',
  '#9ca3af',
  '#6b7280',
  '#4b5563',
  '#374151',
  '#1f2937',
  '#111827',
  'transparent'
]

// 页脚设置
const settings = ref({
  enabled: getSettingValue('footer_enabled', 'true') === 'true',
  copyright: getSettingValue('footer_copyright', '&copy; 2024 Geek Portfolio. Built with Vue 3 & Supabase.'),
  style: getSettingValue('footer_style', 'simple'),
  textColor: getSettingValue('footer_text_color', '#666666'),
  bgColor: getSettingValue('footer_bg_color', 'transparent'),
  borderTop: getSettingValue('footer_border_top', '1px solid #e5e7eb'),
  linksEnabled: getSettingValue('footer_links_enabled', 'true') === 'true',
  socialEnabled: getSettingValue('footer_social_enabled', 'true') === 'true',
  socialStyle: getSettingValue('footer_social_style', 'horizontal'),
  columns: parseInt(getSettingValue('footer_columns', '3')),
  mobileCollapsed: getSettingValue('footer_mobile_collapsed', 'false') === 'true'
})

// 页脚链接
const footerLinks = ref<FooterLink[]>(() => {
  try {
    const linksStr = getSettingValue('footer_links', '[]')
    return JSON.parse(linksStr)
  } catch {
    return []
  }
})

// 添加链接
const addLink = () => {
  const newLink: FooterLink = {
    title: '',
    url: '',
    type: 'internal',
    order: footerLinks.value.length + 1
  }
  footerLinks.value.push(newLink)
  saveLinks()
}

// 移除链接
const removeLink = (index: number) => {
  footerLinks.value.splice(index, 1)
  // 重新排序
  footerLinks.value.forEach((link, i) => {
    link.order = i + 1
  })
  saveLinks()
}

// 移动链接
const moveLink = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < footerLinks.value.length) {
    const temp = footerLinks.value[index]
    footerLinks.value[index] = footerLinks.value[newIndex]
    footerLinks.value[newIndex] = temp

    // 重新排序
    footerLinks.value.forEach((link, i) => {
      link.order = i + 1
    })

    saveLinks()
  }
}

// 保存链接
const saveLinks = () => {
  updateSystemSetting('footer_links', JSON.stringify(footerLinks.value))
}

// 保存设置
const saveSettings = async () => {
  try {
    const settingsData = {
      footer_enabled: { value: settings.value.enabled.toString(), description: '是否启用页脚' },
      footer_copyright: { value: settings.value.copyright, description: '页脚版权信息' },
      footer_style: { value: settings.value.style, description: '页脚样式' },
      footer_text_color: { value: settings.value.textColor, description: '页脚文字颜色' },
      footer_bg_color: { value: settings.value.bgColor, description: '页脚背景颜色' },
      footer_border_top: { value: settings.value.borderTop, description: '页脚上边框' },
      footer_links_enabled: { value: settings.value.linksEnabled.toString(), description: '是否显示页脚链接' },
      footer_social_enabled: { value: settings.value.socialEnabled.toString(), description: '是否显示社交链接' },
      footer_social_style: { value: settings.value.socialStyle, description: '社交链接样式' },
      footer_columns: { value: settings.value.columns.toString(), description: '页脚列数' },
      footer_mobile_collapsed: { value: settings.value.mobileCollapsed.toString(), description: '移动端是否折叠' }
    }

    // 批量更新设置
    for (const [key, data] of Object.entries(settingsData)) {
      await updateSystemSetting(key, data.value)
    }

    ElMessage.success('页脚设置保存成功')
  } catch (error) {
    ElMessage.error('保存页脚设置失败')
    if (process.env.NODE_ENV === 'development') {
      console.error('Footer settings save error:', error)
    }
  }
}

// 监听设置变化，自动保存
watch(
  () => settings.value,
  () => {
    saveSettings()
  },
  { deep: true }
)

// 监听链接变化，自动保存
watch(
  () => footerLinks.value,
  () => {
    saveLinks()
  },
  { deep: true }
)
</script>

<style scoped>
.footer-settings {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.links-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.link-item {
  width: 100%;
}

.link-card {
  border: 1px solid var(--border-secondary);
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.preview-container {
  border: 1px dashed var(--border-primary);
  border-radius: 8px;
  padding: 2rem;
  background: var(--bg-tertiary);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-card__header) {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-color-picker__trigger) {
  border-radius: 8px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-settings {
    gap: 1.5rem;
  }

  .links-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .link-header {
    font-size: 0.9rem;
  }

  .preview-container {
    padding: 1rem;
    min-height: 150px;
  }
}
</style>
