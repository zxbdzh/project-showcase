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
                    :multiple="false"
                    :limit="1"
                    accept=".png,.jpg,.jpeg"
                    :drag="false"
                    :show-file-list="true"
                    bucket="project-showcase"
                    folder="logos"
                    @success="handleLogoUploadSuccess"
                    @error="handleLogoUploadError"
                    @remove="handleLogoRemove"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="网站Favicon">
                  <file-upload
                    v-model="settings.site_favicon"
                    :multiple="false"
                    :limit="1"
                    accept=".ico,.png,.jpg,.jpeg"
                    :drag="false"
                    :show-file-list="true"
                    bucket="project-showcase"
                    folder="favicons"
                    @success="handleFaviconUploadSuccess"
                    @error="handleFaviconUploadError"
                    @remove="handleFaviconRemove"
                  />
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
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadUserFile } from 'element-plus'
import { ArrowLeft, Check, Setting, Picture, Search } from '@element-plus/icons-vue'
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
  seo_keywords: 'Vue.js,TypeScript,全栈开发,项目展示',
  seo_author: '全栈开发工程师',
  custom_css: '',
}

// 设置数据
const settings = ref({ ...defaultSettings })

// 加载设置
const loadSettings = async () => {
  try {
    // 先加载系统设置数据
    await loadSystemSettings()

    // 然后更新本地设置状态，避免响应式循环
    const newSettings = {
      site_title: getSettingValue('site_title', defaultSettings.site_title),
      site_subtitle: getSettingValue('site_subtitle', defaultSettings.site_subtitle),
      brand_text: getSettingValue('brand_text', defaultSettings.brand_text),
      site_description: getSettingValue('site_description', defaultSettings.site_description),
      site_logo: getSettingValue('site_logo', defaultSettings.site_logo),
      site_favicon: getSettingValue('site_favicon', defaultSettings.site_favicon),
      seo_keywords: getSettingValue('seo_keywords', defaultSettings.seo_keywords),
      seo_author: getSettingValue('seo_author', defaultSettings.seo_author),
      custom_css: getSettingValue('custom_css', defaultSettings.custom_css),
    }

    // 使用Object.assign避免触发不必要的响应式更新
    Object.assign(settings.value, newSettings)
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
  updateFavicon()

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

  // 更新meta标签
  updateMetaTag('description', settings.value.site_description)
  updateMetaTag('keywords', settings.value.seo_keywords)
  updateMetaTag('author', settings.value.seo_author)
}

// 更新meta标签
const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }
  meta.content = content
}

// 更新favicon的独立函数
const updateFavicon = () => {
  // 移除所有现有的favicon相关链接
  const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
  existingFavicons.forEach((favicon) => favicon.remove())

  if (settings.value.site_favicon) {
    // 方法1: 创建带有版本号的favicon链接
    const createFaviconWithVersion = (version: number) => {
      const favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.type = 'image/x-icon'

      // 使用版本号而不是时间戳，更稳定
      const separator = settings.value.site_favicon.includes('?') ? '&' : '?'
      favicon.href = `${settings.value.site_favicon}${separator}v=${version}`

      return favicon
    }

    // 方法3: 强制刷新iframe技术
    const forceRefreshWithIframe = () => {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = settings.value.site_favicon
      document.body.appendChild(iframe)

      // 短暂延迟后移除iframe
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 100)
    }

    // 使用版本号方法创建favicon
    const version = Date.now()
    const favicon = createFaviconWithVersion(version)
    document.head.appendChild(favicon)

    // 同时创建shortcut icon
    const shortcutIcon = document.createElement('link')
    shortcutIcon.rel = 'shortcut icon'
    shortcutIcon.type = 'image/x-icon'
    shortcutIcon.href = favicon.href
    document.head.appendChild(shortcutIcon)

    // 额外的强制刷新技术
    setTimeout(() => {
      // 方法4: 直接访问favicon URL强制刷新
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = settings.value.site_favicon
      document.head.appendChild(link)

      // 方法5: 使用Image对象预加载
      const img = new Image()
      img.onload = () => {
        console.log('Favicon preloaded successfully')
      }
      img.onerror = () => {
        console.log('Favicon preload failed')
      }
      img.src = settings.value.site_favicon

      // 方法6: iframe强制刷新（最后手段）
      forceRefreshWithIframe()
    }, 100)

    console.log('Favicon updated with advanced cache busting:', favicon.href)

    // 方法7: 尝试强制刷新浏览器缓存
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update()
        })
      })
    }
  } else {
    // 如果favicon为空，创建默认的favicon
    const defaultFavicon = document.createElement('link')
    defaultFavicon.rel = 'icon'
    defaultFavicon.type = 'image/x-icon'
    defaultFavicon.href = '/favicon.ico'
    document.head.appendChild(defaultFavicon)

    console.log('Default favicon applied')
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
      seo_keywords: { value: settings.value.seo_keywords, description: 'SEO关键词' },
      seo_author: { value: settings.value.seo_author, description: 'SEO作者' },
      custom_css: { value: settings.value.custom_css, description: '自定义CSS' },
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

// 处理Logo上传成功
const handleLogoUploadSuccess = (response: unknown, file: UploadUserFile) => {
  console.log('Logo upload success:', response, file)
  // v-model会自动更新settings.site_logo
}

// 处理Logo上传失败
const handleLogoUploadError = (error: Error, file: UploadUserFile) => {
  console.error('Logo upload error:', error, file)
  ElMessage.error('Logo上传失败')
}

// 处理Logo删除
const handleLogoRemove = (file: UploadUserFile) => {
  console.log('Logo removed:', file)
  // v-model会自动更新settings.site_logo为空字符串
}

// 处理Favicon上传成功
const handleFaviconUploadSuccess = (response: unknown, file: UploadUserFile) => {
  console.log('Favicon upload success:', response, file)
  // v-model会自动更新settings.site_favicon
  // 立即应用favicon到页面
  updateFavicon()
}

// 处理Favicon上传失败
const handleFaviconUploadError = (error: Error, file: UploadUserFile) => {
  console.error('Favicon upload error:', error, file)
  ElMessage.error('Favicon上传失败')
}

// 处理Favicon删除
const handleFaviconRemove = (file: UploadUserFile) => {
  console.log('Favicon removed:', file)
  // v-model会自动更新settings.site_favicon为空字符串
  // 立即更新favicon
  updateFavicon()
}

// 返回
const goBack = () => {
  router.back()
}

// 监听favicon变化，实时更新
watch(
  () => settings.value.site_favicon,
  () => {
    updateFavicon()
  },
  { immediate: false },
)

// 组件挂载时加载设置
onMounted(async () => {
  await loadSettings()
  // 加载完成后立即应用设置到页面
  applySettingsToPage()
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
