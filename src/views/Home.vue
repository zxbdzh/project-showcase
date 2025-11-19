<template>
  <div class="home">
    <!-- 主要内容 -->
    <main class="home__main">
      <!-- 英雄区域 -->
      <section class="home__hero">
        <div class="home__hero-content">
          <h1 class="home__hero-title">
            <glitch-text text="全栈开发工程师" :color="isDark ? '#00ff41' : '#0066cc'" :speed="3" />
          </h1>

          <p class="home__hero-subtitle">专注于 Java 后端、Vue 前端和云原生部署</p>

          <div class="home__hero-skills">
            <el-tag
              v-for="skill in featuredSkills"
              :key="skill"
              :type="isDark ? 'success' : 'primary'"
              effect="dark"
              class="home__skill-tag"
            >
              {{ skill }}
            </el-tag>
          </div>

          <div class="home__hero-actions">
            <el-button type="primary" size="large" @click="scrollToProjects"> 查看项目 </el-button>
            <el-button size="large" @click="scrollToContact"> 联系我 </el-button>
          </div>
        </div>
      </section>

      <!-- 项目展示 -->
      <section id="projects" class="home__projects">
        <div class="home__section-header">
          <h2 class="home__section-title">
            <glitch-text text="PROJECTS" />
          </h2>
          <p class="home__section-subtitle">精选项目作品</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="home__projects-grid">
          <skeleton-loader v-for="i in 3" :key="i" type="project-card" />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="loadingError" class="home__error">
          <el-alert
            title="加载失败"
            :description="loadingError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-button @click="loadData" type="primary" style="margin-top: 1rem">
            重新加载
          </el-button>
        </div>

        <!-- 正常内容 -->
        <div v-else class="home__projects-grid">
          <div
            v-for="project in featuredProjects"
            :key="project.id"
            class="home__project-card"
            @click="openProject(project)"
          >
            <div class="home__project-image">
              <img src="/placeholder-project.svg" :alt="project.title" loading="lazy" />
              <div class="home__project-overlay">
                <el-button type="primary" size="small"> 查看详情 </el-button>
              </div>
            </div>

            <div class="home__project-content">
              <h3 class="home__project-title">{{ project.title }}</h3>
              <p class="home__project-description">{{ project.description }}</p>

              <div class="home__project-tags">
                <el-tag
                  v-for="tag in ['Vue.js', 'TypeScript', 'Supabase']"
                  :key="tag"
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="home__projects-more">
          <el-button @click="viewAllProjects"> 查看全部项目 </el-button>
        </div>
      </section>

      <!-- 技能展示 -->
      <section class="home__skills">
        <div class="home__section-header">
          <h2 class="home__section-title">
            <glitch-text text="SKILLS" />
          </h2>
          <p class="home__section-subtitle">技术栈和专业技能</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="home__skills-grid">
          <skeleton-loader v-for="i in 6" :key="i" type="skill-card" />
        </div>

        <!-- 正常内容 -->
        <div v-else class="home__skills-grid">
          <div v-for="skill in skillsWithIcons" :key="skill.id" class="home__skill-card">
            <div class="home__skill-icon">
              <el-icon :size="32">
                <component :is="skill.icon" />
              </el-icon>
            </div>
            <h4 class="home__skill-name">{{ skill.name }}</h4>
            <div class="home__skill-level">
              <cool-progress-bar
                :percentage="skill.level"
                :color="isDark ? '#00ff41' : '#0066cc'"
                :height="8"
                :animated="true"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 联系方式 -->
      <section id="contact" class="home__contact">
        <div class="home__section-header">
          <h2 class="home__section-title">
            <glitch-text text="CONTACT" />
          </h2>
          <p class="home__section-subtitle">联系方式</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="home__contact-grid">
          <skeleton-loader v-for="i in 4" :key="i" type="contact-item" />
        </div>

        <!-- 正常内容 -->
        <div v-else class="home__contact-grid">
          <a
            v-for="link in socialLinksWithIcons"
            :key="link.id"
            :href="link.url"
            target="_blank"
            class="home__contact-item"
          >
            <el-icon :size="24">
              <component :is="link.icon" />
            </el-icon>
            <span>{{ link.name }}</span>
          </a>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, ref, type Component } from 'vue'
