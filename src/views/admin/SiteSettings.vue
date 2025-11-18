<template>
  <div class="admin-site-settings">
    <!-- 页面头部 -->
    <header class="admin-site-settings__header">
      <div class="admin-site-settings__header-content">
        <h1 class="admin-site-settings__title">
          <glitch-text text="SITE SETTINGS" />
        </h1>
        <p class="admin-site-settings__subtitle">管理网站全局设置</p>
      </div>
      <div class="admin-site-settings__actions">
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" size="large" @click="saveSettings" :loading="saving">
          <el-icon><Check /></el-icon>
          保存设置
        </el-button>
      </div>
    </header>

    <!-- 设置表单 -->
    <section class="admin-site-settings__content">
      <div class="admin-site-settings__form">
        <el-form :model="settings" label-width="120px" label-position="top">
          <!-- 基本信息 -->
          <el-card class="settings-section">
            <template #header>
              <div class="section-header">
                <el-icon><Setting /></el-icon>
                <span>基本信息</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="网站标题">
                  <el-input v-model="settings.site_title" placeholder="请输入网站标题" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="网站副标题">
                  <el-input v-model="settings.site_subtitle" placeholder="请输入网站副标题" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="左上角文字">
                  <el-input v-model="settings.brand_text" placeholder="默认: GEEK" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="网站描述">
                  <el-input
                    v-model="settings.site_description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入网站描述"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <!-- 媒体文件 -->
          <el-card class="settings-section">
            <template #header>
              <div class="section-header">
                <el-icon><Picture /></el-icon>
                <span>媒体文件</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="网站Logo">
                  <file-upload
                    v-model="settings.site_logo"
                    :limit="1"
                    accept="image/*"
                    list-type="picture-card"
                    placeholder="上传网站Logo"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="网站Favicon">
                  <file-upload
                    v-model="settings.site_favicon"
                    :limit="1"
                    accept=".ico,.png,.jpg,.jpeg"
                    list-type="picture-card"
                    placeholder="上传Favicon (推荐: 32x32px)"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <!-- 联系信息 -->
          <el-card class="settings-section">
            <template #header>
              <div class="section-header">
                <el-icon><Message /></el-icon>
                <span>联系信息</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系邮箱">
                  <el-input v-model="settings.contact_email" placeholder="contact@example.com" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="settings.contact_phone" placeholder="+86 138 0000 0000" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="联系地址">
                  <el-input v-model="settings.contact_address" placeholder="请输入联系地址" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <!-- SEO设置 -->
          <el-card class="settings-section">
            <template #header>
              <div class="section-header">
                <el-icon><Search /></el-icon>
                <span>SEO设置</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="关键词">
                  <el-input v-model="settings.seo_keywords" placeholder="关键词1,关键词2,关键词3" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="作者">
                  <el-input v-model="settings.seo_author" placeholder="网站作者" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="自定义CSS">
                  <el-input
                    v-model="settings.custom_css"
                    type="textarea"
                    :rows="6"
                    placeholder="自定义CSS代码"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <!-- 社交媒体 -->
          <el-card class="settings-section">
            <template #header>
              <div class="section-header">
                <el-icon><Link /></el-icon>
                <span>社交媒体</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="GitHub">
                  <el-input
                    v-model="settings.social_github"
                    placeholder="https://github.com/username"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Twitter">
                  <el-input
                    v-model="settings.social_twitter"
                    placeholder="https://twitter.com/username"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="LinkedIn">
                  <el-input
                    v-model="settings.social_linkedin"
                    placeholder="https://linkedin.com/in/username"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="微博">
                  <el-input
                    v-model="settings.social_weibo"
                    placeholder="https://weibo.com/username"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, Setting, Picture, Message, Search, Link } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import GlitchText from '@/components/GlitchText.vue'
import FileUpload from '@/components/FileUpload.vue'
import { useSystemSettings } from '@/composables/useData'

const router = useRouter()
const saving = ref(false)
const { getSettingValue, batchUpdateSystemSettings, loadSystemSettings } = useSystemSettings()

// 默认设置
const defaultSettings = {
  site_title: '项目展示系统',
  site_subtitle: '全栈开发工程师作品集',
  brand_text: 'GEEK',
  site_description: '基于Vue 3和TypeScript构建的现代化项目展示平台',
  site_logo: '',
  site_favicon: '',
  contact_email: 'contact@example.com',
  contact_phone: '',
  contact_address: '',
  seo_keywords: 'Vue.js,TypeScript,全栈开发,项目展示',
  seo_author: '全栈开发工程师',
  custom_css: '',
  social_github: '',
  social_twitter: '',
  social_linkedin: '',
  social_weibo: '',
}

