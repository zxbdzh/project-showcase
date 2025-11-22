<template>
  <footer v-if="settings.enabled" class="footer" :class="footerClasses" :style="footerStyles">
    <div class="footer__container">
      <!-- 简洁样式 -->
      <div v-if="settings.style === 'simple'" class="footer__simple">
        <div class="footer__copyright" v-html="settings.copyright"></div>
        <div v-if="settings.linksEnabled && links.length > 0" class="footer__links">
          <a
            v-for="link in links"
            :key="link.order"
            :href="link.url"
            :target="link.type === 'external' ? '_blank' : '_self'"
            class="footer__link"
          >
            {{ link.title }}
          </a>
        </div>
      </div>

      <!-- 详细样式 -->
      <div v-else-if="settings.style === 'detailed'" class="footer__detailed">
        <div class="footer__columns">
          <div
            v-for="column in footerColumns"
            :key="column.index"
            class="footer__column"
          >
            <h4 v-if="column.title" class="footer__column-title">{{ column.title }}</h4>
            <ul v-if="column.links && column.links.length > 0" class="footer__column-links">
              <li v-for="link in (column.links || [])" :key="link.order" class="footer__column-link">
                <a
                  :href="link.url"
                  :target="link.type === 'external' ? '_blank' : '_self'"
                  class="footer__column-link-item"
                >
                  {{ link.title }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="footer__bottom">
          <div class="footer__copyright" v-html="settings.copyright"></div>
          <div v-if="settings.socialEnabled" class="footer__social">
            <component
              v-for="socialLink in socialLinks"
              :key="socialLink.id"
              :is="'font-awesome-icon'"
              :icon="socialLink.icon"
              :url="socialLink.url"
              :title="socialLink.platform"
              size="small"
              class="footer__social-icon"
            />
          </div>
        </div>
      </div>

      <!-- 极简样式 -->
      <div v-else-if="settings.style === 'minimal'" class="footer__minimal">
        <div class="footer__copyright" v-html="settings.copyright"></div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSystemSettings } from '@/composables/useData'
import { useSocialLinks } from '@/composables/useData'

interface FooterLink {
  title: string
  url: string
  type: 'internal' | 'external' | 'legal' | 'social'
  order: number
}

const { getSettingValue } = useSystemSettings()
const { socialLinks } = useSocialLinks()

// 页脚设置
const settings = computed(() => ({
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
}))

// 页脚链接
const links = computed<FooterLink[]>(() => {
  try {
    const linksStr = getSettingValue('footer_links', '[]')
    return JSON.parse(linksStr)
  } catch {
    return []
  }
})

// 页脚列配置 (详细样式)
const footerColumns = computed(() => {
  if (settings.value.style !== 'detailed' || links.value.length === 0) {
    return []
  }

  const columnsCount = Math.min(Math.max(settings.value.columns, 1), 4)
  const columns: Array<{ index: number; title?: string; links?: FooterLink[] }> = []

  // 按类型分组链接
  const groupedLinks = links.value.reduce((groups, link) => {
    if (!groups[link.type]) {
      groups[link.type] = []
    }
    groups[link.type].push(link)
    return groups
  }, {} as Record<string, FooterLink[]>)

  // 创建列
  const linkTypes = Object.keys(groupedLinks).sort()
  const linksPerColumn = Math.ceil(linkTypes.length / columnsCount)

  for (let i = 0; i < columnsCount; i++) {
    const startIndex = i * linksPerColumn
    const endIndex = Math.min(startIndex + linksPerColumn, linkTypes.length)
    const columnTypes = linkTypes.slice(startIndex, endIndex)

    const columnLinks: FooterLink[] = []
    const columnTitles: string[] = []

    columnTypes.forEach(type => {
      columnLinks.push(...groupedLinks[type])
      if (type === 'internal') columnTitles.push('页面导航')
      else if (type === 'external') columnTitles.push('友情链接')
      else if (type === 'legal') columnTitles.push('法律信息')
      else if (type === 'social') columnTitles.push('社交媒体')
    })

    columns.push({
      index: i,
      title: columnTitles.join(' / ') || undefined,
      links: columnLinks.sort((a, b) => a.order - b.order)
    })
  }

  return columns
})

// 样式计算
const footerClasses = computed(() => ({
  'footer--simple': settings.value.style === 'simple',
  'footer--detailed': settings.value.style === 'detailed',
  'footer--minimal': settings.value.style === 'minimal',
  'footer--mobile-collapsed': settings.value.mobileCollapsed
}))

const footerStyles = computed(() => ({
  color: settings.value.textColor,
  backgroundColor: settings.value.bgColor,
  borderTop: settings.value.borderTop
}))
</script>

<style scoped>
.footer {
  width: 100%;
  background: var(--bg-primary);
  transition: all 0.3s ease;
}

.footer__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 简洁样式 */
.footer__simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
  border-top: 1px solid var(--border-primary);
}

.footer__copyright {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.footer__links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.footer__link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer__link:hover {
  color: var(--accent-primary);
}

/* 详细样式 */
.footer__detailed {
  padding: 3rem 0;
  border-top: 1px solid var(--border-primary);
}

.footer__columns {
  display: grid;
  grid-template-columns: repeat(v-bind('settings.columns'), 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer__column {
  min-width: 0;
}

.footer__column-title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 0;
}

.footer__column-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__column-link {
  margin-bottom: 0.5rem;
}

.footer__column-link-item {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  line-height: 1.5;
}

.footer__column-link-item:hover {
  color: var(--accent-primary);
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border-secondary);
  margin-top: 2rem;
}

.footer__social {
  display: flex;
  gap: 1rem;
}

.footer__social-icon {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.footer__social-icon:hover {
  color: var(--accent-primary);
}

/* 极简样式 */
.footer__minimal {
  text-align: center;
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer__container {
    padding: 0 1rem;
  }

  .footer__simple {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer__links {
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer__columns {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer__bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer__social {
    justify-content: center;
  }

  .footer--mobile-collapsed .footer__columns {
    display: none;
  }

  .footer--mobile-collapsed .footer__bottom {
    border-top: none;
    margin-top: 0;
  }
}

/* 深色主题适配 */
[data-theme='dark'] .footer {
  background: var(--bg-secondary);
}

[data-theme='dark'] .footer__column-title {
  color: var(--text-primary);
}

[data-theme='dark'] .footer__copyright {
  color: var(--text-secondary);
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .footer__link,
  .footer__column-link-item {
    text-decoration: underline;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .footer {
    transition: none;
  }

  .footer__link,
  .footer__column-link-item,
  .footer__social-icon {
    transition: none;
  }
}
</style>