import { useRouter } from 'vue-router'
import {
  Link,
  Message,
  Phone,
  TrendCharts,
  Monitor,
  Setting,
  View,
  ChatDotRound,
  Position,
  Document,
  DataLine,
} from '@element-plus/icons-vue'

import { useTheme } from '@/composables/useTheme'
import { useProjects, useSkills, useSocialLinks } from '@/composables/useData'
import GlitchText from '@/components/GlitchText.vue'
import CoolProgressBar from '@/components/CoolProgressBar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import type { Project } from '@/utils/supabase'

const router = useRouter()
const { isDark } = useTheme()

// 加载状态
const isLoading = ref(true)
const loadingError = ref<string | null>(null)

// 使用数据服务
const { featuredProjects, loadProjects } = useProjects()
const { skills, loadSkills } = useSkills()
const { socialLinks, loadSocialLinks } = useSocialLinks()

// 加载数据
const loadData = async () => {
  isLoading.value = true
  loadingError.value = null

  try {
    console.log('Home.vue - 开始加载数据...')
    const results = await Promise.all([
      loadProjects({ status: 'published', featured: true }),
      loadSkills(),
      loadSocialLinks(),
    ])
    console.log('Home.vue - 数据加载完成:', results)
  } catch (error) {
    console.error('Home.vue - Failed to load data:', error)
    loadingError.value = '加载数据失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})

// 特色技能（从技能数据中提取）
const featuredSkills = computed(() => skills.value.slice(0, 8).map((skill) => skill.name))

// 处理图标映射
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, Component> = {
    Java: markRaw(Setting),
    'Spring Boot': markRaw(Setting),
    'Vue.js': markRaw(Monitor),
    TypeScript: markRaw(Setting),
    Docker: markRaw(Setting),
    Redis: markRaw(TrendCharts),
    MongoDB: markRaw(DataLine),
    Nginx: markRaw(Setting),
    GitHub: markRaw(Link),
    Twitter: markRaw(ChatDotRound),
    Email: markRaw(Message),
    Phone: markRaw(Phone),
    LinkedIn: markRaw(Position),
    Website: markRaw(View),
  }
  return iconMap[iconName] || markRaw(Document)
}

// 将技能级别字符串转换为数字
const convertSkillLevelToNumber = (level: string | number): number => {
  if (typeof level === 'number') return level

  const levelMap: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 90,
  }

  return levelMap[level.toLowerCase()] || 50
}

// 处理技能图标
const skillsWithIcons = computed(() => {
  // 如果有数据库中的技能数据，使用它们
  if (skills.value && skills.value.length > 0) {
    return skills.value.map((skill) => ({
      ...skill,
      icon: getIconComponent(skill.name),
      level: convertSkillLevelToNumber(skill.level || '1'),
    }))
  }

  // 否则使用默认的技能数据
  return [
    {
      id: '1',
      name: 'Vue.js',
      level: 85,
      icon: getIconComponent('Vue.js'),
    },
    {
      id: '2',
      name: 'TypeScript',
      level: 80,
      icon: getIconComponent('TypeScript'),
    },
    {
      id: '3',
      name: 'Java',
      level: 90,
      icon: getIconComponent('Java'),
    },
    {
      id: '4',
      name: 'Docker',
      level: 75,
      icon: getIconComponent('Docker'),
    },
    {
      id: '5',
      name: 'Redis',
      level: 70,
      icon: getIconComponent('Redis'),
    },
    {
      id: '6',
      name: 'MongoDB',
      level: 65,
      icon: getIconComponent('MongoDB'),
    },
  ]
})

// 处理社交链接图标
const socialLinksWithIcons = computed(() => {
  // 始终返回默认的社交链接，避免闪烁
  const defaultLinks = [
    {
      id: '1',
      name: 'GitHub',
      url: 'https://github.com',
      icon: getIconComponent('GitHub'),
    },
    {
      id: '2',
      name: 'Email',
      url: 'mailto:contact@example.com',
      icon: getIconComponent('Email'),
    },
    {
      id: '3',
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: getIconComponent('LinkedIn'),
    },
    {
      id: '4',
      name: 'Twitter',
      url: 'https://twitter.com',
      icon: getIconComponent('Twitter'),
    },
  ]

  // 如果有数据库中的社交链接，使用它们
  if (socialLinks.value && socialLinks.value.length > 0) {
    return socialLinks.value.map((link) => ({
      ...link,
      name: link.platform,
      icon: getIconComponent(link.platform),
    }))
  }

  // 否则使用默认的社交链接
  return defaultLinks
})