// 设置数据
const settings = ref({ ...defaultSettings })

// 加载设置
const loadSettings = async () => {
  try {
    await loadSystemSettings()

    // 从数据库加载设置
    settings.value = {
      site_title: getSettingValue('site_title', defaultSettings.site_title),
      site_subtitle: getSettingValue('site_subtitle', defaultSettings.site_subtitle),
      brand_text: getSettingValue('brand_text', defaultSettings.brand_text),
      site_description: getSettingValue('site_description', defaultSettings.site_description),
      site_logo: getSettingValue('site_logo', defaultSettings.site_logo),
      site_favicon: getSettingValue('site_favicon', defaultSettings.site_favicon),
      contact_email: getSettingValue('contact_email', defaultSettings.contact_email),
      contact_phone: getSettingValue('contact_phone', defaultSettings.contact_phone),
      contact_address: getSettingValue('contact_address', defaultSettings.contact_address),
      seo_keywords: getSettingValue('seo_keywords', defaultSettings.seo_keywords),
      seo_author: getSettingValue('seo_author', defaultSettings.seo_author),
      custom_css: getSettingValue('custom_css', defaultSettings.custom_css),
      social_github: getSettingValue('social_github', defaultSettings.social_github),
      social_twitter: getSettingValue('social_twitter', defaultSettings.social_twitter),
      social_linkedin: getSettingValue('social_linkedin', defaultSettings.social_linkedin),
      social_weibo: getSettingValue('social_weibo', defaultSettings.social_weibo),
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    ElMessage.error('加载设置失败')
  }
}

// 应用设置到页面
const applySettingsToPage = () => {
  // 更新页面标题
  if (settings.value.site_title) {
    document.title = settings.value.site_title
  }

  // 更新favicon
  if (settings.value.site_favicon) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = settings.value.site_favicon
    }
  }

  // 应用自定义CSS
  const customStyleElement = document.getElementById('custom-css')
  if (customStyleElement) {
    customStyleElement.remove()
  }

  if (settings.value.custom_css) {
    const style = document.createElement('style')
    style.id = 'custom-css'
    style.textContent = settings.value.custom_css
    document.head.appendChild(style)
  }
}

// 保存设置
const saveSettings = async () => {
  saving.value = true
  try {
    // 准备要保存的设置数据
    const settingsData = {
      site_title: { value: settings.value.site_title, description: '网站标题' },
      site_subtitle: { value: settings.value.site_subtitle, description: '网站副标题' },
      brand_text: { value: settings.value.brand_text, description: '左上角文字' },
      site_description: { value: settings.value.site_description, description: '网站描述' },
      site_logo: { value: settings.value.site_logo, description: '网站Logo' },
      site_favicon: { value: settings.value.site_favicon, description: '网站Favicon' },
      contact_email: { value: settings.value.contact_email, description: '联系邮箱' },
      contact_phone: { value: settings.value.contact_phone, description: '联系电话' },
      contact_address: { value: settings.value.contact_address, description: '联系地址' },
      seo_keywords: { value: settings.value.seo_keywords, description: 'SEO关键词' },
      seo_author: { value: settings.value.seo_author, description: 'SEO作者' },
      custom_css: { value: settings.value.custom_css, description: '自定义CSS' },
      social_github: { value: settings.value.social_github, description: 'GitHub链接' },
      social_twitter: { value: settings.value.social_twitter, description: 'Twitter链接' },
      social_linkedin: { value: settings.value.social_linkedin, description: 'LinkedIn链接' },
      social_weibo: { value: settings.value.social_weibo, description: '微博链接' },
    }

    // 批量保存到数据库
    await batchUpdateSystemSettings(settingsData)

    // 应用设置到页面
    applySettingsToPage()

    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.admin-site-settings {
  min-height: 100vh;
  background: var(--bg-primary);
}

.admin-site-settings__header {
  padding: 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.admin-site-settings__header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-site-settings__title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.admin-site-settings__subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.admin-site-settings__content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-site-settings__form {
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

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-site-settings__header {
    padding: 1.5rem 1rem;
  }

  .admin-site-settings__header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-site-settings__title {
    font-size: 1.5rem;
  }

  .admin-site-settings__content {
    padding: 1.5rem 1rem;
  }

  .settings-section {
    margin-bottom: 1rem;
  }
}
</style>
