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

        <div class="home__projects-grid">
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

        <div class="home__skills-grid">
          <div v-for="skill in skillsWithIcons" :key="skill.id" class="home__skill-card">
            <div class="home__skill-icon">
              <el-icon :size="32">
                <component :is="skill.icon" />
              </el-icon>
            </div>
            <h4 class="home__skill-name">{{ skill.name }}</h4>
            <div class="home__skill-level">
              <el-progress
                :percentage="skill.level"
                :stroke-width="8"
                :show-text="false"
                :color="isDark ? '#00ff41' : '#0066cc'"
              />
              <span class="home__skill-percentage">{{ skill.level }}%</span>
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

        <div class="home__contact-grid">
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
import { computed, markRaw, onMounted } from 'vue'
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

const router = useRouter()
const { isDark } = useTheme()

// 使用数据服务
const { featuredProjects, loadProjects } = useProjects()
const { skills, loadSkills } = useSkills()
const { socialLinks, loadSocialLinks } = useSocialLinks()

// 加载数据
const loadData = async () => {
  try {
    await Promise.all([
      loadProjects({ status: 'published', featured: true }),
      loadSkills(),
      loadSocialLinks(),
    ])
  } catch (error) {
    console.error('Failed to load data:', error)
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
  const iconMap: Record<string, any> = {
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

// 处理技能图标
const skillsWithIcons = computed(() =>
  skills.value.map((skill) => ({
    ...skill,
    icon: getIconComponent(skill.name),
  })),
)

// 处理社交链接图标
const socialLinksWithIcons = computed(() =>
  socialLinks.value.map((link) => ({
    ...link,
    icon: getIconComponent(link.name),
  })),
)

// 滚动到项目区域
const scrollToProjects = () => {
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
}

// 滚动到联系方式
const scrollToContact = () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}

// 打开项目
const openProject = (project: any) => {
  const url = project.demo_url || project.github_url || '#'
  if (url !== '#') {
    window.open(url, '_blank')
  } else {
    // 如果没有外部链接，跳转到项目详情页
    router.push(`/project/${project.id}`)
  }
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
}

.home__project-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
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