// 滚动到项目区域
const scrollToProjects = () => {
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
}

// 滚动到联系方式
const scrollToContact = () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}

// 打开项目
const openProject = (project: Project) => {
  // 直接跳转到项目详情页
  router.push(`/project/${project.id}`)
}

// 查看所有项目
const viewAllProjects = () => {
  router.push('/projects')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.home__header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-primary);
}

.home__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.home__nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.home__nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.home__main {
  padding-top: 80px;
}

.home__hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.home__hero-content {
  max-width: 800px;
  z-index: 10;
  position: relative;
}

.home__hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.home__hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.home__hero-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.home__skill-tag {
  font-family: 'Courier New', monospace;
}

.home__hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.home__section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.home__section-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.home__section-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.home__projects {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.home__projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.home__project-card {
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.home__project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px var(--shadow-color);
  border-color: var(--accent-primary);
}

.home__project-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.home__project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.home__project-card:hover .home__project-image img {
  transform: scale(1.05);
}

.home__project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.home__project-card:hover .home__project-overlay {
  opacity: 1;
}

.home__project-content {
  padding: 1.5rem;
}

.home__project-title {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  /* 确保文字可见的备用样式 */
  color: #333 !important;
}

.home__project-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
  /* 确保文字可见的备用样式 */
  color: #666 !important;
}

/* 深色模式下的项目文字颜色 */
[data-theme='dark'] .home__project-title {
  color: #ffffff !important;
}

[data-theme='dark'] .home__project-description {
  color: #cccccc !important;
}

/* 浅色模式下的项目文字颜色 */
[data-theme='light'] .home__project-title {
  color: #333333 !important;
}

[data-theme='light'] .home__project-description {
  color: #666666 !important;
}

.home__project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.home__projects-more {
  text-align: center;
}

.home__skills {
  padding: 4rem 2rem;
  background: var(--bg-secondary);
}

.home__skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.home__skill-card {
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.home__skill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px var(--shadow-color);
  border-color: var(--accent-primary);
}

.home__skill-icon {
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

.home__skill-name {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  /* 确保文字可见的备用样式 */
  color: #333 !important;
}

/* 深色模式下的技能名称颜色 */
[data-theme='dark'] .home__skill-name {
  color: #ffffff !important;
}

/* 浅色模式下的技能名称颜色 */
[data-theme='light'] .home__skill-name {
  color: #333333 !important;
}

.home__skill-level {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.home__skill-percentage {
  font-weight: bold;
  color: var(--accent-primary);
  min-width: 40px;
}

.home__contact {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.home__contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.home__contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
  /* 确保文字可见的备用样式 */
  color: #333 !important;
}

/* 深色模式下的文字颜色 */
[data-theme='dark'] .home__contact-item {
  color: #ffffff !important;
}

/* 浅色模式下的文字颜色 */
[data-theme='light'] .home__contact-item {
  color: #333333 !important;
}

.home__contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px var(--shadow-color);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.home__footer {
  text-align: center;
  padding: 2rem;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-primary);
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home__nav {
    padding: 1rem;
  }

  .home__hero-title {
    font-size: 2rem;
  }

  .home__hero-subtitle {
    font-size: 1rem;
  }

  .home__projects-grid {
    grid-template-columns: 1fr;
  }

  .home__skills-grid {
    grid-template-columns: 1fr;
  }

  .home__contact-grid {
    grid-template-columns: 1fr;
  }

  .home__hero-actions {
    flex-direction: column;
    align-items: center;
  }
}

/* 深色主题适配 */
[data-theme='dark'] .home__header {
  background: rgba(10, 10, 10, 0.9);
}

/* 浅色主题适配 */
[data-theme='light'] .home__header {
  background: rgba(255, 255, 255, 0.9);
}
</style>
