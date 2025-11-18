<template>
  <div class="skeleton-loader">
    <!-- 项目卡片骨架屏 -->
    <div v-if="type === 'project-card'" class="skeleton-card">
      <div class="skeleton-card__image"></div>
      <div class="skeleton-card__content">
        <div class="skeleton-card__title"></div>
        <div class="skeleton-card__description">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
        <div class="skeleton-card__tags">
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
        </div>
      </div>
    </div>

    <!-- 技能卡片骨架屏 -->
    <div v-else-if="type === 'skill-card'" class="skeleton-skill">
      <div class="skeleton-skill__icon"></div>
      <div class="skeleton-skill__name"></div>
      <div class="skeleton-skill__progress">
        <div class="skeleton-progress-bar"></div>
      </div>
    </div>

    <!-- 联系方式骨架屏 -->
    <div v-else-if="type === 'contact-item'" class="skeleton-contact">
      <div class="skeleton-contact__icon"></div>
      <div class="skeleton-contact__text"></div>
    </div>

    <!-- 列表骨架屏 -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in count" :key="i" class="skeleton-list__item">
        <div class="skeleton-list__avatar"></div>
        <div class="skeleton-list__content">
          <div class="skeleton-list__title"></div>
          <div class="skeleton-list__subtitle"></div>
        </div>
      </div>
    </div>

    <!-- 文本骨架屏 -->
    <div v-else-if="type === 'text'" class="skeleton-text">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-line"
        :class="{ 'skeleton-line--short': i === count, 'skeleton-line--medium': i % 3 === 0 }"
      ></div>
    </div>

    <!-- 通用卡片骨架屏 -->
    <div v-else class="skeleton-box" :style="{ width, height }"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'project-card' | 'skill-card' | 'contact-item' | 'list' | 'text' | 'box'
  count?: number
  width?: string
  height?: string
}

withDefaults(defineProps<Props>(), {
  type: 'box',
  count: 3,
  width: '100%',
  height: '200px',
})
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
}

/* 通用骨架屏样式 */
.skeleton-box {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line--short {
  width: 60%;
}

.skeleton-line--medium {
  width: 80%;
}

/* 项目卡片骨架屏 */
.skeleton-card {
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.skeleton-card__image {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-card__content {
  padding: 1.5rem;
}

.skeleton-card__title {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
  width: 70%;
}

.skeleton-card__description {
  margin-bottom: 16px;
}

.skeleton-card__tags {
  display: flex;
  gap: 8px;
}

.skeleton-tag {
  height: 24px;
  width: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 12px;
}

/* 技能卡片骨架屏 */
.skeleton-skill {
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.skeleton-skill__icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 50%;
  margin: 0 auto 1rem;
}

.skeleton-skill__name {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 1rem;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
}

.skeleton-skill__progress {
  width: 100%;
}

.skeleton-progress-bar {
  height: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

/* 联系方式骨架屏 */
.skeleton-contact {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.skeleton-contact__icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-contact__text {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  width: 80px;
}

/* 列表骨架屏 */
.skeleton-list {
  width: 100%;
}

.skeleton-list__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.skeleton-list__avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-list__content {
  flex: 1;
}

.skeleton-list__title {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
  width: 60%;
}

.skeleton-list__subtitle {
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  width: 40%;
}

/* 动画 */
@keyframes skeleton-loading {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* 深色模式适配 */
[data-theme='dark'] .skeleton-box,
[data-theme='dark'] .skeleton-line,
[data-theme='dark'] .skeleton-card__image,
[data-theme='dark'] .skeleton-card__title,
[data-theme='dark'] .skeleton-tag,
[data-theme='dark'] .skeleton-skill__icon,
[data-theme='dark'] .skeleton-skill__name,
[data-theme='dark'] .skeleton-progress-bar,
[data-theme='dark'] .skeleton-contact__icon,
[data-theme='dark'] .skeleton-contact__text,
[data-theme='dark'] .skeleton-list__avatar,
[data-theme='dark'] .skeleton-list__title,
[data-theme='dark'] .skeleton-list__subtitle {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skeleton-card__image {
    height: 150px;
  }

  .skeleton-card__content {
    padding: 1rem;
  }

  .skeleton-skill {
    padding: 1.5rem;
  }

  .skeleton-contact {
    padding: 1rem;
  }
}
</style>
